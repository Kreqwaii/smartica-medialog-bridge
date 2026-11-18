(() => {
  'use strict';

  const SMARTICA_ENCOUNTER_ID = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

  const CASES = {
    therapist: {
      encounterId: 'ENC-2026-0419-01',
      doctorName: 'Иванова Анна Сергеевна',
      doctorEmail: 'a.ivanova@medialog-clinic.ru',
      templateName: 'Первичный осмотр врача-терапевта',
      transcript: [
        'Врач: Здравствуйте! На что жалуетесь сегодня?',
        'Пациент: Добрый день, доктор. Третий день температура до 38.4, сухой кашель, ломота в теле и слабость.',
        'Врач: Одышка, боли в грудной клетке есть? Чем-то лечились?',
        'Пациент: Одышки нет, только першение в горле. Принимал парацетамол 500 мг на ночь, температура снижалась до 37.2.',
        'Врач: Хорошо, сейчас послушаем лёгкие, измерим сатурацию и температуру. По результатам назначим ОАК, СРБ и рентген ОГК.'
      ].join('\n'),
      fields: {
        complaints: 'Повышение температуры тела до 38.4 °C в течение 3 дней, сухой приступообразный кашель, першение в горле, выраженная общая слабость, миалгии.',
        anamnesis_morbi: 'Считает себя больным с 16.11.2026, когда после переохлаждения отметил першение в горле и подъём температуры. Самостоятельно принимал парацетамол 500 мг с временным жаропонижающим эффектом.',
        status_praesens: 'Состояние удовлетворительное. Т 37.8 °C, SpO2 98%, ЧСС 86 уд/мин, АД 120/75 мм рт. ст. Зев умеренно гиперемирован, миндалины без налётов. В лёгких дыхание везикулярное, хрипов нет.',
        diagnosis_mkb10: 'J06.9 Острая инфекция верхних дыхательных путей неуточнённая',
        recommendations: '1. Обильное тёплое питьё, щадящий режим.\n2. Парацетамол 500 мг при температуре выше 38.5 °C.\n3. ОАК, СРБ, рентгенография ОГК.\n4. Повторный осмотр через 3 дня.'
      },
      suggestedServices: [
        {
          direction_id: 'DIR-101',
          direction_code: 'LAB-HEM',
          direction_name: 'Клинический анализ крови',
          service_id: 'SRV-1001',
          service_code: 'A01.05.001',
          service_name: 'Общий анализ крови (ОАК) с лейкоформулой и СОЭ'
        },
        {
          direction_id: 'DIR-102',
          direction_code: 'LAB-BIO',
          direction_name: 'Биохимические исследования',
          service_id: 'SRV-1042',
          service_code: 'A09.05.009',
          service_name: 'С-реактивный белок (СРБ), количественно'
        },
        {
          direction_id: 'DIR-103',
          direction_code: 'RAD-XRAY',
          direction_name: 'Рентгенодиагностика',
          service_id: 'SRV-2010',
          service_code: 'A06.09.007',
          service_name: 'Рентгенография органов грудной клетки (ОГК) в 2 проекциях'
        }
      ]
    },
    cardio: {
      encounterId: 'ENC-2026-0419-02',
      doctorName: 'Петров Дмитрий Владимирович',
      doctorEmail: 'd.petrov@medialog-clinic.ru',
      templateName: 'Консультация врача-кардиолога',
      transcript: [
        'Врач: Расскажите, как давно беспокоят перебои в сердце и давление?',
        'Пациент: Последние две недели к вечеру поднимается давление до 160/95, иногда чувствую учащённое сердцебиение и тяжесть в затылке.',
        'Врач: Боли за грудиной при нагрузке, отёки на ногах отмечаете?',
        'Пациент: При быстрой ходьбе появляется лёгкая одышка, но болей нет. Отёков тоже не замечал.',
        'Врач: Зафиксируем ЭКГ прямо сейчас, дополнительно выполним ЭхоКГ и проверим липидный спектр.'
      ].join('\n'),
      fields: {
        complaints: 'Периодические подъёмы АД до 160/95 мм рт. ст. в вечернее время, ощущение учащённого сердцебиения, тяжесть в затылочной области, умеренная одышка при быстрой ходьбе.',
        anamnesis_morbi: 'Артериальная гипертензия около 5 лет, регулярную гипотензивную терапию не получает. Ухудшение самочувствия отмечает последние 14 дней на фоне психоэмоциональной нагрузки.',
        status_praesens: 'Состояние удовлетворительное. АД 154/92 мм рт. ст., ЧСС 88 уд/мин, ритм правильный. Тоны сердца приглушены, акцент II тона над аортой. Периферических отёков нет.',
        diagnosis_mkb10: 'I11.9 Гипертензивная болезнь сердца без застойной сердечной недостаточности',
        recommendations: '1. Ограничение поваренной соли до 5 г/сутки, контроль АД 2 раза в день.\n2. ЭКГ в 12 отведениях, ЭхоКГ, липидный спектр.\n3. Повторная явка с результатами обследования через 5 дней.'
      },
      suggestedServices: [
        {
          direction_id: 'DIR-201',
          direction_code: 'FUNC-ECG',
          direction_name: 'Функциональная диагностика',
          service_id: 'SRV-3001',
          service_code: 'A05.10.006',
          service_name: 'Регистрация электрокардиограммы (ЭКГ) в 12 отведениях'
        },
        {
          direction_id: 'DIR-202',
          direction_code: 'US-CARDIO',
          direction_name: 'Ультразвуковая диагностика',
          service_id: 'SRV-3015',
          service_code: 'A04.10.002',
          service_name: 'Эхокардиография (ЭхоКГ) с допплерографией'
        },
        {
          direction_id: 'DIR-203',
          direction_code: 'LAB-LIPID',
          direction_name: 'Липидный обмен',
          service_id: 'SRV-1108',
          service_code: 'B03.005.002',
          service_name: 'Липидный спектр (ОХС, ЛПНП, ЛПВП, ТГ, индекс атерогенности)'
        }
      ]
    },
    neuro: {
      encounterId: 'ENC-2026-0419-03',
      doctorName: 'Соколова Елена Михайловна',
      doctorEmail: 'e.sokolova@medialog-clinic.ru',
      templateName: 'Первичный приём врача-невролога',
      transcript: [
        'Врач: Что вас привело на приём? Где именно локализуется боль?',
        'Пациент: Болит поясница уже неделю, и боль отдаёт по задней поверхности правой ноги до стопы.',
        'Врач: Онемение, покалывание в пальцах стопы или слабость в ноге есть?',
        'Пациент: Да, по наружному краю стопы лёгкое онемение, особенно когда долго сижу.',
        'Врач: Понятно. Проведём неврологический осмотр и направим на МРТ пояснично-крестцового отдела позвоночника.'
      ].join('\n'),
      fields: {
        complaints: 'Интенсивная тянущая боль в пояснично-крестцовом отделе позвоночника с иррадиацией по задне-наружной поверхности правой нижней конечности, чувство онемения по наружному краю правой стопы.',
        anamnesis_morbi: 'Обострение возникло 7 дней назад после подъёма тяжести. Самостоятельно применял местные НПВС-мази без выраженного эффекта.',
        status_praesens: 'В сознании, ориентирован. Симптом Ласега справа положительный с угла 45°. Болезненность при пальпации паравертебральных точек L4-S1 справа. Гипестезия в дерматоме S1 справа.',
        diagnosis_mkb10: 'M54.4 Люмбаго с ишиасом',
        recommendations: '1. Исключить осевые нагрузки и резкие наклоны.\n2. МРТ пояснично-крестцового отдела позвоночника.\n3. Повторная консультация невролога по результатам МРТ.'
      },
      suggestedServices: [
        {
          direction_id: 'DIR-301',
          direction_code: 'RAD-MRI',
          direction_name: 'Магнитно-резонансная томография',
          service_id: 'SRV-4002',
          service_code: 'A05.03.002',
          service_name: 'МРТ пояснично-крестцового отдела позвоночника'
        },
        {
          direction_id: 'DIR-302',
          direction_code: 'LAB-HEM',
          direction_name: 'Клинический анализ крови',
          service_id: 'SRV-1001',
          service_code: 'A01.05.001',
          service_name: 'Общий анализ крови (ОАК) с лейкоформулой'
        },
        {
          direction_id: 'DIR-303',
          direction_code: 'LAB-BIO',
          direction_name: 'Биохимические исследования',
          service_id: 'SRV-1042',
          service_code: 'A09.05.009',
          service_name: 'С-реактивный белок (СРБ), количественно'
        }
      ]
    }
  };

  const FIELD_MAP = [
    { id: 'complaints', label: 'Жалобы', elId: 'field_complaints' },
    { id: 'anamnesis_morbi', label: 'Анамнез заболевания', elId: 'field_anamnesis' },
    { id: 'status_praesens', label: 'Объективный статус', elId: 'field_objective' },
    { id: 'diagnosis_mkb10', label: 'Диагноз (МКБ-10)', elId: 'field_diagnosis' },
    { id: 'recommendations', label: 'Рекомендации и план', elId: 'field_plan' }
  ];

  const state = {
    caseKey: 'therapist',
    smarticaEncounterId: null,
    revision: 0,
    initialAiFields: null,
    toastTimer: null
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  function getCurrentCase() {
    return CASES[state.caseKey] || CASES.therapist;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function showToast(message) {
    let toast = $('#toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-visible');
    if (state.toastTimer) {
      clearTimeout(state.toastTimer);
    }
    state.toastTimer = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 3200);
  }

  function setDisabled(selector, disabled) {
    const el = $(selector);
    if (el) el.disabled = Boolean(disabled);
  }

  function setBadgeState(selector, mode) {
    const el = $(selector);
    if (!el) return;
    el.classList.remove('is-active', 'is-done');
    if (mode === 'active') el.classList.add('is-active');
    if (mode === 'done') el.classList.add('is-done');
  }

  function appendLog(method, path, reqObj, resObj, sqlNote) {
    const logList = $('#httpLogList');
    if (!logList) return;

    const entry = document.createElement('article');
    entry.className = 'http-log-entry';

    const time = new Date().toLocaleTimeString('ru-RU', { hour12: false });
    const reqJson = reqObj ? JSON.stringify(reqObj, null, 2) : '—';
    const resJson = resObj ? JSON.stringify(resObj, null, 2) : '—';

    entry.innerHTML = `
      <div class="http-log-head">
        <span class="http-method http-method--${escapeHtml(method.toLowerCase())}">${escapeHtml(method)}</span>
        <code class="http-path">${escapeHtml(path)}</code>
        <span class="http-time">${escapeHtml(time)}</span>
      </div>
      <div class="http-auth">Authorization: Bearer smc_live_****</div>
      <div class="http-bodies">
        <div class="http-block">
          <div class="http-block-title">Request</div>
          <pre>${escapeHtml(reqJson)}</pre>
        </div>
        <div class="http-block">
          <div class="http-block-title">Response</div>
          <pre>${escapeHtml(resJson)}</pre>
        </div>
      </div>
      ${sqlNote ? `<div class="http-sql"><strong>MS SQL (Медиалог):</strong> <code>${escapeHtml(sqlNote)}</code></div>` : ''}
    `;

    logList.prepend(entry);
  }

  function resetDemo() {
    const preset = getCurrentCase();
    state.smarticaEncounterId = null;
    state.revision = 0;
    state.initialAiFields = null;

    FIELD_MAP.forEach(({ elId }) => {
      const ta = $('#' + elId);
      if (ta) {
        ta.value = '';
        ta.classList.remove('is-filled');
      }
    });

    const urlBar = $('#smarticaUrlBar');
    if (urlBar) urlBar.textContent = 'https://smartica.ai/app/sso?token=—';

    const statusBadge = $('#smarticaStatusBadge');
    if (statusBadge) statusBadge.textContent = 'Ожидание SSO-запуска';

    const transcriptBox = $('#transcriptBox');
    if (transcriptBox) transcriptBox.textContent = '';

    const draftPreview = $('#smarticaDraftPreview');
    if (draftPreview) draftPreview.innerHTML = '';

    const suggestionsBox = $('#suggestionsBox');
    if (suggestionsBox) suggestionsBox.classList.add('is-hidden');

    const suggestionsItems = $('#suggestionsItems');
    if (suggestionsItems) suggestionsItems.innerHTML = '';

    const misOrdersList = $('#misOrdersList');
    if (misOrdersList) misOrdersList.innerHTML = '';

    setBadgeState('#stepBadge1', null);
    setBadgeState('#stepBadge2', null);
    setBadgeState('#stepBadge3', null);

    setDisabled('#btnLaunchSmartica', false);
    setDisabled('#btnSimulateDictation', true);
    setDisabled('#btnPollReady', true);
    setDisabled('#btnOpenSuggestions', true);
    setDisabled('#btnSaveMedialog', true);

    const encounterMeta = $('#encounterMeta');
    if (encounterMeta) {
      encounterMeta.textContent = `${preset.encounterId} • ${preset.doctorName} • ${preset.templateName}`;
    }
  }

  function handleSyncCatalog() {
    const preset = getCurrentCase();
    const items = preset.suggestedServices.map((s) => ({
      direction_id: s.direction_id,
      direction_code: s.direction_code,
      direction_name: s.direction_name,
      service_id: s.service_id,
      service_code: s.service_code,
      service_name: s.service_name
    }));

    appendLog(
      'PUT',
      '/api/v1/integrations/medialog/service-requests/catalog',
      { items },
      { status: 'ok', synced_count: items.length },
      'SELECT FM_SERV.SERV_ID, FM_SERV.CODE, FM_SERV.NAME, FM_DIR.DIR_ID FROM FM_SERV JOIN FM_DIR ON FM_DIR.DIR_ID = FM_SERV.DIR_ID'
    );
    showToast('Справочник услуг клиники синхронизирован (FM_SERV -> Smartica)');
  }

  function handleLaunchSmartica() {
    const preset = getCurrentCase();
    const reqBody = {
      user_email: preset.doctorEmail,
      user_full_name: preset.doctorName,
      encounter_id: preset.encounterId,
      template: preset.templateName,
      fields: FIELD_MAP.map(({ id, label }) => ({ id, label }))
    };
    const launchUrl = 'https://smartica.ai/app/sso?token=otk_9f8a7c2d1e4b';
    const resBody = {
      launch_url: launchUrl,
      expires_in: 60
    };

    appendLog(
      'POST',
      '/api/v1/integrations/medialog/sso/token',
      reqBody,
      resBody,
      `SELECT ENCOUNTER_ID, DOCTOR_EMAIL FROM DATA_AMBULAT WHERE ENCOUNTER_ID = '${preset.encounterId}'`
    );

    const urlBar = $('#smarticaUrlBar');
    if (urlBar) urlBar.textContent = launchUrl;

    const statusBadge = $('#smarticaStatusBadge');
    if (statusBadge) statusBadge.textContent = 'Сессия открыта (TTL 60s)';

    setBadgeState('#stepBadge1', 'active');
    setDisabled('#btnSimulateDictation', false);
  }

  function handleSimulateDictation() {
    const preset = getCurrentCase();
    state.smarticaEncounterId = SMARTICA_ENCOUNTER_ID;
    state.revision = 1;

    const transcriptBox = $('#transcriptBox');
    if (transcriptBox) transcriptBox.textContent = preset.transcript;

    const draftPreview = $('#smarticaDraftPreview');
    if (draftPreview) {
      draftPreview.innerHTML = FIELD_MAP.map(({ id, label }) => `
        <div class="draft-field">
          <div class="draft-field-label">${escapeHtml(label)}</div>
          <div class="draft-field-val">${escapeHtml(preset.fields[id] || '')}</div>
        </div>
      `).join('');
    }

    const statusBadge = $('#smarticaStatusBadge');
    if (statusBadge) statusBadge.textContent = 'Протокол готов: status=ready, rev=1';

    setDisabled('#btnPollReady', false);
  }

  function handlePollReady() {
    const preset = getCurrentCase();
    const encId = state.smarticaEncounterId || SMARTICA_ENCOUNTER_ID;

    appendLog(
      'GET',
      `/api/v1/integrations/medialog/encounters?user_email=${encodeURIComponent(preset.doctorEmail)}&status=ready`,
      null,
      {
        items: [
          {
            id: encId,
            external_encounter_id: preset.encounterId,
            status: 'ready',
            revision: 1
          }
        ]
      },
      null
    );

    const fieldsPayload = FIELD_MAP.map(({ id }) => ({
      id,
      value: preset.fields[id] || ''
    }));

    appendLog(
      'GET',
      `/api/v1/integrations/medialog/encounters/${encId}`,
      null,
      {
        id: encId,
        external_encounter_id: preset.encounterId,
        status: 'ready',
        revision: 1,
        fields: fieldsPayload
      },
      null
    );

    state.initialAiFields = {};
    FIELD_MAP.forEach(({ id, elId }) => {
      const value = preset.fields[id] || '';
      state.initialAiFields[id] = value;
      const ta = $('#' + elId);
      if (ta) {
        ta.value = value;
        ta.classList.add('is-filled');
      }
    });

    appendLog(
      'POST',
      `/api/v1/integrations/medialog/encounters/${encId}/ack`,
      { revision: 1 },
      { status: 'acknowledged', revision: 1 },
      `UPDATE DATA_AMBULAT SET COMPLAINTS = :complaints, ANAMNESIS = :anamnesis, OBJECTIVE = :objective, DIAGNOSIS = :diagnosis, PLAN = :plan WHERE ENCOUNTER_ID = '${preset.encounterId}'`
    );

    setBadgeState('#stepBadge1', 'done');
    setDisabled('#btnOpenSuggestions', false);
    setDisabled('#btnSaveMedialog', false);
  }

  function handleOpenSuggestions() {
    const preset = getCurrentCase();
    const encId = state.smarticaEncounterId || SMARTICA_ENCOUNTER_ID;

    appendLog(
      'POST',
      `/api/v1/integrations/medialog/encounters/${encId}/service-requests/suggestions/session`,
      { encounter_id: preset.encounterId, user_email: preset.doctorEmail },
      {
        session_id: 'sreq_sess_5512',
        suggestions: preset.suggestedServices
      },
      null
    );

    const suggestionsBox = $('#suggestionsBox');
    if (suggestionsBox) suggestionsBox.classList.remove('is-hidden');

    const suggestionsItems = $('#suggestionsItems');
    if (suggestionsItems) {
      suggestionsItems.innerHTML = preset.suggestedServices.map((srv, idx) => `
        <label class="suggestion-item">
          <input type="checkbox" class="srv-check" data-idx="${idx}" checked />
          <span class="suggestion-code">${escapeHtml(srv.service_code)}</span>
          <span class="suggestion-name">${escapeHtml(srv.service_name)}</span>
          <span class="suggestion-dir">${escapeHtml(srv.direction_name)}</span>
        </label>
      `).join('');
    }

    setBadgeState('#stepBadge2', 'active');
  }

  function handleCommitServices() {
    const preset = getCurrentCase();
    const encId = state.smarticaEncounterId || SMARTICA_ENCOUNTER_ID;
    const checks = $$('.srv-check');
    const selected = checks
      .filter((cb) => cb.checked)
      .map((cb) => preset.suggestedServices[Number(cb.dataset.idx)])
      .filter(Boolean);

    if (selected.length === 0) {
      showToast('Выберите хотя бы одну услугу для назначения');
      return;
    }

    appendLog(
      'POST',
      `/api/v1/integrations/medialog/encounters/${encId}/service-requests/commit`,
      {
        encounter_id: preset.encounterId,
        user_email: preset.doctorEmail,
        services: selected.map((s) => ({
          direction_id: s.direction_id,
          service_id: s.service_id,
          service_code: s.service_code
        }))
      },
      {
        status: 'committed',
        created_directions: selected.length
      },
      `INSERT INTO PATDIREC (ENCOUNTER_ID, DIR_ID, SERV_ID, CREATED_AT) VALUES ('${preset.encounterId}', ...)`
    );

    const misOrdersList = $('#misOrdersList');
    if (misOrdersList) {
      misOrdersList.innerHTML = selected.map((s) => `
        <li class="mis-order-item">
          <code>${escapeHtml(s.service_code)}</code>
          <span>${escapeHtml(s.service_name)}</span>
          <em>(${escapeHtml(s.direction_name)})</em>
        </li>
      `).join('');
    }

    setBadgeState('#stepBadge2', 'done');
    showToast(`Создано направлений в МИС: ${selected.length}`);
  }

  function handleSaveMedialog() {
    const preset = getCurrentCase();
    const encId = state.smarticaEncounterId || SMARTICA_ENCOUNTER_ID;

    let editedCount = 0;
    const fields = FIELD_MAP.map(({ id, elId }) => {
      const ta = $('#' + elId);
      const value = ta ? ta.value : '';
      if (state.initialAiFields && state.initialAiFields[id] !== value) {
        editedCount += 1;
      }
      return { id, value };
    });

    const reqBody = {
      base_revision: state.revision || 1,
      status: 'final',
      saved_at: new Date().toISOString(),
      user_email: preset.doctorEmail,
      fields
    };

    appendLog(
      'POST',
      `/api/v1/integrations/medialog/encounters/${encId}/versions`,
      reqBody,
      {
        status: 'saved',
        new_revision: (state.revision || 1) + 1,
        edited_fields_count: editedCount
      },
      `UPDATE DATA_AMBULAT SET IS_FINAL = 1, EDITED_FIELDS = ${editedCount} WHERE ENCOUNTER_ID = '${preset.encounterId}'`
    );

    setBadgeState('#stepBadge3', 'done');
    showToast('Финальная версия протокола сохранена в МИС и отправлена в Smartica (versions)');
  }

  function initArchTabs() {
    const buttons = $$('.arch-tab-btn[data-arch]');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.arch;
        buttons.forEach((b) => b.classList.toggle('is-active', b === btn));
        $$('.arch-panel').forEach((panel) => {
          panel.classList.toggle('is-active', panel.dataset.arch === target || panel.id === target);
        });
      });
    });
  }

  function init() {
    const caseSelect = $('#caseSelect');
    if (caseSelect) {
      state.caseKey = caseSelect.value in CASES ? caseSelect.value : 'therapist';
      caseSelect.addEventListener('change', (e) => {
        state.caseKey = e.target.value in CASES ? e.target.value : 'therapist';
        resetDemo();
      });
    }

    const bindClick = (selector, handler) => {
      const el = $(selector);
      if (el) el.addEventListener('click', handler);
    };

    bindClick('#btnResetDemo', resetDemo);
    bindClick('#btnSyncCatalog', handleSyncCatalog);
    bindClick('#btnLaunchSmartica', handleLaunchSmartica);
    bindClick('#btnSimulateDictation', handleSimulateDictation);
    bindClick('#btnPollReady', handlePollReady);
    bindClick('#btnOpenSuggestions', handleOpenSuggestions);
    bindClick('#btnCommitServices', handleCommitServices);
    bindClick('#btnSaveMedialog', handleSaveMedialog);

    initArchTabs();
    resetDemo();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
