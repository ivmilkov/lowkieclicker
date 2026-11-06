// Синхронизация прогресса с Telegram-аккаунтом.
// Грузится ПОСЛЕ script.js. Вне Telegram (обычный браузер) ничего не делает — игра работает локально как раньше.
(function () {
  const tg = window.Telegram && window.Telegram.WebApp;
  const initData = tg && tg.initData;
  if (!initData) { console.log('[cloud] вне Telegram — локальный режим'); return; }

  try { tg.ready(); tg.expand(); } catch (e) {}

  const API = '/.netlify/functions/game';
  const META_KEY = 'lowkie_cloud_meta';
  const DIRTY_KEY = 'lowkie_cloud_dirty';
  const DEVICE_KEY = 'lowkie_cloud_device';
  const EXTRA_KEYS = ['lowkie_little_last', 'lowkie_wheel_last'];
  const MAX_HISTORY = 200;

  const tgUser = (tg.initDataUnsafe && tg.initDataUnsafe.user) || {};
  const uid = tgUser.id;
  if (!uid) return;
  const nick = tgUser.username
    ? '@' + tgUser.username
    : ([tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') || 'player_' + uid);

  // уникальный id этого устройства, чтобы сервер отличал «свои» записи от чужих
  let deviceId = null;
  try { deviceId = localStorage.getItem(DEVICE_KEY); } catch (e) {}
  if (!deviceId) {
    deviceId = 'd' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    try { localStorage.setItem(DEVICE_KEY, deviceId); } catch (e) {}
  }

  let ready = false;
  let adopting = false;
  let dirty = false;
  let inflight = false;
  let bankBusy = false; // идёт банковская операция: обычную отправку сохранения на это время придерживаем
  let meta = readMeta();

  function readMeta() {
    try { const m = JSON.parse(localStorage.getItem(META_KEY)); if (m && typeof m === 'object') return m; } catch (e) {}
    return { uid: null, rev: 0 };
  }
  function writeMeta(m) {
    meta = m;
    try { localStorage.setItem(META_KEY, JSON.stringify(m)); } catch (e) {}
  }
  // «есть несохранённые на сервер изменения» — помним даже после перезапуска игры
  function setDirty(v) {
    dirty = v;
    try { if (v) localStorage.setItem(DIRTY_KEY, '1'); else localStorage.removeItem(DIRTY_KEY); } catch (e) {}
  }
  function wasDirty() {
    try { return localStorage.getItem(DIRTY_KEY) === '1'; } catch (e) { return false; }
  }

  // --- экран загрузки, чтобы игрок не тапал до синхронизации ---
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:100000;background:#071226;color:#9aa6b2;display:flex;align-items:center;justify-content:center;font:700 16px system-ui,sans-serif';
  overlay.textContent = 'загрузка прогресса…';
  document.body.appendChild(overlay);
  let leaving = false; // уходим на другую страницу (банк <-> игра): экран загрузки не убираем, чтобы не мелькал интерфейс
  function hideOverlay() { if (!leaving) overlay.remove(); }

  // ник, заданный из админки, script.js не знает — подхватим флаг из сохранения сами
  try {
    const rawSaved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (rawSaved && rawSaved.nickOverride) state.nickOverride = true;
  } catch (e) {}

  // --- перехват save(): любое сохранение игры помечает данные как «надо отправить» ---
  const origSave = save;
  save = function () {
    if (adopting) return;
    origSave();
    setDirty(true);
  };

  // --- траты игрока: уходят на сервер вместе с сохранением и попадают в «Казну» админки ---
  const SPEND_KEY = 'lowkie_cloud_spends';
  let outbox = [];
  try { const o = JSON.parse(localStorage.getItem(SPEND_KEY)); if (Array.isArray(o)) outbox = o.slice(-200); } catch (e) {}
  function saveOutbox() {
    try { if (outbox.length) localStorage.setItem(SPEND_KEY, JSON.stringify(outbox)); else localStorage.removeItem(SPEND_KEY); } catch (e) {}
  }
  // "-1 763,5 монет" / "-567 алм." -> { currency, amount }
  function parseSpend(str) {
    const s = String(str || '');
    const currency = /алм/i.test(s) ? 'diamonds' : (/монет/i.test(s) ? 'coins' : null);
    const m = s.match(/\d[\d\s\u00a0\u202f]*(?:,\d+)?/);
    if (!currency || !m) return null;
    const amount = parseFloat(m[0].replace(/[\s\u00a0\u202f]/g, '').replace(',', '.'));
    return Number.isFinite(amount) && amount > 0 ? { currency, amount } : null;
  }
  // у лотереи билет списывается всегда, даже при выигрыше (в истории тогда только «Выигрыш»), поэтому запоминаем билет
  let lastLotteryTicket = null;
  if (typeof playLottery === 'function') {
    const origPlayLottery = playLottery;
    playLottery = function (ticket) { lastLotteryTicket = ticket; return origPlayLottery.apply(this, arguments); };
  }
  function recordSpend(type, title, amountDisplay) {
    let currency, amount;
    if (title === 'Лотерея' && lastLotteryTicket) {
      currency = 'diamonds'; amount = Number(lastLotteryTicket.cost); lastLotteryTicket = null;
    } else if (type === 'income' && /^Продажа\s+[\d.,]+\s+алмаз/i.test(title)) {
      // алмазы, проданные игроком на бирже за монеты, тоже уходят в казну
      currency = 'diamonds'; amount = parseFloat(String(title).match(/[\d.,]+/)[0].replace(',', '.'));
    } else if (type === 'spend') {
      const p = parseSpend(amountDisplay);
      if (!p) return;
      currency = p.currency; amount = p.amount;
    } else {
      return;
    }
    if (!(amount > 0)) return;
    const h = state.history && state.history[0];
    const id = (h && h.title === title && h.id) ? String(h.id) : (Date.now() + '_' + Math.random().toString(36).slice(2, 6));
    outbox.push({ id, ts: Date.now(), currency, amount, title });
    if (outbox.length > 200) outbox.splice(0, outbox.length - 200);
    saveOutbox();
    setDirty(true);
  }
  if (typeof addHistory === 'function') {
    const origAddHistory = addHistory;
    addHistory = function (type, title, amountDisplay) {
      const res = origAddHistory.apply(this, arguments);
      try { recordSpend(type, title, amountDisplay); } catch (e) {}
      return res;
    };
  }

  // --- бан: вместо игры показываем окно с причиной и сроком; прогресс не удаляется ---
  let banned = false, banBox = null, banTimer = null;
  function banLeft(until) {
    const ms = until - Date.now();
    if (ms <= 0) return '';
    const d = Math.floor(ms / 86400000), h = Math.floor(ms % 86400000 / 3600000), m = Math.floor(ms % 3600000 / 60000);
    const pl = (n, a) => n + ' ' + (n % 10 === 1 && n % 100 !== 11 ? a[0] : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? a[1] : a[2]));
    return d > 0 ? pl(d, ['день', 'дня', 'дней']) + (h ? ' ' + pl(h, ['час', 'часа', 'часов']) : '') : (h > 0 ? pl(h, ['час', 'часа', 'часов']) + ' ' : '') + pl(m || 1, ['минута', 'минуты', 'минут']);
  }
  function showBan(ban) {
    ban = ban || {};
    ready = false;
    try { overlay.remove(); } catch (e) {}
    if (!banBox) {
      banBox = document.createElement('div');
      banBox.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:#071226;color:#fff;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;font-family:system-ui,sans-serif;text-align:center;overflow:auto';
      document.body.appendChild(banBox);
    }
    banBox.innerHTML = '';
    const card = document.createElement('div');
    card.style.cssText = 'max-width:360px;width:100%;padding:28px 22px;border-radius:18px;background:rgba(246,70,93,0.08);border:1px solid rgba(246,70,93,0.4)';
    const mk = (tag, css, text) => { const e = document.createElement(tag); e.style.cssText = css; e.textContent = text; card.appendChild(e); return e; };
    mk('div', 'font-size:54px;line-height:1;margin-bottom:10px', '🚫');
    mk('div', 'font-size:22px;font-weight:800;margin-bottom:16px', 'ты заблокирован');
    mk('div', 'font-size:12px;color:#9aa6b2;text-transform:uppercase;letter-spacing:.5px', 'причина');
    mk('div', 'font-size:17px;font-weight:700;margin:4px 0 16px;word-break:break-word', ban.reason || 'нарушение правил');
    mk('div', 'font-size:12px;color:#9aa6b2;text-transform:uppercase;letter-spacing:.5px', 'срок');
    const term = mk('div', 'font-size:17px;font-weight:700;margin:4px 0 0', '');
    const upd = () => {
      if (!ban.until) { term.textContent = 'навсегда'; return; }
      const left = banLeft(ban.until);
      term.textContent = 'до ' + new Date(ban.until).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + (left ? ' (осталось ' + left + ')' : '');
    };
    upd();
    banBox.appendChild(card);
    if (!banned) {
      banned = true;
      // раз в 30 секунд проверяем: вдруг бан уже снят или закончился
      banTimer = setInterval(async () => {
        upd();
        try {
          const r = await fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ initData, deviceId, action: 'load' }) });
          if (r.ok) location.reload();
        } catch (e) {}
      }, 30000);
    }
  }

  async function api(payload, keepalive) {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(Object.assign({ initData, deviceId }, payload)),
      keepalive: !!keepalive
    });
    let data = null;
    try { data = await res.json(); } catch (e) {}
    if (res.status === 403 && data && data.error === 'banned') showBan(data.ban);
    return { status: res.status, ok: res.ok, data };
  }

  function buildPayload() {
    const s = JSON.parse(JSON.stringify(state));
    delete s.support; // обращения в поддержку (с файлами) остаются только на устройстве
    if (Array.isArray(s.history) && s.history.length > MAX_HISTORY) s.history = s.history.slice(0, MAX_HISTORY);
    if (!s.nickOverride) s.nickname = nick;
    const extra = {};
    EXTRA_KEYS.forEach(k => { const v = Number(localStorage.getItem(k)); if (v > 0) extra[k] = v; });
    return { state: s, extra };
  }

  // применить серверную версию: пишем в localStorage и перезагружаем страницу
  function adopt(record) {
    adopting = true;
    ready = false;
    const st = Object.assign({}, record.state);
    st.support = (state && state.support) || { tickets: [] };
    if (!st.nickOverride) st.nickname = nick;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(st));
      const extra = record.extra || {};
      EXTRA_KEYS.forEach(k => {
        const local = Number(localStorage.getItem(k)) || 0;
        const best = Math.max(local, Number(extra[k]) || 0);
        if (best > 0) localStorage.setItem(k, String(best));
      });
      localStorage.removeItem(DIRTY_KEY);
      localStorage.removeItem(SPEND_KEY); // состояние заменено серверным — покупки, которых в нём нет, не засчитываем
    } catch (e) { console.error('[cloud] adopt failed', e); }
    outbox = [];
    writeMeta({ uid, rev: record.rev });
    location.reload();
  }

  // Сервер уже начислил реферальный бонус (ответ мог потеряться, например, при обновлении страницы),
  // а в игре на устройстве его ещё нет — такую запись обязательно берём себе, иначе бонус затрётся нулём
  function missedRefBonus(rec) {
    const sr = rec && rec.state && rec.state.refs;
    return !!(sr && sr.by && !(state.refs && state.refs.by));
  }
  function adoptRefBonus(rec) {
    try { sessionStorage.setItem('lowkie_ref_welcome', '1'); } catch (e) {}
    adopt(rec);
  }

  async function push(keepalive) {
    if (!ready || inflight || adopting || !dirty || (bankBusy && !keepalive)) return;
    inflight = true;
    dirty = false; // если за время отправки игрок ещё потапает, save() вернёт true
    try {
      const p = buildPayload();
      const spends = outbox.slice(0, 50);
      const r = await api({ action: 'save', baseRev: meta.rev, state: p.state, extra: p.extra, spends }, keepalive);
      if (r.status === 409 && r.data && r.data.record) {
        const rec = r.data.record;
        if (missedRefBonus(rec)) { adoptRefBonus(rec); return; }
        if (rec.deviceId === deviceId) {
          // запись сделали мы сами (ответ потерялся / сервер отдал не самую свежую копию) —
          // свой прогресс не трогаем, просто сверяем номер версии и отправим снова
          writeMeta({ uid, rev: rec.rev });
          setDirty(true);
        } else {
          adopt(rec); // реально писали с другого устройства
        }
        return;
      }
      if (!r.ok) throw new Error('save ' + r.status);
      if (r.data.bonus && r.data.record) {
        // игрок пришёл по реферальной ссылке: сервер начислил бонус — берём его версию прогресса
        try { sessionStorage.setItem('lowkie_ref_welcome', '1'); } catch (e) {}
        adopt(r.data.record);
        return;
      }
      writeMeta({ uid, rev: r.data.rev });
      if (spends.length) {
        const sent = new Set(spends.map(x => x.id));
        outbox = outbox.filter(x => !sent.has(x.id));
        saveOutbox();
        if (outbox.length) dirty = true; // остались неотправленные траты — отправим следующим заходом
      }
      if (!dirty) { try { localStorage.removeItem(DIRTY_KEY); } catch (e) {} }
    } catch (e) {
      setDirty(true); // попробуем в следующий раз
    } finally {
      inflight = false;
    }
  }

  async function init() {
    const localTotal = Number(state.total) || 0;
    // если на устройстве уже есть прогресс (играл до обновления) — это не новый игрок, реферальный бонус ему не положен
    const r = await api({ action: 'load', hadProgress: localTotal > 0 });
    if (!r.ok) throw new Error('load ' + r.status);

    if (!r.data.exists) {
      // первый вход с этого аккаунта: заливаем текущий локальный прогресс на сервер
      writeMeta({ uid, rev: 0 });
      setDirty(true);
    } else {
      const rec = r.data.record;
      if (meta.uid === uid) {
        if (meta.rev < rec.rev) {
          if (missedRefBonus(rec)) {
            adoptRefBonus(rec); return;       // сервер начислил реферальный бонус, а ответ до нас не дошёл
          } else if (rec.deviceId === deviceId) {
            writeMeta({ uid, rev: rec.rev }); // это наша же запись, прогресс на устройстве актуален
          } else {
            adopt(rec); return;               // с другого устройства ушли вперёд
          }
        } else if (meta.rev > rec.rev) {
          writeMeta({ uid, rev: rec.rev });   // сервер отдал более старую копию — доверяем себе
          setDirty(true);
        }
        if (wasDirty()) setDirty(true);       // дольём то, что не успело уйти в прошлый раз
      } else {
        // это устройство ещё не было привязано к аккаунту
        const serverTotal = Number(rec.state && rec.state.total) || 0;
        if (localTotal > serverTotal) {
          writeMeta({ uid, rev: rec.rev }); // локальный прогресс больше — он становится основным
          setDirty(true);
        } else {
          adopt(rec);
          return;
        }
      }
    }

    ready = true;
    if (!state.nickOverride && state.nickname !== nick) {
      state.nickname = nick;
      save(); // ник поменялся — сохраняем и отправим
    } else {
      origSave(); // просто фиксируем локально, на сервер без лишней записи
    }
    try { updateUI(); } catch (e) {}
    push();
    handleBank(r.data.bank);
    setTimeout(() => { try { refAfterReady(); } catch (e) { console.warn('[cloud] ref', e); } }, 300);
    setTimeout(() => { try { ticketsAfterReady(); } catch (e) { console.warn('[cloud] tickets', e); } }, 400);
  }

  // ---------- лидеры ----------
  const leaders = { list: null, error: false, at: 0, drawnKey: '' };

  function renderLeadersCloud() {
    const box = document.getElementById('leadersList');
    const tab = document.getElementById('friends');
    if (!box || !tab || tab.style.display === 'none') return;

    const myTotal = Math.floor(Number(state.total) || 0);
    const key = leaders.at + '|' + leaders.error + '|' + myTotal;
    if (key === leaders.drawnKey) return;
    leaders.drawnKey = key;

    box.innerHTML = '';
    const note = (text) => {
      const d = document.createElement('div');
      d.style.cssText = 'color:var(--muted);text-align:center;padding:16px;font-size:13px;';
      d.textContent = text;
      box.appendChild(d);
    };

    if (!leaders.list) { note(leaders.error ? 'не удалось загрузить таблицу лидеров' : 'загрузка…'); return; }
    if (leaders.list.length === 0) { note('пока никого нет'); return; }

    const medals = ['🥇', '🥈', '🥉'];
    const addRow = (rank, name, total, isMe, photo) => {
      const row = document.createElement('div');
      row.className = 'upgrade-card';
      if (isMe) row.style.border = '1px solid rgba(255,209,102,0.5)';

      const place = document.createElement('div');
      place.style.cssText = 'width:34px;text-align:center;font-weight:800;font-size:16px;flex-shrink:0;';
      place.textContent = rank && rank <= 3 ? medals[rank - 1] : (rank ? String(rank) : '—');

      const avatar = document.createElement('div');
      avatar.style.cssText = 'width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#ff7e5f,#feb47b);display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;flex-shrink:0;';
      avatar.style.overflow = 'hidden';
      const letter = (Array.from(name)[0] || '?').toUpperCase();
      avatar.textContent = letter;
      if (photo) {
        const img = document.createElement('img');
        img.referrerPolicy = 'no-referrer';
        img.alt = '';
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;transform:none;';
        img.onload = () => { avatar.textContent = ''; avatar.appendChild(img); };
        img.src = photo; // пока грузится (или если не загрузилась) остаётся буква
      }

      const info = document.createElement('div');
      info.style.cssText = 'flex:1;min-width:0;margin-left:4px;';
      const nm = document.createElement('strong');
      nm.style.cssText = 'display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
      nm.textContent = name + (isMe ? ' (вы)' : '');
      const bal = document.createElement('div');
      bal.style.cssText = 'color:var(--accent);font-weight:700;';
      bal.textContent = formatNum(total) + ' монет';
      info.appendChild(nm);
      info.appendChild(bal);

      row.appendChild(place);
      row.appendChild(avatar);
      row.appendChild(info);
      box.appendChild(row);
    };

    const myPhoto = tgUser.photo_url || null;
    let meInList = false;
    let shown = 0;
    leaders.list.forEach(p => {
      if (p.isMe) meInList = true;
      const t = p.isMe ? myTotal : p.total;
      if (!(t > 0)) return; // у кого 0 монет — в списке не показываем
      shown++;
      addRow(shown, p.name, t, p.isMe, p.isMe ? (myPhoto || p.photo) : p.photo);
    });
    if (!meInList && myTotal > 0) {
      note('· · ·');
      addRow(null, nick, myTotal, true, myPhoto);
    }
    if (!shown && !(!meInList && myTotal > 0)) note('пока никого нет');
  }

  // подменяем заглушку «один игрок» из script.js на настоящую таблицу
  renderLeaders = renderLeadersCloud;

  async function fetchLeaders() {
    if (!ready) return;
    try {
      const r = await api({ action: 'top' });
      if (!r.ok) throw new Error('top ' + r.status);
      leaders.list = r.data.top || [];
      leaders.error = false;
    } catch (e) {
      leaders.error = true;
    }
    leaders.at = Date.now();
    renderLeadersCloud();
  }

  const friendsTabBtn = document.getElementById('tab-friends');
  if (friendsTabBtn) friendsTabBtn.addEventListener('click', () => { renderLeadersCloud(); fetchLeaders(); });
  setInterval(() => {
    const tab = document.getElementById('friends');
    if (tab && tab.style.display !== 'none' && document.visibilityState === 'visible') fetchLeaders();
  }, 30000);

  // периодическая отправка, отправка при сворачивании/закрытии
  setInterval(() => push(), 5000);
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'hidden') { push(true); return; }
    // вернулись в игру: проверим, не ушёл ли прогресс вперёд на другом устройстве
    if (!ready || inflight || bankBusy) return;
    try {
      await push();
      const r = await api({ action: 'load' });
      if (r.ok && r.data) {
        handleBank(r.data.bank);
        if (r.data.exists && !dirty && !inflight && !bankBusy) {
          const rec = r.data.record;
          if (rec.rev > meta.rev && (rec.deviceId !== deviceId || missedRefBonus(rec))) adopt(rec);
        }
      }
    } catch (e) {}
  });
  window.addEventListener('pagehide', () => push(true));

  // проверка сервера: не изменил ли прогресс админ, другое устройство или перевод от другого игрока; заодно узнаём про доступ к банку
  async function pollServer() {
    if (!ready || inflight || adopting || bankBusy || document.visibilityState !== 'visible') return;
    try {
      const r = await api({ action: 'load' });
      if (!r.ok || !r.data) return;
      handleBank(r.data.bank);
      if (r.data.exists && !dirty && !inflight && !bankBusy) {
        const rec = r.data.record;
        if (rec.rev > meta.rev && (rec.deviceId !== deviceId || missedRefBonus(rec))) adopt(rec);
      }
    } catch (e) {}
  }
  setInterval(pollServer, 20000); // раз в 20 сек (так входящие переводы появляются быстрее)

  // =====================================================================
  // БАНК: режим доступа (кнопка в игре / полная замена), безопасные банковские операции
  // =====================================================================
  const BANK_MODE_KEY = 'lowkie_bank_mode_' + uid;
  const bankPage = /(^|\/)bank(\.html)?\/?$/.test(location.pathname);
  let bankMode = null;

  function showBankButton(on) {
    const btn = document.getElementById('openBankBtn');
    if (btn) btn.style.display = on ? 'flex' : 'none';
  }
  // сразу после запуска показываем кнопку по запомненному режиму, не дожидаясь ответа сервера
  try { if (!bankPage && localStorage.getItem(BANK_MODE_KEY) === 'button') showBankButton(true); } catch (e) {}

  // дождаться, пока всё сохранённое уйдёт на сервер (нужно перед переводом и при переходе между игрой и банком)
  async function flush() {
    const t0 = Date.now();
    while (Date.now() - t0 < 8000) {
      if (!ready || adopting) return false;
      if (!dirty && !inflight) return true;
      if (!inflight) await push(); else await new Promise(res => setTimeout(res, 120));
    }
    return !dirty && !inflight;
  }
  async function navigate(url, replace) {
    try { await flush(); } catch (e) {}
    if (replace) location.replace(url); else location.href = url;
  }

  function handleBank(mode) {
    if (!mode) return;
    bankMode = mode;
    try { localStorage.setItem(BANK_MODE_KEY, mode); } catch (e) {}
    if (!bankPage) {
      showBankButton(mode === 'button');
      if (mode === 'full') { leaving = true; navigate('bank.html', true); } // игра полностью заменена банком
    } else if (mode === 'off') {
      leaving = true;
      navigate('index.html', true);                      // доступ к банку отключили
      return;
    }
    try { window.dispatchEvent(new CustomEvent('lowkie-bank-mode', { detail: mode })); } catch (e) {}
  }

  // банковская операция, меняющая баланс: сначала досылаем сохранение, потом выполняем её на сервере и
  // применяем результат прямо в игре (без перезагрузки), не теряя того, что игрок успел натапать
  async function bankCall(payload) {
    await flush();
    bankBusy = true;
    try {
      const r = await api(payload);
      if (r.ok && r.data && r.data.delta) mergeBank(r.data);
      return r;
    } finally {
      bankBusy = false;
    }
  }
  function mergeBank(d) {
    const dc = Number(d.delta && d.delta.coins) || 0, dd = Number(d.delta && d.delta.diamonds) || 0;
    state.total = Math.max(0, (Number(state.total) || 0) + dc);
    if (dd) {
      if (!state.diamonds || typeof state.diamonds !== 'object') state.diamonds = { total: 0, lastTs: null, upgrades: {} };
      state.diamonds.total = Math.max(0, (Number(state.diamonds.total) || 0) + dd);
    }
    if (d.entry) {
      if (!Array.isArray(state.history)) state.history = [];
      state.history.unshift(d.entry);
      if (state.history.length > 500) state.history.length = 500;
    }
    if (d.rev) writeMeta({ uid, rev: d.rev });
    origSave(); // только на устройстве: сервер уже знает об этой операции
    try { updateUI(); updateHistoryWidget(); renderHistoryList(); } catch (e) {}
  }

  // кнопка «Банк» в игре (режим «кнопка в меню»)
  const bankBtn = document.getElementById('openBankBtn');
  if (bankBtn && !bankPage) bankBtn.addEventListener('click', () => navigate('bank.html'));

  window.LowkieCloud = {
    api, flush, bankCall, navigate, sync: pollServer,
    get ready() { return ready; },
    get mode() { return bankMode; },
    uid
  };

  // =====================================================================
  // РЕФЕРАЛЬНАЯ СИСТЕМА: ссылка, статистика, список друзей (всё считает сервер)
  // =====================================================================
  let refData = null;
  const refEl = id => document.getElementById(id);
  const fmtN = n => Number(n || 0).toLocaleString('ru-RU');

  function renderRef() {
    const stats = refEl('refStats'), link = refEl('refLink'), btns = refEl('refBtns'), list = refEl('refList');
    if (!stats || !refData) return;
    const d = refData;
    const lines = [];
    lines.push('приглашено друзей: ' + d.count + ' · бонус к прибыли: +' + fmtN(d.units * d.income) + ' в час');
    if (d.by) lines.push('ты пришёл по ссылке игрока ' + d.by.n + ' и получил ' + fmtN(d.coins) + ' монет');
    stats.textContent = lines.join('\n');
    stats.style.whiteSpace = 'pre-line';
    if (d.link) {
      link.value = d.link; link.style.display = 'block'; btns.style.display = 'flex';
    } else {
      link.style.display = 'none'; btns.style.display = 'none';
      stats.textContent += '\nссылка пока недоступна, попробуй позже';
    }
    list.innerHTML = '';
    (d.list || []).forEach(f => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;justify-content:space-between;gap:8px;font-size:13px;padding:8px 10px;border-radius:8px;background:rgba(255,255,255,0.03);';
      const n = document.createElement('span'); n.textContent = f.n || 'Игрок';
      const t = document.createElement('span'); t.style.color = 'var(--muted)';
      try { t.textContent = new Date(f.ts).toLocaleDateString('ru-RU'); } catch (e) {}
      row.appendChild(n); row.appendChild(t); list.appendChild(row);
    });
  }

  async function loadRef() {
    try {
      const r = await api({ action: 'ref_info' });
      if (r.ok) { refData = r.data; renderRef(); }
    } catch (e) {}
  }

  function refAfterReady() {
    loadRef();
    const inv = refEl('refInviteBtn'), cp = refEl('refCopyBtn');
    if (inv) inv.addEventListener('click', () => {
      if (!refData || !refData.link) return;
      const text = 'залетай в Lowkie Clicker! по моей ссылке ты получишь ' + fmtN(refData.coins) + ' монет и +' + fmtN(refData.income) + ' к прибыли в час';
      const url = 'https://t.me/share/url?url=' + encodeURIComponent(refData.link) + '&text=' + encodeURIComponent(text);
      try { tg.openTelegramLink(url); } catch (e) { window.open(url, '_blank'); }
    });
    if (cp) cp.addEventListener('click', async () => {
      if (!refData || !refData.link) return;
      let ok = false;
      try { await navigator.clipboard.writeText(refData.link); ok = true; } catch (e) {}
      if (!ok) {
        try { const i = refEl('refLink'); i.focus(); i.select(); ok = document.execCommand('copy'); } catch (e) {}
      }
      if (typeof showAlert === 'function') showAlert(ok ? 'ссылка скопирована' : 'не удалось скопировать — выдели ссылку и скопируй вручную');
    });
    const tab = document.getElementById('tab-friends');
    if (tab) tab.addEventListener('click', loadRef);
    // приглашённый игрок: после получения бонуса показываем приветствие
    let welcome = false;
    try { welcome = sessionStorage.getItem('lowkie_ref_welcome') === '1'; sessionStorage.removeItem('lowkie_ref_welcome'); } catch (e) {}
    if (welcome && typeof showAlert === 'function') {
      showAlert('ты пришёл по приглашению друга и получил 100 000 монет и +1000 к прибыли в час. приглашай друзей сам, чтобы получать ещё больше', 'добро пожаловать');
    }
  }

  // =====================================================================
  // ТИКЕТЫ ПОДДЕРЖКИ: хранятся на сервере (привязаны к Telegram-аккаунту),
  // ответы поддержки приходят прямо в обращение
  // =====================================================================
  const TK_MAX_RAW = 3300 * 1024;   // максимум на одно вложение после сжатия (≈4,4 МБ в base64)
  const tk = { list: null, error: false, at: 0, sig: '' };
  const tkDrafts = {};              // черновики ответов, чтобы обновление списка их не стирало
  let tkBusy = false;

  (function injectTicketStyles() {
    const st = document.createElement('style');
    st.textContent = `
      .status-answered{background:rgba(14,203,129,0.15);color:#0ecb81;border:1px solid rgba(14,203,129,0.3)}
      .status-closed{background:rgba(154,166,178,0.15);color:#9aa6b2;border:1px solid rgba(154,166,178,0.3)}
      .tk-new{display:inline-block;margin-left:6px;padding:2px 7px;border-radius:999px;background:#f6465d;color:#fff;font-size:10px;font-weight:800;vertical-align:middle}
      .tk-thread{display:flex;flex-direction:column;gap:8px;margin:8px 0}
      .tk-msg{max-width:92%;padding:8px 11px;border-radius:12px;font-size:13px;line-height:1.45;white-space:pre-wrap;word-break:break-word}
      .tk-msg.user{align-self:flex-end;background:rgba(77,166,255,0.16);border:1px solid rgba(77,166,255,0.25)}
      .tk-msg.admin{align-self:flex-start;background:rgba(14,203,129,0.13);border:1px solid rgba(14,203,129,0.28)}
      .tk-msg .who{display:block;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.4px;opacity:.7;margin-bottom:3px}
      .tk-msg .when{display:block;font-size:10px;opacity:.5;margin-top:4px;text-align:right}
      .tk-files{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}
      .tk-file{padding:6px 10px;border-radius:8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#fff;font-size:12px;cursor:pointer;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .tk-reply{display:flex;gap:8px;align-items:flex-end;margin-top:8px}
      .tk-reply textarea{flex:1;min-height:42px;max-height:120px;resize:vertical;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:9px;color:#fff;font-family:inherit;font-size:13px;outline:none}
      .tk-reply button{padding:10px 14px;border:none;border-radius:8px;background:linear-gradient(90deg,#4da6ff,#0066cc);color:#fff;font-weight:800;cursor:pointer}
      .tk-reply button:disabled{opacity:.5}
      #tkBadge{display:inline-block;margin-left:8px;min-width:18px;padding:1px 6px;border-radius:999px;background:#f6465d;color:#fff;font-size:11px;font-weight:800;text-align:center;vertical-align:middle}
    `;
    document.head.appendChild(st);
  })();

  const tkDate = ts => { try { return new Date(ts).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; } };
  const tkSize = n => n >= 1048576 ? (n / 1048576).toFixed(1) + ' МБ' : Math.max(1, Math.round(n / 1024)) + ' КБ';
  const supportOpen = () => { const m = document.getElementById('supportModal'); return !!(m && m.classList.contains('open')); };

  function updateSupportBadge() {
    const title = document.querySelector('#openSupportBtn .sw-title');
    if (!title) return;
    const n = (tk.list || []).filter(t => t.unread).length;
    let b = document.getElementById('tkBadge');
    if (!n) { if (b) b.remove(); return; }
    if (!b) { b = document.createElement('span'); b.id = 'tkBadge'; title.appendChild(b); }
    b.textContent = String(n);
  }

  function showTicketFile(blob) { // вложение: картинка — во весь экран, остальное — скачивание
    if (blob.type && blob.type.startsWith('image/') && blob.type !== 'image/svg+xml') {
      const ov = document.createElement('div');
      ov.style.cssText = 'position:fixed;inset:0;z-index:20000;background:rgba(0,0,0,0.92);display:flex;align-items:center;justify-content:center;padding:12px;cursor:zoom-out';
      const img = document.createElement('img');
      img.src = blob.data;
      img.style.cssText = 'max-width:100%;max-height:100%;object-fit:contain;transform:none;';
      ov.appendChild(img);
      ov.onclick = () => ov.remove();
      document.body.appendChild(ov);
    } else {
      const a = document.createElement('a');
      a.href = blob.data; a.download = blob.name || 'file';
      document.body.appendChild(a); a.click(); a.remove();
    }
  }
  async function openTicketFile(id, idx) {
    try {
      const r = await api({ action: 'ticket_file_get', id, idx });
      if (!r.ok) throw new Error(r.status);
      showTicketFile(r.data);
    } catch (e) { showAlert('Не удалось открыть файл. Попробуйте позже.'); }
  }

  const TK_STATUS = {
    open: ['НА РАССМОТРЕНИИ', 'status-pending'],
    answered: ['ОТВЕЧЕНО', 'status-answered'],
    closed: ['ЗАКРЫТО', 'status-closed']
  };

  function renderTicketsCloud() {
    const box = document.getElementById('ticketsList');
    if (!box) return;
    if (supportOpen() && Date.now() - tk.at > 8000) loadTickets();
    box.innerHTML = '';
    const note = t => { const d = document.createElement('div'); d.style.cssText = 'color:var(--muted);text-align:center;padding:20px;font-size:13px;'; d.textContent = t; box.appendChild(d); };
    if (!tk.list) { note(tk.error ? 'Не удалось загрузить обращения' : 'Загрузка…'); return; }
    if (!tk.list.length) { note('У вас пока нет обращений'); return; }

    tk.list.forEach(t => {
      const el = document.createElement('div');
      el.className = 'ticket-item';

      const head = document.createElement('div'); head.className = 'ticket-header';
      const subj = document.createElement('span'); subj.className = 'ticket-subject'; subj.textContent = t.subject;
      if (t.unread) { const n = document.createElement('span'); n.className = 'tk-new'; n.textContent = 'ОТВЕТ'; subj.appendChild(n); }
      const st = TK_STATUS[t.status] || TK_STATUS.open;
      const chip = document.createElement('span'); chip.className = 'ticket-status ' + st[1]; chip.textContent = st[0];
      head.appendChild(subj); head.appendChild(chip);
      el.appendChild(head);

      const thread = document.createElement('div'); thread.className = 'tk-thread';
      t.messages.forEach(m => {
        const b = document.createElement('div'); b.className = 'tk-msg ' + (m.from === 'admin' ? 'admin' : 'user');
        const who = document.createElement('span'); who.className = 'who'; who.textContent = m.from === 'admin' ? 'Поддержка' : 'Вы';
        const txt = document.createElement('span'); txt.textContent = m.text;
        const when = document.createElement('span'); when.className = 'when'; when.textContent = tkDate(m.ts);
        b.appendChild(who); b.appendChild(txt); b.appendChild(when);
        thread.appendChild(b);
      });
      el.appendChild(thread);

      if (t.files && t.files.length) {
        const fl = document.createElement('div'); fl.className = 'tk-files';
        t.files.forEach((f, i) => {
          const c = document.createElement('div'); c.className = 'tk-file';
          c.textContent = ((f.type || '').startsWith('image/') ? '🖼 ' : '📄 ') + f.name + ' · ' + tkSize(f.size);
          c.onclick = () => openTicketFile(t.id, i);
          fl.appendChild(c);
        });
        el.appendChild(fl);
      }

      if (t.status !== 'closed') {
        const rep = document.createElement('div'); rep.className = 'tk-reply';
        const ta = document.createElement('textarea'); ta.placeholder = 'Написать в обращение…'; ta.maxLength = 3000;
        ta.value = tkDrafts[t.id] || '';
        ta.oninput = () => { tkDrafts[t.id] = ta.value; };
        const bt = document.createElement('button'); bt.type = 'button'; bt.textContent = 'Отправить';
        bt.onclick = () => sendTicketReply(t.id, ta, bt);
        rep.appendChild(ta); rep.appendChild(bt);
        el.appendChild(rep);
      }
      const date = document.createElement('div'); date.className = 'ticket-date'; date.textContent = new Date(t.createdAt).toLocaleString('ru-RU');
      el.appendChild(date);
      box.appendChild(el);
    });
  }

  async function sendTicketReply(id, ta, btn) {
    const text = ta.value.trim();
    if (!text) return;
    btn.disabled = true;
    try {
      const r = await api({ action: 'ticket_reply', id, text });
      if (!r.ok) {
        const e = r.data && r.data.error;
        throw new Error(e === 'closed' ? 'Обращение закрыто. Создайте новое.' : e === 'too_many' ? 'В обращении слишком много сообщений. Создайте новое.' : 'Не удалось отправить. Попробуйте позже.');
      }
      delete tkDrafts[id];
      const i = tk.list.findIndex(t => t.id === id);
      if (i >= 0) tk.list[i] = r.data.ticket;
      tk.sig = ''; renderTicketsCloud();
    } catch (e) {
      showAlert(e.message || 'Не удалось отправить. Попробуйте позже.');
      btn.disabled = false;
    }
  }

  async function loadTickets() {
    if (!ready) return;
    try {
      const r = await api({ action: 'tickets' });
      if (!r.ok) throw new Error('tickets ' + r.status);
      const sig = JSON.stringify(r.data.tickets);
      const changed = sig !== tk.sig;
      tk.list = r.data.tickets; tk.sig = sig; tk.error = false;
      tk.at = Date.now();
      if (changed) renderTicketsCloud();
    } catch (e) {
      tk.error = true; tk.at = Date.now();
      if (!tk.list) renderTicketsCloud();
    }
    updateSupportBadge();
    markTicketsRead();
  }

  // когда игрок смотрит обращения, ответы считаются прочитанными
  async function markTicketsRead() {
    if (!supportOpen() || !tk.list) return;
    const unread = tk.list.filter(t => t.unread);
    for (const t of unread) {
      try {
        const r = await api({ action: 'ticket_read', id: t.id });
        if (r.ok) t.unread = false;
      } catch (e) {}
    }
    if (unread.length) { tk.sig = JSON.stringify(tk.list); updateSupportBadge(); setTimeout(renderTicketsCloud, 2500); }
  }

  // подменяем рендер из script.js (он вызывается по имени при загрузке и при открытии окна поддержки)
  renderSupportTickets = renderTicketsCloud;
  renderTicketsCloud(); // сразу убираем локальный список, пока не загрузились обращения с сервера

  // --- отправка нового обращения ---
  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const rd = new FileReader();
      rd.onload = () => resolve(rd.result); rd.onerror = reject; rd.readAsDataURL(file);
    });
  }
  async function prepareAttachment(file) {   // картинки сжимаем, чтобы они уходили быстро
    const isImg = (file.type || '').startsWith('image/') && !/gif|svg/.test(file.type);
    if (isImg) {
      try {
        const url = URL.createObjectURL(file);
        const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
        const k = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
        if (k < 1 || file.size > 700 * 1024) {
          const c = document.createElement('canvas');
          c.width = Math.max(1, Math.round(img.naturalWidth * k)); c.height = Math.max(1, Math.round(img.naturalHeight * k));
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          const blob = await new Promise(res => c.toBlob(res, 'image/jpeg', 0.82));
          URL.revokeObjectURL(url);
          if (blob && blob.size < file.size) return { name: file.name.replace(/\.\w+$/, '') + '.jpg', size: blob.size, data: await fileToDataUrl(blob) };
        }
        URL.revokeObjectURL(url);
      } catch (e) { /* не получилось сжать — отправим как есть */ }
    }
    return { name: file.name, size: file.size, data: await fileToDataUrl(file) };
  }

  document.addEventListener('submit', async (e) => {
    if (!e.target || e.target.id !== 'supportForm') return;
    e.preventDefault(); e.stopImmediatePropagation();     // вместо локального сохранения из script.js
    if (tkBusy) return;
    const subject = document.getElementById('supportSubject').value.trim();
    const message = document.getElementById('supportMessage').value.trim();
    if (!subject || !message) { showAlert('Пожалуйста, заполните тему и сообщение'); return; }
    if (!ready) { showAlert('Нет связи с сервером. Попробуйте чуть позже.'); return; }

    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    const oldText = btn.textContent;
    tkBusy = true; btn.textContent = 'Отправка...'; btn.disabled = true;
    try {
      const files = [];
      for (const f of (selectedSupportFiles || [])) {
        const a = await prepareAttachment(f);
        if (a.size > TK_MAX_RAW) { showAlert(`Файл ${f.name} слишком большой для отправки (макс 3 МБ после сжатия)`); return; }
        files.push(a);
      }
      const r = await api({ action: 'ticket_create', subject, message });
      if (!r.ok) {
        const er = r.data && r.data.error;
        showAlert(er === 'too_fast' ? 'Подождите немного перед отправкой следующего обращения.'
          : er === 'too_many_open' ? 'У вас слишком много открытых обращений. Дождитесь ответа.'
          : 'Не удалось отправить обращение. Попробуйте позже.');
        return;
      }
      let failed = 0;
      for (const f of files) {
        try {
          const u = await api({ action: 'ticket_file', id: r.data.id, name: f.name, data: f.data });
          if (!u.ok) failed++;
        } catch (err) { failed++; }
      }
      form.reset();
      selectedSupportFiles = []; try { renderFilePreviews(); } catch (err) {}
      tk.sig = ''; tk.at = 0; await loadTickets();
      showAlert(failed ? `Обращение отправлено, но файлов не загрузилось: ${failed}.` : 'Ваше обращение успешно отправлено! Мы ответим вам в ближайшее время.');
    } catch (err) {
      console.error(err);
      showAlert('Ошибка при отправке. Попробуйте снова.');
    } finally {
      tkBusy = false; btn.textContent = oldText; btn.disabled = false;
    }
  }, true);

  // --- старые обращения с устройства один раз переносим на сервер ---
  async function migrateLocalTickets() {
    const sup = state.support;
    if (!sup || sup.imported || !Array.isArray(sup.tickets) || !sup.tickets.length) return;
    const items = sup.tickets.filter(t => t && t.subject && t.message)
      .map(t => ({ lid: String(t.id), subject: String(t.subject), message: String(t.message), date: t.date }));
    if (!items.length) { sup.imported = true; origSave(); return; }
    const r = await api({ action: 'ticket_import', items });
    if (!r.ok) return; // попробуем при следующем запуске
    // вложения старых обращений: пробуем загрузить те, что влезают
    for (const it of (r.data.items || [])) {
      if (!it.created) continue;
      const local = sup.tickets.find(t => String(t.id) === it.lid);
      const files = (local && local.files) || [];
      for (const f of files) {
        if (!f || typeof f.data !== 'string' || f.data.length > 4400000) continue;
        try { await api({ action: 'ticket_file', id: it.id, name: f.name || 'file', data: f.data }); } catch (e) {}
      }
    }
    // на устройстве оставляем текст обращений, тяжёлые вложения убираем (они уже на сервере)
    sup.tickets.forEach(t => { if (t.files) t.files = t.files.map(f => ({ name: f.name, type: f.type, size: f.size })); delete t.fileData; });
    sup.imported = true;
    origSave();
  }

  async function ticketsAfterReady() {
    try { await migrateLocalTickets(); } catch (e) { console.warn('[cloud] migrate tickets', e); }
    await loadTickets();
    setInterval(() => { if (ready && document.visibilityState === 'visible') loadTickets(); }, 60000);
  }

  init().then(hideOverlay).catch(e => {
    if (banned) return;
    console.warn('[cloud] нет связи, играем локально', e);
    overlay.textContent = 'нет связи с сервером, играем офлайн';
    setTimeout(hideOverlay, 1500);
    // повторная попытка подключения позже
    const retry = setInterval(async () => {
      try { await init(); clearInterval(retry); } catch (err) {}
    }, 20000);
  });
})();
