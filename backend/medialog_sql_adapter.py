"""
Medialog MIS (7.11 / 8.x) MS SQL Adapter & Local SQLite Idempotency Store.

Maps Medialog's core clinical tables to Smartica.ai's JSON schemas:
- `MED_PERS`     : Doctor profile (email, FIO)
- `DATA_AMBULAT` : Ambulatory encounter record & dynamic EMR form fields
- `FM_SERV`      : Clinic service catalog
- `FM_DIR`       : Direction / department catalog
- `PATDIREC`     : Created patient directions / service requests

Also provides `LocalSyncStateStore` (SQLite) for:
- Mapping `encounter_id` (Medialog) <-> `smartica_encounter_id` (Smartica UUID)
- Tracking `revision` and `ack_status` for idempotent polling
- Queuing failed outbound `/versions` or `/commit` calls for retry
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
import json
import sqlite3
from typing import Any, Optional

import pyodbc


@dataclass(frozen=True)
class DoctorProfile:
    med_pers_id: int
    email: str
    full_name: str


class MedialogSQLAdapter:
    """MS SQL Server (pyodbc) adapter for Medialog 7.11 / 8.x."""

    def __init__(self, connection_string: str) -> None:
        self.connection_string = connection_string

    def _connect(self) -> pyodbc.Connection:
        return pyodbc.connect(self.connection_string, timeout=10)

    def get_doctor_profile(self, med_pers_id: int) -> Optional[DoctorProfile]:
        """Fetch doctor email and full name from MED_PERS."""
        query = """
            SELECT
                MED_PERS_ID,
                COALESCE(EMAIL, '') AS EMAIL,
                LTRIM(RTRIM(
                    COALESCE(SURNAME, '') + ' ' +
                    COALESCE(NAME, '') + ' ' +
                    COALESCE(PATRONYMIC, '')
                )) AS FULL_NAME
            FROM MED_PERS
            WHERE MED_PERS_ID = ?
        """
        with self._connect() as conn:
            row = conn.cursor().execute(query, (med_pers_id,)).fetchone()
            if not row:
                return None
            return DoctorProfile(
                med_pers_id=int(row.MED_PERS_ID),
                email=str(row.EMAIL).strip(),
                full_name=" ".join(str(row.FULL_NAME).split()),
            )

    def get_encounter_fields(self, encounter_id: int) -> list[dict[str, str]]:
        """
        Read dynamic EMR form fields for an encounter from DATA_AMBULAT.
        Returns Smartica-compatible `[{id, label}]` list.
        """
        query = """
            SELECT
                CAST(FIELD_ID AS VARCHAR(64)) AS id,
                COALESCE(FIELD_LABEL, FIELD_NAME, CAST(FIELD_ID AS VARCHAR(64))) AS label
            FROM DATA_AMBULAT
            WHERE MOTCONSU_ID = ?
              AND ISNULL(IS_ACTIVE, 1) = 1
            ORDER BY SORT_ORDER ASC, FIELD_ID ASC
        """
        with self._connect() as conn:
            rows = conn.cursor().execute(query, (encounter_id,)).fetchall()
            return [{"id": str(r.id), "label": str(r.label)} for r in rows]

    def write_protocol_fields(
        self,
        encounter_id: int,
        fields: list[dict[str, Any]],
    ) -> int:
        """
        Write completed Smartica protocol fields back into DATA_AMBULAT.
        Returns number of updated rows.
        """
        update_sql = """
            UPDATE DATA_AMBULAT
            SET FIELD_VALUE = ?, UPDATED_AT = GETDATE()
            WHERE MOTCONSU_ID = ? AND CAST(FIELD_ID AS VARCHAR(64)) = ?
        """
        updated = 0
        with self._connect() as conn:
            cursor = conn.cursor()
            for field in fields:
                cursor.execute(
                    update_sql,
                    (str(field.get("value", "")), encounter_id, str(field["id"])),
                )
                updated += cursor.rowcount
            conn.commit()
        return updated

    def get_service_catalog(self) -> list[dict[str, str]]:
        """
        Read clinic service catalog joining FM_SERV and FM_DIR.
        Returns Smartica-compatible `ServiceCatalogItem` dicts.
        """
        query = """
            SELECT
                CAST(d.FM_DIR_ID AS VARCHAR(64)) AS direction_id,
                COALESCE(d.CODE, '') AS direction_code,
                COALESCE(d.NAME, '') AS direction_name,
                CAST(s.FM_SERV_ID AS VARCHAR(64)) AS service_id,
                COALESCE(s.CODE, '') AS service_code,
                COALESCE(s.NAME, '') AS service_name
            FROM FM_SERV s
            INNER JOIN FM_DIR d ON d.FM_DIR_ID = s.FM_DIR_ID
            WHERE ISNULL(s.IS_ACTIVE, 1) = 1
              AND ISNULL(d.IS_ACTIVE, 1) = 1
        """
        with self._connect() as conn:
            rows = conn.cursor().execute(query).fetchall()
            return [
                {
                    "direction_id": str(r.direction_id),
                    "direction_code": str(r.direction_code),
                    "direction_name": str(r.direction_name),
                    "service_id": str(r.service_id),
                    "service_code": str(r.service_code),
                    "service_name": str(r.service_name),
                }
                for r in rows
            ]

    def create_patient_directions(
        self,
        encounter_id: int,
        patient_id: int,
        doctor_id: int,
        items: list[dict[str, Any]],
    ) -> list[int]:
        """
        Insert committed Smartica service requests into PATDIREC.
        Returns list of created PATDIREC_ID values.
        """
        insert_sql = """
            INSERT INTO PATDIREC (
                MOTCONSU_ID, PATIENTS_ID, MED_PERS_ID,
                FM_DIR_ID, FM_SERV_ID, QUANTITY, COMMENT, CREATED_AT
            )
            OUTPUT INSERTED.PATDIREC_ID
            VALUES (?, ?, ?, ?, ?, ?, ?, GETDATE())
        """
        created_ids: list[int] = []
        with self._connect() as conn:
            cursor = conn.cursor()
            for item in items:
                row = cursor.execute(
                    insert_sql,
                    (
                        encounter_id,
                        patient_id,
                        doctor_id,
                        int(item["direction_id"]),
                        int(item["service_id"]),
                        int(item.get("quantity", 1)),
                        item.get("comment"),
                    ),
                ).fetchone()
                if row:
                    created_ids.append(int(row[0]))
            conn.commit()
        return created_ids


class LocalSyncStateStore:
    """
    Lightweight SQLite idempotency & retry store for the Medialog bridge.
    Prevents duplicate protocol writes and queues failed outbound calls.
    """

    def __init__(self, db_path: str = "smartica_bridge_state.db") -> None:
        self.db_path = db_path
        self._init_schema()

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_schema(self) -> None:
        with self._connect() as conn:
            conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS encounter_sync (
                    encounter_id TEXT PRIMARY KEY,
                    smartica_encounter_id TEXT UNIQUE,
                    last_revision INTEGER NOT NULL DEFAULT 0,
                    ack_status TEXT NOT NULL DEFAULT 'pending',
                    updated_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS retry_queue (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    operation TEXT NOT NULL,
                    target_id TEXT NOT NULL,
                    payload_json TEXT NOT NULL,
                    attempts INTEGER NOT NULL DEFAULT 0,
                    last_error TEXT,
                    created_at TEXT NOT NULL
                );
                """
            )

    def upsert_encounter_mapping(
        self,
        encounter_id: str,
        smartica_encounter_id: str,
        revision: int,
        ack_status: str = "accepted",
    ) -> None:
        now = datetime.now(timezone.utc).isoformat()
        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO encounter_sync (
                    encounter_id, smartica_encounter_id, last_revision, ack_status, updated_at
                )
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(encounter_id) DO UPDATE SET
                    smartica_encounter_id = excluded.smartica_encounter_id,
                    last_revision = excluded.last_revision,
                    ack_status = excluded.ack_status,
                    updated_at = excluded.updated_at
                """,
                (str(encounter_id), smartica_encounter_id, int(revision), ack_status, now),
            )

    def is_revision_processed(self, smartica_encounter_id: str, revision: int) -> bool:
        with self._connect() as conn:
            row = conn.execute(
                """
                SELECT last_revision, ack_status
                FROM encounter_sync
                WHERE smartica_encounter_id = ?
                """,
                (smartica_encounter_id,),
            ).fetchone()
            if not row:
                return False
            return int(row["last_revision"]) >= int(revision) and row["ack_status"] == "accepted"

    def enqueue_retry(
        self,
        operation: str,
        target_id: str,
        payload: dict[str, Any],
        error: str,
    ) -> int:
        now = datetime.now(timezone.utc).isoformat()
        with self._connect() as conn:
            cur = conn.execute(
                """
                INSERT INTO retry_queue (operation, target_id, payload_json, attempts, last_error, created_at)
                VALUES (?, ?, ?, 1, ?, ?)
                """,
                (operation, target_id, json.dumps(payload, ensure_ascii=False), error, now),
            )
            return int(cur.lastrowid)

    def list_pending_retries(self, limit: int = 50) -> list[dict[str, Any]]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT * FROM retry_queue ORDER BY id ASC LIMIT ?",
                (limit,),
            ).fetchall()
            return [dict(r) for r in rows]
