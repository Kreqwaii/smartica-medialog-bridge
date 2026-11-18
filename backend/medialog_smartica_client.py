"""
Smartica.ai <-> Medialog MIS HTTP Client (Launch Pull Integration).

Implements all 3 official Smartica.ai integration workflows against:
    https://smartica.ai/api/v1/integrations/medialog

Provides both synchronous (`MedialogSmarticaClient`) and asynchronous
(`AsyncMedialogSmarticaClient`) clients backed by `httpx` with TLS 1.2+,
Bearer token auth, Pydantic v2 validation, and structured error handling.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Literal, Optional
import httpx
from pydantic import BaseModel, Field


DEFAULT_BASE_URL = "https://smartica.ai/api/v1/integrations/medialog"


class SmarticaAPIError(RuntimeError):
    """Raised when Smartica.ai returns a non-2xx HTTP response."""

    def __init__(self, status_code: int, message: str, payload: Any = None) -> None:
        super().__init__(f"Smartica API error {status_code}: {message}")
        self.status_code = status_code
        self.payload = payload


# ---------------------------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------------------------


class FormFieldDefinition(BaseModel):
    id: str = Field(..., description="Medialog form field identifier")
    label: str = Field(..., description="Human-readable field label")


class FormFieldValue(BaseModel):
    id: str = Field(..., description="Medialog form field identifier")
    value: str = Field("", description="Field text value")


class ServiceCatalogItem(BaseModel):
    direction_id: str
    direction_code: str
    direction_name: str
    service_id: str
    service_code: str
    service_name: str


class SelectedServiceItem(BaseModel):
    direction_id: str
    service_id: str
    service_code: Optional[str] = None
    service_name: Optional[str] = None
    quantity: int = 1
    comment: Optional[str] = None


# ---------------------------------------------------------------------------
# Shared Request/Response Helpers
# ---------------------------------------------------------------------------


def _build_headers(api_key: str) -> dict[str, str]:
    return {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }


def _handle_response(response: httpx.Response) -> dict[str, Any]:
    if response.status_code >= 400:
        try:
            payload = response.json()
            detail = payload.get("detail") or payload.get("message") or response.text
        except Exception:
            payload = response.text
            detail = response.text
        raise SmarticaAPIError(response.status_code, str(detail), payload=payload)

    if not response.content:
        return {}
    return response.json()


# ---------------------------------------------------------------------------
# Synchronous Client
# ---------------------------------------------------------------------------


class MedialogSmarticaClient:
    """Synchronous httpx client for Smartica.ai Medialog integration."""

    def __init__(
        self,
        api_key: str,
        base_url: str = DEFAULT_BASE_URL,
        timeout: float = 20.0,
        transport: Optional[httpx.BaseTransport] = None,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self._client = httpx.Client(
            base_url=self.base_url,
            headers=_build_headers(api_key),
            timeout=timeout,
            transport=transport,
        )

    def close(self) -> None:
        self._client.close()

    def __enter__(self) -> MedialogSmarticaClient:
        return self

    def __exit__(self, *_: Any) -> None:
        self.close()

    # --- Workflow 1: Launch & Pull ---

    def create_sso_launch_token(
        self,
        user_email: str,
        user_full_name: str,
        encounter_id: str,
        template: str,
        fields: list[dict[str, str] | FormFieldDefinition],
    ) -> dict[str, Any]:
        """POST /sso/token -> returns {launch_url, expires_in}."""
        normalized_fields = [
            f.model_dump() if isinstance(f, FormFieldDefinition) else f for f in fields
        ]
        payload = {
            "user_email": user_email,
            "user_full_name": user_full_name,
            "encounter_id": str(encounter_id),
            "template": template,
            "fields": normalized_fields,
        }
        resp = self._client.post("/sso/token", json=payload)
        return _handle_response(resp)

    def stop_encounter(self, encounter_id: str) -> dict[str, Any]:
        """POST /encounters/{encounter_id}/stop -> {status: stopping | finished}."""
        resp = self._client.post(f"/encounters/{encounter_id}/stop")
        return _handle_response(resp)

    def list_ready_encounters(
        self,
        user_email: str,
        user_full_name: str,
        status: Literal["processing", "ready"] = "ready",
        cursor: Optional[str] = None,
    ) -> dict[str, Any]:
        """GET /encounters -> {encounters: [...], next_cursor}."""
        params: dict[str, str] = {
            "user_email": user_email,
            "user_full_name": user_full_name,
            "status": status,
        }
        if cursor:
            params["cursor"] = cursor
        resp = self._client.get("/encounters", params=params)
        return _handle_response(resp)

    def fetch_and_ack_protocol(self, smartica_encounter_id: str) -> dict[str, Any]:
        """
        GET /encounters/{id} + POST /encounters/{id}/ack ({"revision": rev}).
        Returns the full protocol payload after acknowledging receipt.
        """
        protocol_resp = self._client.get(f"/encounters/{smartica_encounter_id}")
        protocol = _handle_response(protocol_resp)

        revision = protocol.get("revision")
        if revision is None:
            raise SmarticaAPIError(
                500,
                f"Protocol response for {smartica_encounter_id} missing 'revision'",
                payload=protocol,
            )

        ack_resp = self._client.post(
            f"/encounters/{smartica_encounter_id}/ack",
            json={"revision": int(revision)},
        )
        ack_data = _handle_response(ack_resp)
        protocol["ack"] = ack_data
        return protocol

    # --- Workflow 2: Service Requests ---

    def sync_service_catalog(
        self,
        items: list[dict[str, Any] | ServiceCatalogItem],
    ) -> dict[str, Any]:
        """PUT /service-requests/catalog -> full replace of clinic service catalog."""
        normalized = [
            item.model_dump() if isinstance(item, ServiceCatalogItem) else item
            for item in items
        ]
        resp = self._client.put("/service-requests/catalog", json={"items": normalized})
        return _handle_response(resp)

    def get_service_catalog(self) -> dict[str, Any]:
        """GET /service-requests/catalog."""
        resp = self._client.get("/service-requests/catalog")
        return _handle_response(resp)

    def create_suggestions_session(self, encounter_id: str) -> dict[str, Any]:
        """POST /encounters/{encounter_id}/service-requests/suggestions/session."""
        resp = self._client.post(
            f"/encounters/{encounter_id}/service-requests/suggestions/session"
        )
        return _handle_response(resp)

    def commit_service_requests(
        self,
        encounter_id: str,
        selected_items: list[dict[str, Any] | SelectedServiceItem],
    ) -> dict[str, Any]:
        """POST /encounters/{encounter_id}/service-requests/commit."""
        normalized = [
            item.model_dump(exclude_none=True)
            if isinstance(item, SelectedServiceItem)
            else item
            for item in selected_items
        ]
        resp = self._client.post(
            f"/encounters/{encounter_id}/service-requests/commit",
            json={"items": normalized},
        )
        return _handle_response(resp)

    # --- Workflow 3: Protocol Corrections ---

    def submit_protocol_version(
        self,
        smartica_encounter_id: str,
        base_revision: int,
        fields: list[dict[str, str] | FormFieldValue],
        user_email: Optional[str] = None,
        status: Literal["draft", "final"] = "final",
        saved_at: Optional[str] = None,
    ) -> dict[str, Any]:
        """POST /encounters/{smartica_encounter_id}/versions."""
        normalized_fields = [
            f.model_dump() if isinstance(f, FormFieldValue) else f for f in fields
        ]
        payload: dict[str, Any] = {
            "base_revision": int(base_revision),
            "fields": normalized_fields,
            "status": status,
            "saved_at": saved_at or datetime.now(timezone.utc).isoformat(),
        }
        if user_email:
            payload["user_email"] = user_email
        resp = self._client.post(
            f"/encounters/{smartica_encounter_id}/versions",
            json=payload,
        )
        return _handle_response(resp)


# ---------------------------------------------------------------------------
# Asynchronous Client
# ---------------------------------------------------------------------------


class AsyncMedialogSmarticaClient:
    """Asynchronous httpx client for Smartica.ai Medialog integration."""

    def __init__(
        self,
        api_key: str,
        base_url: str = DEFAULT_BASE_URL,
        timeout: float = 20.0,
        transport: Optional[httpx.AsyncBaseTransport] = None,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self._client = httpx.AsyncClient(
            base_url=self.base_url,
            headers=_build_headers(api_key),
            timeout=timeout,
            transport=transport,
        )

    async def aclose(self) -> None:
        await self._client.aclose()

    async def __aenter__(self) -> AsyncMedialogSmarticaClient:
        return self

    async def __aexit__(self, *_: Any) -> None:
        await self.aclose()

    async def create_sso_launch_token(
        self,
        user_email: str,
        user_full_name: str,
        encounter_id: str,
        template: str,
        fields: list[dict[str, str] | FormFieldDefinition],
    ) -> dict[str, Any]:
        normalized_fields = [
            f.model_dump() if isinstance(f, FormFieldDefinition) else f for f in fields
        ]
        payload = {
            "user_email": user_email,
            "user_full_name": user_full_name,
            "encounter_id": str(encounter_id),
            "template": template,
            "fields": normalized_fields,
        }
        resp = await self._client.post("/sso/token", json=payload)
        return _handle_response(resp)

    async def stop_encounter(self, encounter_id: str) -> dict[str, Any]:
        resp = await self._client.post(f"/encounters/{encounter_id}/stop")
        return _handle_response(resp)

    async def list_ready_encounters(
        self,
        user_email: str,
        user_full_name: str,
        status: Literal["processing", "ready"] = "ready",
        cursor: Optional[str] = None,
    ) -> dict[str, Any]:
        params: dict[str, str] = {
            "user_email": user_email,
            "user_full_name": user_full_name,
            "status": status,
        }
        if cursor:
            params["cursor"] = cursor
        resp = await self._client.get("/encounters", params=params)
        return _handle_response(resp)

    async def fetch_and_ack_protocol(self, smartica_encounter_id: str) -> dict[str, Any]:
        protocol_resp = await self._client.get(f"/encounters/{smartica_encounter_id}")
        protocol = _handle_response(protocol_resp)

        revision = protocol.get("revision")
        if revision is None:
            raise SmarticaAPIError(
                500,
                f"Protocol response for {smartica_encounter_id} missing 'revision'",
                payload=protocol,
            )

        ack_resp = await self._client.post(
            f"/encounters/{smartica_encounter_id}/ack",
            json={"revision": int(revision)},
        )
        protocol["ack"] = _handle_response(ack_resp)
        return protocol

    async def sync_service_catalog(
        self,
        items: list[dict[str, Any] | ServiceCatalogItem],
    ) -> dict[str, Any]:
        normalized = [
            item.model_dump() if isinstance(item, ServiceCatalogItem) else item
            for item in items
        ]
        resp = await self._client.put("/service-requests/catalog", json={"items": normalized})
        return _handle_response(resp)

    async def get_service_catalog(self) -> dict[str, Any]:
        resp = await self._client.get("/service-requests/catalog")
        return _handle_response(resp)

    async def create_suggestions_session(self, encounter_id: str) -> dict[str, Any]:
        resp = await self._client.post(
            f"/encounters/{encounter_id}/service-requests/suggestions/session"
        )
        return _handle_response(resp)

    async def commit_service_requests(
        self,
        encounter_id: str,
        selected_items: list[dict[str, Any] | SelectedServiceItem],
    ) -> dict[str, Any]:
        normalized = [
            item.model_dump(exclude_none=True)
            if isinstance(item, SelectedServiceItem)
            else item
            for item in selected_items
        ]
        resp = await self._client.post(
            f"/encounters/{encounter_id}/service-requests/commit",
            json={"items": normalized},
        )
        return _handle_response(resp)

    async def submit_protocol_version(
        self,
        smartica_encounter_id: str,
        base_revision: int,
        fields: list[dict[str, str] | FormFieldValue],
        user_email: Optional[str] = None,
        status: Literal["draft", "final"] = "final",
        saved_at: Optional[str] = None,
    ) -> dict[str, Any]:
        normalized_fields = [
            f.model_dump() if isinstance(f, FormFieldValue) else f for f in fields
        ]
        payload: dict[str, Any] = {
            "base_revision": int(base_revision),
            "fields": normalized_fields,
            "status": status,
            "saved_at": saved_at or datetime.now(timezone.utc).isoformat(),
        }
        if user_email:
            payload["user_email"] = user_email
        resp = await self._client.post(
            f"/encounters/{smartica_encounter_id}/versions",
            json=payload,
        )
        return _handle_response(resp)
