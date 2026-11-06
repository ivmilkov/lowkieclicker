import crypto from 'node:crypto';
import { getStore } from '@netlify/blobs';

const MAX_BODY = 600_000;           // символов в JSON сохранения
const MAX_AUTH_AGE = 3 * 24 * 3600; // initData старше 3 суток не принимаем
// Telegram id админов. Можно переопределить переменной ADMIN_IDS на Netlify (через запятую)
const ADMIN_IDS = (process.env.ADMIN_IDS || '8165411879').split(',').map(s => s.trim()).filter(Boolean);
const TOP_SIZE = 50;               // сколько игроков в таблице лидеров
const LB_UPDATE_EVERY = 30_000;     // не чаще раза в 30 сек на игрока обновляем таблицу

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
  });

// Проверка подписи Telegram Mini App (initData)
function verifyInitData(initData, botToken) {
  if (!initData || typeof initData !== 'string') return null;
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calc = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');

  const a = Buffer.from(calc, 'hex');
  const b = Buffer.from(hash, 'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  const authDate = Number(params.get('auth_date')) || 0;
  if (Date.now() / 1000 - authDate > MAX_AUTH_AGE) return null;

  try {
    const user = JSON.parse(params.get('user') || 'null');
    if (!user || !user.id) return null;
    user.start_param = String(params.get('start_param') || '').slice(0, 64);
    return user;
  } catch (e) {
    return null;
  }
}

// Имя для таблицы лидеров: имя + фамилия из Telegram (не @username)
function displayName(user) {
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim() || user.username || 'Игрок';
  return name.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 40);
}

// ---------- админские действия над прогрессом игрока ----------
const MAX_VALUE = 1e15;

function ensureDiamonds(st) {
  if (!st.diamonds || typeof st.diamonds !== 'object') st.diamonds = { total: 0, lastTs: Date.now(), upgrades: {} };
  if (typeof st.diamonds.total !== 'number') st.diamonds.total = Number(st.diamonds.total) || 0;
  if (!st.diamonds.lastTs) st.diamonds.lastTs = Date.now();
  if (!st.diamonds.upgrades || typeof st.diamonds.upgrades !== 'object') st.diamonds.upgrades = {};
}

// возвращает строку с кодом ошибки или null, если всё применено
function applyAdminAction(st, act, value) {
  const intActs = ['setCoins', 'addCoins', 'burnCoins', 'setDiamonds', 'addDiamonds', 'setClickBonus', 'addClickBonus'];
  let n = 0;
  if (intActs.includes(act)) {
    n = Math.trunc(Number(value));
    if (!Number.isFinite(n) || Math.abs(n) > MAX_VALUE) return 'bad_value';
  }
  const coins = () => Number(st.total) || 0;
  const dia = () => Number(st.diamonds && st.diamonds.total) || 0;

  switch (act) {
    case 'setCoins': st.total = Math.max(0, n); return null;
    case 'addCoins': st.total = Math.min(MAX_VALUE, Math.max(0, coins() + n)); return null;
    case 'burnCoins':
      if (n <= 0) return 'bad_value';
      st.total = Math.max(0, coins() - n); return null;
    case 'setDiamonds': ensureDiamonds(st); st.diamonds.total = Math.max(0, n); return null;
    case 'addDiamonds': ensureDiamonds(st); st.diamonds.total = Math.min(MAX_VALUE, Math.max(0, dia() + n)); return null;
    case 'setClickBonus': st.bonus = n; return null;
    case 'addClickBonus': st.bonus = Math.max(-MAX_VALUE, Math.min(MAX_VALUE, (Number(st.bonus) || 0) + n)); return null;
    case 'maxBoost':
      if (!st.upgrades || typeof st.upgrades !== 'object') st.upgrades = {};
      st.upgrades.plus20 = true;
      st.upgrades.miniBoost = true;
      if (!st.multiclick || typeof st.multiclick !== 'object') st.multiclick = { totalBonus: 0, currentTier: 0, purchasesInTier: 0 };
      st.multiclick.totalBonus = Math.max(0, Number(st.multiclick.totalBonus) || 0) + 999999;
      if (!st.passive || typeof st.passive !== 'object') st.passive = { level: 0, lastTs: Date.now() };
      st.passive.level = Math.max(st.passive.level || 0, 15);
      return null;
    case 'setNickname': {
      const s = String(value || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 40);
      if (!s) return 'bad_value';
      st.nickname = s;
      st.nickOverride = true;
      return null;
    }
    case 'resetNickname': st.nickname = 'telegram_nik'; st.nickOverride = false; return null;
    case 'holdToTap': st.holdToTap = !!value; return null;
    case 'resetState': {
      const keepNick = st.nickname, keepOverride = st.nickOverride, keepRefs = st.refs;
      for (const k of Object.keys(st)) delete st[k];
      Object.assign(st, {
        total: 0,
        bonus: 0,
        upgrades: { plus20: false, miniBoost: false },
        skins: { owned: {}, equipped: null },
        diamonds: { total: 0, lastTs: Date.now(), upgrades: {} },
        passive: { level: 0, lastTs: Date.now() },
        energyCurrent: 100,
        lastEnergyRegen: Date.now(),
        lastTapTs: 0,
        multiclick: { totalBonus: 0, currentTier: 0, purchasesInTier: 0 },
        holdToTap: false
      });
      if (keepNick) st.nickname = keepNick;
      if (keepOverride) st.nickOverride = keepOverride;
      if (keepRefs) st.refs = keepRefs;
      return null;
    }
    default: return 'unknown_act';
  }
}

// краткая сводка по игроку для списка
// активный бан игрока (until = 0 — навсегда); истёкший бан считается снятым
function activeBan(rec) {
  const b = rec && rec.ban;
  if (!b || typeof b !== 'object') return null;
  const until = Number(b.until) || 0;
  if (until && until <= Date.now()) return null;
  return { reason: String(b.reason || ''), until, at: Number(b.at) || 0 };
}

function summary(rec) {
  const st = rec.state || {};
  return {
    id: String(rec.tgId),
    username: rec.username || null,
    name: rec.name || rec.firstName || null,
    nickname: st.nickname || null,
    total: Math.floor(Number(st.total) || 0),
    diamonds: Math.floor(Number(st.diamonds && st.diamonds.total) || 0),
    updatedAt: rec.updatedAt || 0,
    rev: rec.rev,
    ban: activeBan(rec),
    isAdmin: ADMIN_IDS.includes(String(rec.tgId)),
    photo: safePhoto(rec.photoUrl),
    bank: bankModeOf(rec.tgId, rec)
  };
}

// доступ к банку: 'off' — нет, 'button' — кнопка «Банк» в игре, 'full' — игра полностью заменена банком,
// 'admin' — админ (у него банк всегда открывается по отдельной ссылке из бота)
function bankModeOf(id, rec) {
  if (ADMIN_IDS.includes(String(id))) return 'admin';
  const m = rec && rec.bank && rec.bank.mode;
  return m === 'button' || m === 'full' ? m : 'off';
}

// Аватарка из Telegram: принимаем только ссылки вида https://t.me/i/userpic/...
function safePhoto(url) {
  if (typeof url !== 'string' || url.length > 300) return null;
  return /^https:\/\/t\.me\/i\/userpic\/[\w\-\/\.]+$/.test(url) ? url : null;
}

// ---------- казна: траты игроков ----------
const MAX_SPEND_LOG = 200;      // сколько последних трат хранить у каждого игрока
const round2 = n => Math.round(Number(n) * 100) / 100;

// принять траты, присланные игрой вместе с сохранением (повторная отправка безопасна: дубли по id отбрасываются)
function applySpends(rec, spends) {
  if (!Array.isArray(spends) || !spends.length) return;
  rec.spent = { coins: Number(rec.spent && rec.spent.coins) || 0, diamonds: Number(rec.spent && rec.spent.diamonds) || 0 };
  rec.spendLog = Array.isArray(rec.spendLog) ? rec.spendLog : [];
  const seen = new Set(rec.spendLog.map(e => e.id));
  for (const sp of spends.slice(0, 50)) {
    if (!sp || typeof sp !== 'object') continue;
    const id = String(sp.id || '').slice(0, 40);
    if (!id || seen.has(id)) continue;
    const currency = sp.currency === 'diamonds' ? 'diamonds' : sp.currency === 'coins' ? 'coins' : null;
    const amount = round2(sp.amount);
    if (!currency || !(amount > 0) || amount > 1e12) continue;
    const title = String(sp.title || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 80) || 'Покупка';
    let ts = Number(sp.ts);
    if (!Number.isFinite(ts) || ts <= 0 || ts > Date.now() + 60_000) ts = Date.now();
    rec.spent[currency] = round2(rec.spent[currency] + amount);
    rec.spendLog.unshift({ id, ts, currency, amount, title });
    seen.add(id);
  }
  if (rec.spendLog.length > MAX_SPEND_LOG) rec.spendLog.length = MAX_SPEND_LOG;
}

// запись игрока без служебного журнала трат (его игре отдавать не нужно)
function publicRecord(rec) {
  if (!rec) return rec;
  const { spendLog, spent, bankTx, ...rest } = rec;
  return rest;
}

async function loadAllRecords(store) {
  const { blobs } = await store.list({ prefix: 'u_' });
  const out = [];
  for (let i = 0; i < blobs.length; i += 20) {
    const chunk = blobs.slice(i, i + 20);
    const recs = await Promise.all(chunk.map(b => store.get(b.key, { type: 'json' }).catch(() => null)));
    recs.forEach(r => { if (r && r.state) out.push(r); });
  }
  return out;
}

// сводка по казне: сколько игроки потратили, сколько уже выведено, что осталось
async function treasurySnapshot(store, tre) {
  const recs = await loadAllRecords(store);
  const spent = { coins: 0, diamonds: 0 };
  const history = [];
  let payers = 0;
  recs.forEach(r => {
    if (r.spent && (r.spent.coins > 0 || r.spent.diamonds > 0)) payers++;
    spent.coins += Number(r.spent && r.spent.coins) || 0;
    spent.diamonds += Number(r.spent && r.spent.diamonds) || 0;
    (r.spendLog || []).forEach(e => history.push({
      kind: 'spend', id: e.id, ts: e.ts, currency: e.currency, amount: e.amount, title: e.title,
      uid: String(r.tgId), name: r.name || r.firstName || r.username || 'Игрок', username: r.username || null
    }));
  });
  const meta = (await tre.get('meta', { type: 'json' })) || {};
  const withdrawn = { coins: Number(meta.withdrawn && meta.withdrawn.coins) || 0, diamonds: Number(meta.withdrawn && meta.withdrawn.diamonds) || 0 };
  const log = Array.isArray(meta.log) ? meta.log : [];
  return {
    meta, withdrawn, log, payers, spent: { coins: round2(spent.coins), diamonds: round2(spent.diamonds) },
    balance: { coins: round2(spent.coins - withdrawn.coins), diamonds: round2(spent.diamonds - withdrawn.diamonds) },
    history
  };
}

// Обновить общий список топ-игроков
async function updateTop(lb, id, name, total, photo) {
  const top = (await lb.get('top', { type: 'json' })) || { entries: {} };
  const entries = top.entries || {};

  // 0 монет (например, сбросил прогресс) — убираем игрока из таблицы
  if (!(total > 0)) {
    if (entries[id]) {
      delete entries[id];
      top.entries = entries;
      top.updatedAt = Date.now();
      await lb.setJSON('top', top);
    }
    return;
  }

  const ids = Object.keys(entries);

  // не попадаем в топ и не было в нём — ничего не пишем
  if (!entries[id] && ids.length >= TOP_SIZE) {
    const min = Math.min(...ids.map(k => entries[k].t));
    if (total <= min) return;
  }

  entries[id] = { n: name, t: total, p: photo || null };
  const sorted = Object.entries(entries).sort((a, b) => b[1].t - a[1].t).slice(0, TOP_SIZE);
  top.entries = Object.fromEntries(sorted);
  top.updatedAt = Date.now();
  await lb.setJSON('top', top);
}

// ---------- тикеты поддержки ----------
const T_MAX_SUBJECT = 100, T_MAX_TEXT = 3000, T_MAX_FILES = 10, T_MAX_OPEN = 10, T_MAX_MSGS = 100;
const T_FILE_MAX_CHARS = 4_500_000;   // размер одного вложения (base64), чтобы запрос влез в лимит функции
const T_CREATE_COOLDOWN = 15_000;     // пауза между созданием обращений
const tText = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, n);
const newTid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const tKey = (uid, tid) => `t_${uid}_${tid}`;
const fKey = (uid, tid, i) => `f_${uid}_${tid}_${i}`;
const validTid = s => typeof s === 'string' && /^[A-Za-z0-9]{3,24}$/.test(s);
const validUid = s => typeof s === 'string' && /^\d{1,20}$/.test(s);

async function loadTickets(store, prefix) {
  const { blobs } = await store.list({ prefix });
  const out = [];
  for (let i = 0; i < blobs.length; i += 20) {
    const recs = await Promise.all(blobs.slice(i, i + 20).map(b => store.get(b.key, { type: 'json' }).catch(() => null)));
    recs.forEach(r => { if (r && r.id && Array.isArray(r.messages)) out.push(r); });
  }
  return out;
}
function ticketForUser(t) {
  return {
    id: t.id, subject: t.subject, status: t.status, createdAt: t.createdAt, updatedAt: t.updatedAt,
    unread: !!t.unreadUser,
    messages: t.messages.map(m => ({ from: m.from, text: m.text, ts: m.ts })),
    files: (t.files || []).map(f => ({ name: f.name, type: f.type, size: f.size }))
  };
}
function ticketForAdmin(t) {
  return Object.assign(ticketForUser(t), { uid: String(t.uid), name: t.name, username: t.username || null, unreadAdmin: !!t.unreadAdmin });
}
function ticketPreview(t) {
  const last = t.messages[t.messages.length - 1] || {};
  return {
    id: t.id, uid: String(t.uid), name: t.name, username: t.username || null, subject: t.subject, status: t.status,
    createdAt: t.createdAt, updatedAt: t.updatedAt, unreadAdmin: !!t.unreadAdmin,
    count: t.messages.length, lastFrom: last.from || 'user', preview: tText(last.text, 120), files: (t.files || []).length
  };
}

// сообщение от бота в Telegram (если человек не запускал бота — Telegram откажет, это не страшно)
async function tgSend(chatId, text, buttonText, buttonUrl) {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2500);
    const payload = { chat_id: chatId, text: String(text).slice(0, 3500), disable_web_page_preview: true };
    if (buttonText && /^https:\/\//.test(buttonUrl || '')) {
      payload.reply_markup = { inline_keyboard: [[{ text: buttonText, web_app: { url: buttonUrl } }]] };
    }
    await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload), signal: ctrl.signal
    });
    clearTimeout(timer);
  } catch (e) { /* уведомление необязательное */ }
}
// ---------- рефералы ----------
const REF_COINS = 100_000;      // монет за каждого приглашённого (и приглашённому тоже)
const REF_INCOME = 1000;        // +к прибыли в час за каждого
const REF_LIST_MAX = 100;       // сколько последних друзей показывать
let botNameCache = null;
async function botUsername() {
  if (process.env.BOT_USERNAME) return String(process.env.BOT_USERNAME).replace(/^@/, '');
  if (botNameCache) return botNameCache;
  try {
    const r = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/getMe`);
    const j = await r.json();
    if (j && j.ok && j.result && j.result.username) botNameCache = j.result.username;
  } catch (e) {}
  return botNameCache;
}
async function refLink(uid) {
  const bot = await botUsername();
  if (!bot) return null;
  const app = String(process.env.APP_SHORT_NAME || '').replace(/[^A-Za-z0-9_]/g, '');
  return `https://t.me/${bot}${app ? '/' + app : ''}?startapp=ref_${uid}`;
}
function emptyRefs() { return { count: 0, units: 0, list: [], by: null }; }
function sanitizeRefs(r) {
  const o = emptyRefs();
  if (!r || typeof r !== 'object') return o;
  o.count = Math.max(0, Math.trunc(Number(r.count)) || 0);
  o.units = Math.max(0, Math.trunc(Number(r.units)) || 0);
  o.list = Array.isArray(r.list) ? r.list.slice(0, REF_LIST_MAX) : [];
  o.by = r.by && typeof r.by === 'object' ? r.by : null;
  return o;
}
// Метка «этот аккаунт уже заходил в игру»: создаётся при самом первом обращении и больше не меняется,
// поэтому по реферальной ссылке награду можно получить только один раз и только новому игроку.
async function ensureRefMarker(refStore, store, user, hadProgress) {
  const key = `r_${user.id}`;
  const old = await refStore.get(key, { type: 'json' });
  if (old) return old;
  let by = null;
  const m = /^ref_(\d{1,20})$/.exec(user.start_param || '');
  if (m && m[1] !== String(user.id) && !hadProgress) {
    const inv = await store.get(`u_${m[1]}`, { type: 'json' });
    if (inv && inv.state) by = { id: m[1], n: inv.name || 'Игрок' };
  }
  const marker = { by, at: Date.now(), done: false };
  await refStore.setJSON(key, marker);
  return marker;
}
// запись в «историю операций» игрока (только фиксированный текст — игра выводит историю как HTML)
function pushHistory(st, title, amount, type = 'income') {
  if (!Array.isArray(st.history)) st.history = [];
  const entry = { id: Date.now() + String(Math.random()).slice(2, 6), type, title, amount, date: Date.now() };
  st.history.unshift(entry);
  if (st.history.length > 500) st.history.length = 500;
  return entry;
}
// две отдельные записи: монеты и прибыль в час (в списке монеты идут выше)
function pushRefHistory(st, title) {
  pushHistory(st, title, `+${REF_INCOME} к прибыли в час`);
  pushHistory(st, title, `+${REF_COINS.toLocaleString('ru-RU')} монет`);
}
function addCoins(st, n) { st.total = Math.min(MAX_VALUE, Math.max(0, (Number(st.total) || 0) + n)); }

const notifyAdmins = (origin, text) =>
  Promise.all(ADMIN_IDS.map(id => tgSend(id, text, 'открыть тикеты', origin + '/admin.html?tab=tickets')));

// =====================================================================
// БАНК: переводы монет и алмазов между игроками, запросы денег
// =====================================================================
const BANK_MAX = 1e15;              // потолок одного перевода
const BANK_TX_KEEP = 40;            // сколько последних переводов помним (чтобы повтор того же запроса не списал деньги дважды)
const BANK_LOG_KEEP = 1000;         // сколько последних банковских операций хранить для админа
const RQ_KEEP = 60;                 // сколько запросов хранить в каждом списке
const RQ_MAX_OUT = 20;              // сколько неотвеченных запросов может висеть у одного игрока
const RQ_MAX_PAIR = 3;              // и не больше трёх одному и тому же человеку
const RQ_COOLDOWN = 3000;           // пауза между запросами
// имя для текста в «истории операций»: игра выводит историю как HTML, поэтому никаких спецсимволов
const cleanName = (s, n = 30) => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f<>&"'`]/g, '').replace(/\s+/g, ' ').trim().slice(0, n) || 'Игрок';
function plural(n, f) { n = Math.abs(Math.trunc(n)); const a = n % 10, b = n % 100; return a === 1 && b !== 11 ? f[0] : (a >= 2 && a <= 4 && (b < 10 || b >= 20)) ? f[1] : f[2]; }
const money = (n, cur) => Math.trunc(n).toLocaleString('ru-RU') + ' ' +
  (cur === 'diamonds' ? plural(n, ['алмаз', 'алмаза', 'алмазов']) : plural(n, ['монета', 'монеты', 'монет']));
const cleanNote = s => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f<>&"'`]/g, '').replace(/\s+/g, ' ').trim().slice(0, 80);
const validTx = s => typeof s === 'string' && /^[A-Za-z0-9_\-]{6,48}$/.test(s);
const bankFail = (error, status = 400, extra) => ({ error, status, extra: extra || {} });

async function findPlayer(store, id) {
  if (!validUid(id)) return null;
  const r = await store.get(`u_${id}`, { type: 'json' });
  return r && r.state ? r : null;
}

// Перевод от fromRec (запись отправителя, уже прочитанная) игроку toId.
// Сначала списываем у отправителя, потом зачисляем получателю; если зачисление не удалось — возвращаем деньги.
async function bankTransfer(ctx, fromUser, fromRec, toId, currency, amount, txid, comment) {
  const { store, lb, origin, bankStore } = ctx;
  const fromId = String(fromUser.id);

  const dup = (fromRec.bankTx || []).find(x => x && x.id === txid);
  if (dup) return { ok: true, dup: true, rev: fromRec.rev, delta: { coins: 0, diamonds: 0 }, result: dup.res };

  if (currency !== 'coins' && currency !== 'diamonds') return bankFail('bad_currency');
  if (!Number.isInteger(amount) || amount < 1 || amount > BANK_MAX) return bankFail('bad_amount');
  if (toId === fromId) return bankFail('self');
  const toRec = await findPlayer(store, toId);
  if (!toRec) return bankFail('no_recipient', 404);
  if (activeBan(toRec)) return bankFail('recipient_banned');

  const st = fromRec.state;
  const have = currency === 'coins' ? Number(st.total) || 0 : Number(st.diamonds && st.diamonds.total) || 0;
  if (Math.floor(have) < amount) return bankFail('not_enough', 400, { available: Math.floor(have) });

  const now = Date.now();
  const note = cleanNote(comment);
  const toName = cleanName(toRec.name || toRec.username);
  const fromName = cleanName(fromRec.name || displayName(fromUser));

  // 1) списание у отправителя
  if (currency === 'coins') st.total = Math.max(0, (Number(st.total) || 0) - amount);
  else { ensureDiamonds(st); st.diamonds.total = Math.max(0, st.diamonds.total - amount); }
  const entry = pushHistory(st, `Перевод игроку ${toName}${note ? ' — «' + note + '»' : ''}`, `-${money(amount, currency)}`, 'spend');
  const result = { to: toId, toName, currency, amount, note, ts: now };
  fromRec.bankTx = [{ id: txid, res: result }].concat(fromRec.bankTx || []).slice(0, BANK_TX_KEEP);
  fromRec.rev = (fromRec.rev || 0) + 1;
  fromRec.deviceId = 'bank';
  fromRec.updatedAt = now;
  await store.setJSON(`u_${fromId}`, fromRec);

  // 2) зачисление получателю (читаем свежую запись, чтобы не затереть его последние изменения)
  let credited = null;
  try {
    const fresh = await store.get(`u_${toId}`, { type: 'json' });
    if (!fresh || !fresh.state) throw new Error('recipient gone');
    const cst = fresh.state;
    if (currency === 'coins') addCoins(cst, amount);
    else { ensureDiamonds(cst); cst.diamonds.total = Math.min(MAX_VALUE, cst.diamonds.total + amount); }
    pushHistory(cst, `Перевод от ${fromName}${note ? ' — «' + note + '»' : ''}`, `+${money(amount, currency)}`, 'income');
    fresh.rev = (fresh.rev || 0) + 1;
    fresh.deviceId = 'bank';
    fresh.updatedAt = now;
    await store.setJSON(`u_${toId}`, fresh);
    credited = fresh;
  } catch (e) {
    console.error('bank credit failed, rolling back', e);
    try {
      const back = await store.get(`u_${fromId}`, { type: 'json' });
      if (back && back.state) {
        if (currency === 'coins') addCoins(back.state, amount);
        else { ensureDiamonds(back.state); back.state.diamonds.total += amount; }
        if (Array.isArray(back.state.history)) back.state.history = back.state.history.filter(h => h.id !== entry.id);
        back.bankTx = (back.bankTx || []).filter(x => x.id !== txid);
        back.rev = (back.rev || 0) + 1; back.deviceId = 'bank'; back.updatedAt = Date.now();
        await store.setJSON(`u_${fromId}`, back);
      }
    } catch (e2) { console.error('bank rollback failed', e2); }
    return bankFail('transfer_failed', 500);
  }

  await bankLog(bankStore, { ts: now, type: 'transfer', from: fromId, fromName, to: toId, toName, currency, amount, note, viaRequest: String(txid).startsWith('rq') });

  // 3) таблица лидеров и уведомление получателю
  try { await updateTop(lb, fromId, fromRec.name || fromName, Math.floor(Number(fromRec.state.total) || 0), safePhoto(fromRec.photoUrl)); } catch (e) {}
  try { await updateTop(lb, toId, credited.name || toName, Math.floor(Number(credited.state.total) || 0), safePhoto(credited.photoUrl)); } catch (e) {}
  const toMode = bankModeOf(toId, credited);
  await tgSend(Number(toId), `тебе перевели ${money(amount, currency)}\nот ${fromName}${note ? '\n«' + note + '»' : ''}`,
    toMode !== 'off' ? 'открыть банк' : null, toMode !== 'off' ? origin + '/bank.html' : null);

  return { ok: true, rev: fromRec.rev, entry, result, delta: { coins: currency === 'coins' ? -amount : 0, diamonds: currency === 'diamonds' ? -amount : 0 } };
}

// общий журнал банка для админа (новые сверху); сбой записи журнала не ломает саму операцию
async function bankLog(bs, ev) {
  if (!bs) return;
  try {
    const cur = await bs.get('log', { type: 'json' });
    const list = Array.isArray(cur && cur.list) ? cur.list : [];
    await bs.setJSON('log', { list: [ev].concat(list).slice(0, BANK_LOG_KEEP) });
  } catch (e) { console.error('bank log failed', e); }
}

// списки запросов денег: in_<id> — входящие, out_<id> — отправленные (в каждом хранится копия запроса)
async function rqRead(bs, key) {
  const v = await bs.get(key, { type: 'json' });
  return Array.isArray(v && v.list) ? v.list : [];
}
const rqWrite = (bs, key, list) => bs.setJSON(key, { list: list.slice(0, RQ_KEEP) });
async function rqSetStatus(bs, rq, status) {
  const done = Date.now();
  for (const key of [`in_${rq.to}`, `out_${rq.from}`]) {
    try {
      const list = await rqRead(bs, key);
      const it = list.find(x => x.id === rq.id);
      if (it) { it.status = status; it.doneAt = done; await rqWrite(bs, key, list); }
    } catch (e) { console.error('rq status failed', e); }
  }
}

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  const botToken = process.env.BOT_TOKEN;
  if (!botToken) return json({ error: 'server_not_configured' }, 500);

  let body;
  try {
    const text = await req.text();
    if (text.length > 6_000_000) return json({ error: 'too_big' }, 413);
    body = JSON.parse(text);
    if (text.length > MAX_BODY && body.action !== 'ticket_file') return json({ error: 'too_big' }, 413);
  } catch (e) {
    return json({ error: 'bad_json' }, 400);
  }

  const user = verifyInitData(body.initData, botToken);
  if (!user) return json({ error: 'unauthorized' }, 401);

  // проверка прав админа (по подписанному Telegram id, подделать нельзя)
  if (body.action === 'whoami') {
    return json({ isAdmin: ADMIN_IDS.includes(String(user.id)) });
  }

  // strong: читаем всегда свежую запись, а не устаревшую копию
  const store = getStore({ name: 'players', consistency: 'strong' });
  const lb = getStore({ name: 'leaderboard', consistency: 'strong' });
  const tre = getStore({ name: 'treasury', consistency: 'strong' });
  const tkStore = getStore({ name: 'tickets', consistency: 'strong' });
  const tfStore = getStore({ name: 'ticketfiles', consistency: 'strong' });
  const refStore = getStore({ name: 'referrals', consistency: 'strong' });
  const bankStore = getStore({ name: 'bank', consistency: 'strong' });
  const origin = new URL(req.url).origin;
  // ---------- админские запросы (только для ADMIN_IDS) ----------
  if (typeof body.action === 'string' && body.action.startsWith('admin_')) {
    if (!ADMIN_IDS.includes(String(user.id))) return json({ error: 'forbidden' }, 403);

    if (body.action === 'admin_bank_log') {
      const cur = await bankStore.get('log', { type: 'json' });
      return json({ log: Array.isArray(cur && cur.list) ? cur.list : [] });
    }

    if (body.action === 'admin_list') {
      const rows = (await loadAllRecords(store)).map(summary);
      rows.sort((a, b) => b.total - a.total);
      return json({ players: rows });
    }

    // ----- казна -----
    if (body.action === 'admin_treasury') {
      const t = await treasurySnapshot(store, tre);
      const items = t.history.concat(t.log.map((w, i) => ({
        kind: 'withdraw', id: 'w' + w.ts + '_' + i, ts: w.ts, currency: w.currency, amount: w.amount,
        title: 'Вывод на баланс игры', name: w.byName || 'Админ', uid: w.by
      })));
      items.sort((a, b) => b.ts - a.ts);
      return json({
        balance: t.balance, spent: t.spent, withdrawn: t.withdrawn, payers: t.payers,
        history: items.slice(0, 300)
      });
    }

    if (body.action === 'admin_withdraw') {
      const currency = body.currency === 'diamonds' ? 'diamonds' : body.currency === 'coins' ? 'coins' : null;
      if (!currency) return json({ error: 'bad_currency' }, 400);
      const t = await treasurySnapshot(store, tre);
      const available = Math.floor(t.balance[currency]);
      const amount = body.amount === 'all' ? available : Math.floor(Number(body.amount));
      if (!Number.isFinite(amount) || amount < 1) return json({ error: available < 1 ? 'empty' : 'bad_value' }, 400);
      if (amount > available) return json({ error: 'not_enough', available }, 400);

      // зачисляем на игровой баланс самого админа
      const mykey = `u_${user.id}`;
      const mine = await store.get(mykey, { type: 'json' });
      if (!mine || !mine.state) return json({ error: 'no_player' }, 404);

      // сначала списываем из казны (если дальше сбой — откатим), потом зачисляем игроку
      const newMeta = {
        withdrawn: { coins: t.withdrawn.coins, diamonds: t.withdrawn.diamonds },
        log: [{ ts: Date.now(), by: String(user.id), byName: displayName(user), currency, amount }].concat(t.log).slice(0, 100)
      };
      newMeta.withdrawn[currency] = round2(newMeta.withdrawn[currency] + amount);
      await tre.setJSON('meta', newMeta);
      try {
        const err = applyAdminAction(mine.state, currency === 'coins' ? 'addCoins' : 'addDiamonds', amount);
        if (err) throw new Error(err);
        mine.rev = (mine.rev || 0) + 1;
        mine.deviceId = 'admin';
        mine.updatedAt = Date.now();
        await store.setJSON(mykey, mine);
      } catch (e) {
        await tre.setJSON('meta', t.meta).catch(() => {}); // откат списания
        console.error('withdraw failed', e);
        return json({ error: 'withdraw_failed' }, 500);
      }
      try {
        await updateTop(lb, String(user.id), mine.name || displayName(user), Math.floor(Number(mine.state.total) || 0), safePhoto(mine.photoUrl));
      } catch (e) { console.error('leaderboard update failed', e); }
      const left = { coins: round2(t.balance.coins - (currency === 'coins' ? amount : 0)), diamonds: round2(t.balance.diamonds - (currency === 'diamonds' ? amount : 0)) };
      return json({ ok: true, amount, currency, balance: left });
    }

    // ----- тикеты поддержки (админ) -----
    if (body.action === 'admin_tickets') {
      const list = (await loadTickets(tkStore, 't_')).map(ticketPreview);
      list.sort((a, b) => b.updatedAt - a.updatedAt);
      const counts = { open: 0, answered: 0, closed: 0, unread: 0 };
      list.forEach(t => { counts[t.status] = (counts[t.status] || 0) + 1; if (t.unreadAdmin) counts.unread++; });
      return json({ tickets: list.slice(0, 500), counts });
    }
    if (body.action.startsWith('admin_ticket')) {
      const tuid = String(body.uid || ''), ttid = String(body.id || '');
      if (!validUid(tuid) || !validTid(ttid)) return json({ error: 'bad_target' }, 400);
      const k = tKey(tuid, ttid);
      const t = await tkStore.get(k, { type: 'json' });
      if (!t || !Array.isArray(t.messages)) return json({ error: 'no_ticket' }, 404);

      if (body.action === 'admin_ticket') {          // открыть обращение (и пометить прочитанным)
        if (t.unreadAdmin) { t.unreadAdmin = false; await tkStore.setJSON(k, t); }
        return json({ ticket: ticketForAdmin(t) });
      }
      if (body.action === 'admin_ticket_file') {
        const idx = Math.floor(Number(body.idx));
        if (!(idx >= 0) || idx >= (t.files || []).length) return json({ error: 'no_file' }, 404);
        const f = await tfStore.get(fKey(tuid, ttid, idx), { type: 'json' });
        if (!f) return json({ error: 'no_file' }, 404);
        return json({ name: f.name, type: f.type, data: f.data });
      }
      if (body.action === 'admin_ticket_reply') {
        const text = tText(body.text, T_MAX_TEXT);
        if (!text) return json({ error: 'bad_value' }, 400);
        if (t.messages.length >= T_MAX_MSGS) return json({ error: 'too_many' }, 400);
        const now = Date.now();
        t.messages.push({ from: 'admin', text, ts: now });
        t.status = body.close ? 'closed' : 'answered';
        t.unreadUser = true; t.unreadAdmin = false; t.updatedAt = now;
        await tkStore.setJSON(k, t);
        await tgSend(Number(tuid), `ответ поддержки на обращение «${t.subject}»:\n\n${text}`);
        return json({ ok: true, ticket: ticketForAdmin(t) });
      }
      if (body.action === 'admin_ticket_status') {
        if (body.status !== 'open' && body.status !== 'closed') return json({ error: 'bad_value' }, 400);
        t.status = body.status === 'closed' ? 'closed' : (t.messages.some(m => m.from === 'admin') ? 'answered' : 'open');
        t.updatedAt = Date.now();
        await tkStore.setJSON(k, t);
        return json({ ok: true, ticket: ticketForAdmin(t) });
      }
      if (body.action === 'admin_ticket_delete') {
        for (let i = 0; i < (t.files || []).length; i++) { await tfStore.delete(fKey(tuid, ttid, i)).catch(() => {}); }
        await tkStore.delete(k);
        return json({ ok: true });
      }
      return json({ error: 'unknown_action' }, 400);
    }

    const tid = String(body.targetId || '').replace(/\D/g, '');
    if (!tid) return json({ error: 'bad_target' }, 400);
    const tkey = `u_${tid}`;
    const rec = await store.get(tkey, { type: 'json' });
    if (!rec || !rec.state) return json({ error: 'no_player' }, 404);

    if (body.action === 'admin_get') {
      return json({ summary: summary(rec), state: rec.state });
    }

    if (body.action === 'admin_update' && (body.act === 'ban' || body.act === 'unban')) {
      const now = Date.now();
      if (body.act === 'ban') {
        if (ADMIN_IDS.includes(tid)) return json({ error: 'cant_ban_admin' }, 400);
        const v = body.value && typeof body.value === 'object' ? body.value : {};
        const reason = String(v.reason || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120);
        if (!reason) return json({ error: 'bad_reason' }, 400);
        let until = 0;
        if (v.days !== 'forever') {
          const d = Math.floor(Number(v.days));
          if (!(d >= 1) || d > 3650) return json({ error: 'bad_value' }, 400);
          until = now + d * 86400000;
        }
        rec.ban = { until, reason, at: now, by: String(user.id) };
        try { await updateTop(lb, tid, rec.name || 'Игрок', 0, null); } catch (e) { console.error('leaderboard update failed', e); }
      } else {
        delete rec.ban;
        try { await updateTop(lb, tid, rec.name || 'Игрок', Math.floor(Number(rec.state.total) || 0), safePhoto(rec.photoUrl)); } catch (e) {}
      }
      await store.setJSON(tkey, rec);
      return json({ ok: true, summary: summary(rec), state: rec.state });
    }

    // доступ к банку: off — нет, button — кнопка «Банк» в игре, full — игра полностью заменяется банком
    if (body.action === 'admin_update' && body.act === 'bankMode') {
      const mode = body.value;
      if (mode !== 'off' && mode !== 'button' && mode !== 'full') return json({ error: 'bad_value' }, 400);
      if (ADMIN_IDS.includes(tid)) return json({ error: 'cant_set_admin' }, 400);
      if (mode === 'off') delete rec.bank;
      else rec.bank = { mode, at: Date.now(), by: String(user.id) };
      await store.setJSON(tkey, rec);
      return json({ ok: true, summary: summary(rec), state: rec.state });
    }

    if (body.action === 'admin_update' && body.act === 'resetAsNew') {
      // полный сброс «как нового игрока»: прогресс и друзья обнуляются, а по реферальной ссылке снова можно получить награду (для тестов)
      const now = Date.now();
      try {
        const old = await refStore.get(`r_${tid}`, { type: 'json' });
        if (old && old.by && old.done) {          // приглашавшему убираем этого друга из счётчика (монеты остаются у него)
          const invKey = `u_${old.by.id}`;
          const inv = await store.get(invKey, { type: 'json' });
          if (inv && inv.state) {
            const refs = sanitizeRefs(inv.state.refs);
            if (refs.list.some(x => String(x.id) === tid)) {
              refs.list = refs.list.filter(x => String(x.id) !== tid);
              refs.count = Math.max(0, refs.count - 1);
              refs.units = Math.max(0, refs.units - 1);
              inv.state.refs = refs;
              inv.rev = (inv.rev || 0) + 1; inv.deviceId = 'referral'; inv.updatedAt = now;
              await store.setJSON(invKey, inv);
            }
          }
        }
        await refStore.delete(`r_${tid}`);
      } catch (e) { console.error('ref reset failed', e); }
      const keepNick = rec.state.nickname, keepOverride = rec.state.nickOverride;
      rec.state = {
        total: 0, bonus: 0,
        upgrades: { plus20: false, miniBoost: false },
        skins: { owned: {}, equipped: null },
        diamonds: { total: 0, lastTs: now, upgrades: {} },
        passive: { level: 0, lastTs: now },
        energyCurrent: 100, lastEnergyRegen: now, lastTapTs: 0,
        multiclick: { totalBonus: 0, currentTier: 0, purchasesInTier: 0 },
        holdToTap: false
      };
      if (keepNick) rec.state.nickname = keepNick;
      if (keepOverride) rec.state.nickOverride = keepOverride;
      rec.refReset = true;
      rec.rev = (rec.rev || 0) + 1; rec.deviceId = 'admin'; rec.updatedAt = now;
      await store.setJSON(tkey, rec);
      try { await updateTop(lb, tid, rec.name || 'Игрок', 0, safePhoto(rec.photoUrl)); } catch (e) {}
      return json({ ok: true, summary: summary(rec), state: rec.state });
    }

    if (body.action === 'admin_update') {
      const err = applyAdminAction(rec.state, body.act, body.value);
      if (err) return json({ error: err }, 400);
      rec.rev = (rec.rev || 0) + 1;
      rec.deviceId = 'admin';
      rec.updatedAt = Date.now();
      await store.setJSON(tkey, rec);
      try {
        await updateTop(lb, tid, rec.name || rec.firstName || 'Игрок', Math.floor(Number(rec.state.total) || 0), safePhoto(rec.photoUrl));
      } catch (e) {
        console.error('leaderboard update failed', e);
      }
      return json({ ok: true, summary: summary(rec), state: rec.state });
    }

    return json({ error: 'unknown_action' }, 400);
  }

  // ---------- тикеты поддержки (игрок видит только свои) ----------
  if (typeof body.action === 'string' && (body.action === 'tickets' || body.action.startsWith('ticket_'))) {
    const uid = String(user.id);
    const prefix = `t_${uid}_`;
    const now = Date.now();

    if (body.action === 'tickets') {
      const list = await loadTickets(tkStore, prefix);
      list.sort((a, b) => b.updatedAt - a.updatedAt);
      return json({ tickets: list.map(ticketForUser) });
    }

    if (body.action === 'ticket_create') {
      const subject = tText(body.subject, T_MAX_SUBJECT).replace(/\s+/g, ' ');
      const message = tText(body.message, T_MAX_TEXT);
      if (!subject || !message) return json({ error: 'bad_value' }, 400);
      const mine = await loadTickets(tkStore, prefix);
      if (mine.filter(t => t.status !== 'closed').length >= T_MAX_OPEN) return json({ error: 'too_many_open' }, 429);
      if (mine.some(t => now - t.createdAt < T_CREATE_COOLDOWN)) return json({ error: 'too_fast' }, 429);
      const t = {
        id: newTid(), uid, name: displayName(user), username: user.username || null, subject,
        status: 'open', createdAt: now, updatedAt: now, unreadAdmin: true, unreadUser: false, files: [],
        messages: [{ from: 'user', text: message, ts: now }]
      };
      await tkStore.setJSON(tKey(uid, t.id), t);
      await notifyAdmins(origin, `новое обращение в поддержку\n${t.name}${t.username ? ' (@' + t.username + ')' : ''}\n«${subject}»\n\n${message.slice(0, 600)}`);
      return json({ ok: true, id: t.id });
    }

    // перенос старых обращений, которые лежали только на устройстве (повтор безопасен: дубли по lid не создаются)
    if (body.action === 'ticket_import') {
      const items = Array.isArray(body.items) ? body.items.slice(0, 30) : [];
      const result = [];
      for (const it of items) {
        const lid = String((it && it.lid) || '').replace(/\D/g, '').slice(0, 16);
        if (!lid) continue;
        const tid = 'l' + lid;
        const k = tKey(uid, tid);
        if (await tkStore.get(k, { type: 'json' })) { result.push({ lid, id: tid, created: false }); continue; }
        const subject = tText(it.subject, T_MAX_SUBJECT).replace(/\s+/g, ' ');
        const message = tText(it.message, T_MAX_TEXT);
        if (!subject || !message) continue;
        let d = Number(it.date);
        if (!Number.isFinite(d) || d <= 0 || d > now) d = now;
        await tkStore.setJSON(k, {
          id: tid, uid, name: displayName(user), username: user.username || null, subject,
          status: 'open', createdAt: d, updatedAt: d, unreadAdmin: true, unreadUser: false, files: [], imported: true,
          messages: [{ from: 'user', text: message, ts: d }]
        });
        result.push({ lid, id: tid, created: true });
      }
      return json({ ok: true, items: result });
    }

    const tid = String(body.id || '');
    if (!validTid(tid)) return json({ error: 'bad_target' }, 400);
    const k = tKey(uid, tid);
    const t = await tkStore.get(k, { type: 'json' });
    if (!t || !Array.isArray(t.messages)) return json({ error: 'no_ticket' }, 404);

    if (body.action === 'ticket_file') {
      if (t.status === 'closed') return json({ error: 'closed' }, 400);
      if ((t.files || []).length >= T_MAX_FILES) return json({ error: 'too_many_files' }, 400);
      const data = String(body.data || '');
      if (!/^data:[\w\/+.\-]{1,100};base64,/.test(data)) return json({ error: 'bad_value' }, 400);
      if (data.length > T_FILE_MAX_CHARS) return json({ error: 'file_too_big' }, 413);
      const idx = (t.files || []).length;
      const type = data.slice(5, data.indexOf(';'));
      const f = { name: tText(body.name, 80) || 'file', type, size: Math.round((data.length - data.indexOf(',') - 1) * 3 / 4) };
      await tfStore.setJSON(fKey(uid, tid, idx), Object.assign({ data }, f));
      t.files = (t.files || []).concat([f]);
      await tkStore.setJSON(k, t);
      return json({ ok: true, idx });
    }
    if (body.action === 'ticket_file_get') {
      const idx = Math.floor(Number(body.idx));
      if (!(idx >= 0) || idx >= (t.files || []).length) return json({ error: 'no_file' }, 404);
      const f = await tfStore.get(fKey(uid, tid, idx), { type: 'json' });
      if (!f) return json({ error: 'no_file' }, 404);
      return json({ name: f.name, type: f.type, data: f.data });
    }
    if (body.action === 'ticket_read') {
      if (t.unreadUser) { t.unreadUser = false; await tkStore.setJSON(k, t); }
      return json({ ok: true });
    }
    if (body.action === 'ticket_reply') {
      if (t.status === 'closed') return json({ error: 'closed' }, 400);
      const text = tText(body.text, T_MAX_TEXT);
      if (!text) return json({ error: 'bad_value' }, 400);
      if (t.messages.length >= T_MAX_MSGS) return json({ error: 'too_many' }, 400);
      t.messages.push({ from: 'user', text, ts: now });
      t.status = 'open'; t.unreadAdmin = true; t.updatedAt = now;
      await tkStore.setJSON(k, t);
      await notifyAdmins(origin, `новое сообщение в обращении «${t.subject}»\n${t.name}${t.username ? ' (@' + t.username + ')' : ''}\n\n${text.slice(0, 600)}`);
      return json({ ok: true, ticket: ticketForUser(t) });
    }
    return json({ error: 'unknown_action' }, 400);
  }

  const key = `u_${user.id}`;
  const current = await store.get(key, { type: 'json' });

  // забаненный игрок не может ни играть, ни сохраняться: игра показывает ему окно бана (прогресс не трогаем)
  {
    const ban = activeBan(current);
    if (ban && (['load', 'save', 'top', 'ref_info'].includes(body.action) || (typeof body.action === 'string' && body.action.startsWith('bank_')))) return json({ error: 'banned', ban }, 403);
  }

  if (body.action === 'ref_info') {
    const refs = sanitizeRefs(current && current.state && current.state.refs);
    return json({
      link: await refLink(user.id),
      count: refs.count, units: refs.units, list: refs.list, by: refs.by,
      coins: REF_COINS, income: REF_INCOME
    });
  }

  if (body.action === 'load') {
    // «починка» таблицы лидеров: если игрок давно ничего не сохранял, а сумма в таблице отличается от его баланса
    // (например, потратил монеты, и последнее сохранение попало в паузу), подтягиваем актуальную сумму
    if (current && current.state && !activeBan(current)) {
      try {
        const tot = Math.floor(Number(current.state.total) || 0);
        const heal = (globalThis.__lbHeal = globalThis.__lbHeal || {});
        const nowH = Date.now();
        if (tot > 0 && tot !== current.lbTotal && nowH - (current.updatedAt || 0) > LB_UPDATE_EVERY && nowH - (heal[user.id] || 0) > 600_000) {
          heal[user.id] = nowH;
          await updateTop(lb, String(user.id), displayName(user), tot, safePhoto(current.photoUrl || user.photo_url));
        }
      } catch (e) { console.error('leaderboard heal failed', e); }
    }
    if (!current || (current.refReset && body.hadProgress !== true)) { try { await ensureRefMarker(refStore, store, user, body.hadProgress === true); } catch (e) { console.error('ref marker failed', e); } }
    return json({ exists: !!current, record: publicRecord(current) || null, bank: bankModeOf(user.id, current) });
  }

  // ---------- банк ----------
  if (typeof body.action === 'string' && body.action.startsWith('bank_')) {
    const myMode = bankModeOf(user.id, current);
    if (body.action === 'bank_info') {
      return json({ mode: myMode, access: myMode !== 'off', id: String(user.id) });
    }
    if (myMode === 'off') return json({ error: 'no_bank' }, 403);
    if (!current || !current.state) return json({ error: 'no_player' }, 404);
    const uid = String(user.id);
    const ctx = { store, lb, origin, bankStore };
    const fail = f => json(Object.assign({ error: f.error }, f.extra), f.status);
    const parseId = v => String(v == null ? '' : v).replace(/\D/g, '');
    const parseAmount = v => (typeof v === 'number' || (typeof v === 'string' && /^\d{1,16}$/.test(v.trim()))) ? Number(v) : NaN;

    // найти игрока по Telegram id (чтобы показать имя перед переводом)
    if (body.action === 'bank_find') {
      const id = parseId(body.id);
      const p = await findPlayer(store, id);
      if (!p) return json({ found: false });
      return json({
        found: true, id, self: id === uid,
        name: cleanName(p.name || p.username),
        photo: safePhoto(p.photoUrl), hasBank: bankModeOf(id, p) !== 'off', banned: !!activeBan(p)
      });
    }

    // список игроков для выбора получателя: только имена и аватарки (ни username, ни баланса)
    if (body.action === 'bank_players') {
      const now = Date.now();
      if (!globalThis.__bankDir || now - globalThis.__bankDir.at > 30_000) {
        const recs = await loadAllRecords(store);
        globalThis.__bankDir = { at: now, rows: recs.map(r => ({
          id: String(r.tgId), name: cleanName(r.name || r.username), photo: safePhoto(r.photoUrl),
          hasBank: bankModeOf(r.tgId, r) !== 'off', banned: !!activeBan(r)
        })) };
      }
      const players = globalThis.__bankDir.rows
        .filter(p => p.id !== uid && !p.banned)
        .sort((a, b) => a.name.localeCompare(b.name, 'ru'))
        .slice(0, 1000)
        .map(({ id, name, photo, hasBank }) => ({ id, name, photo, hasBank }));
      return json({ players });
    }

    // перевод
    if (body.action === 'bank_transfer') {
      if (!validTx(body.txid)) return json({ error: 'bad_tx' }, 400);
      const res = await bankTransfer(ctx, user, current, parseId(body.to), body.currency, parseAmount(body.amount), body.txid, body.comment);
      if (res.error) return fail(res);
      return json(res);
    }

    // запрос денег (и отправитель, и получатель должны иметь банк)
    if (body.action === 'bank_request') {
      const to = parseId(body.to);
      const currency = body.currency === 'diamonds' ? 'diamonds' : body.currency === 'coins' ? 'coins' : null;
      const amount = parseAmount(body.amount);
      if (!currency) return json({ error: 'bad_currency' }, 400);
      if (!Number.isInteger(amount) || amount < 1 || amount > BANK_MAX) return json({ error: 'bad_amount' }, 400);
      if (to === uid) return json({ error: 'self' }, 400);
      const trec = await findPlayer(store, to);
      if (!trec) return json({ error: 'no_recipient' }, 404);
      if (activeBan(trec)) return json({ error: 'recipient_banned' }, 400);
      if (bankModeOf(to, trec) === 'off') return json({ error: 'target_no_bank' }, 400);

      const out = await rqRead(bankStore, `out_${uid}`);
      const now = Date.now();
      const pending = out.filter(x => x.status === 'pending');
      if (out.some(x => now - x.ts < RQ_COOLDOWN)) return json({ error: 'too_fast' }, 429);
      if (pending.length >= RQ_MAX_OUT) return json({ error: 'too_many' }, 429);
      if (pending.filter(x => x.to === to).length >= RQ_MAX_PAIR) return json({ error: 'too_many_pair' }, 429);

      const rq = {
        id: newTid(), from: uid, fromName: cleanName(current.name || displayName(user)),
        to, toName: cleanName(trec.name || trec.username),
        currency, amount, comment: tText(body.comment, 80).replace(/\s+/g, ' '),
        status: 'pending', ts: now
      };
      const inc = await rqRead(bankStore, `in_${to}`);
      await rqWrite(bankStore, `in_${to}`, [rq].concat(inc));
      await rqWrite(bankStore, `out_${uid}`, [rq].concat(out));
      await bankLog(bankStore, { ts: now, type: 'request', from: uid, fromName: rq.fromName, to, toName: rq.toName, currency, amount, note: rq.comment });
      const toMode = bankModeOf(to, trec);
      await tgSend(Number(to), `${rq.fromName} запрашивает у тебя ${money(amount, currency)}${rq.comment ? '\n«' + rq.comment + '»' : ''}`,
        toMode !== 'off' ? 'открыть банк' : null, toMode !== 'off' ? origin + '/bank.html' : null);
      return json({ ok: true, request: rq });
    }

    // уведомления: входящие и отправленные запросы
    if (body.action === 'bank_inbox') {
      const incoming = await rqRead(bankStore, `in_${uid}`);
      const outgoing = await rqRead(bankStore, `out_${uid}`);
      return json({ incoming, outgoing, pending: incoming.filter(x => x.status === 'pending').length });
    }

    // ответ на запрос: оплатить или отклонить
    if (body.action === 'bank_respond') {
      const id = String(body.id || '');
      if (!validTid(id)) return json({ error: 'bad_target' }, 400);
      const inc = await rqRead(bankStore, `in_${uid}`);
      const rq = inc.find(x => x.id === id);
      if (!rq) return json({ error: 'no_request' }, 404);
      if (rq.status !== 'pending') return json({ error: 'already_done', status: rq.status }, 400);
      if (!body.accept) {
        await rqSetStatus(bankStore, rq, 'declined');
        await bankLog(bankStore, { ts: Date.now(), type: 'declined', from: rq.from, fromName: rq.fromName, to: rq.to, toName: rq.toName, currency: rq.currency, amount: rq.amount, note: rq.comment });
        await tgSend(Number(rq.from), `${cleanName(current.name || displayName(user))} отклонил твой запрос на ${money(rq.amount, rq.currency)}`);
        return json({ ok: true, status: 'declined' });
      }
      // оплата: сумма и валюта берутся из самого запроса, а не из присланных данных; txid привязан к запросу, поэтому дважды не спишется
      const res = await bankTransfer(ctx, user, current, rq.from, rq.currency, rq.amount, 'rq' + rq.id, rq.comment);
      if (res.error) return fail(res);
      await rqSetStatus(bankStore, rq, 'paid');
      return json(Object.assign(res, { status: 'paid' }));
    }

    return json({ error: 'unknown_action' }, 400);
  }

  if (body.action === 'top') {
    let top = (await lb.get('top', { type: 'json' })) || { entries: {} };

    // игрок уже есть на сервере, но ещё не в таблице (например, не сохранялся после обновления) — добавим его
    if (current && current.state && !(top.entries && top.entries[String(user.id)])) {
      const t = Math.floor(Number(current.state.total));
      if (Number.isFinite(t) && t > 0) {
        try {
          await updateTop(lb, String(user.id), displayName(user), t, safePhoto(user.photo_url));
          top = (await lb.get('top', { type: 'json' })) || { entries: {} };
        } catch (e) {
          console.error('leaderboard self-heal failed', e);
        }
      }
    }

    const list = Object.entries(top.entries || {})
      .filter(([, e]) => e.t > 0)
      .sort((a, b) => b[1].t - a[1].t)
      .slice(0, TOP_SIZE)
      .map(([id, e], i) => ({
        rank: i + 1,
        name: e.n,
        total: e.t,
        photo: safePhoto(e.p),
        isMe: id === String(user.id)
      }));
    return json({ top: list, updatedAt: top.updatedAt || 0 });
  }

  if (body.action === 'save') {
    const st = body.state;
    if (!st || typeof st !== 'object' || !Number.isFinite(Number(st.total)) || Number(st.total) < 0) {
      return json({ error: 'bad_state' }, 400);
    }
    const baseRev = Number(body.baseRev) || 0;
    const curRev = current ? current.rev : 0;

    // другое устройство уже записало более новую версию
    if (current && baseRev !== curRev) {
      return json({ error: 'conflict', record: publicRecord(current) }, 409);
    }

    const extra = {};
    if (body.extra && typeof body.extra === 'object') {
      for (const k of ['lowkie_little_last', 'lowkie_wheel_last']) {
        const v = Number(body.extra[k]);
        if (Number.isFinite(v) && v > 0) extra[k] = v;
      }
    }

    // реферальные данные ведёт только сервер — присланные игрой не принимаем
    let refMarker = null;
    if (current && current.state && current.state.refs) st.refs = sanitizeRefs(current.state.refs);
    else delete st.refs;
    if (!current || current.refReset) {
      try { refMarker = await ensureRefMarker(refStore, store, user, false); } catch (e) { console.error('ref marker failed', e); }
      if (refMarker && (!refMarker.by || refMarker.done)) refMarker = null;
    }
    let refBonus = false;
    if (refMarker) {
      addCoins(st, REF_COINS);
      pushRefHistory(st, 'Приглашение друга');
      const r = emptyRefs();
      r.units = 1; r.by = { id: refMarker.by.id, n: refMarker.by.n, ts: Date.now() };
      st.refs = r;
      refBonus = true;
    }

    const now = Date.now();
    const name = displayName(user);
    // обнуление (сброс прогресса) отражаем в таблице сразу, не дожидаясь паузы
    // баланс упал (потратил монеты) — тоже обновляем сразу: иначе в таблице надолго остаётся старая, завышенная сумма
    const lbTotalNow = Math.floor(Number(st.total) || 0);
    const lbDropped = !!current && Number.isFinite(current.lbTotal) && lbTotalNow < current.lbTotal;
    const lbDue = !current || now - (current.lbAt || 0) > LB_UPDATE_EVERY || lbDropped || !(Number(st.total) > 0);

    const record = {
      rev: curRev + 1,
      state: st,
      extra,
      deviceId: typeof body.deviceId === 'string' ? body.deviceId.slice(0, 64) : null,
      tgId: user.id,
      username: user.username || null,
      name,
      photoUrl: safePhoto(user.photo_url),
      lbAt: lbDue ? now : (current.lbAt || 0),
      lbTotal: lbDue ? lbTotalNow : (current && Number.isFinite(current.lbTotal) ? current.lbTotal : undefined),
      updatedAt: now,
      spent: current && current.spent,
      spendLog: current && current.spendLog
    };
    if (!record.spent) delete record.spent;
    if (!record.spendLog) delete record.spendLog;
    // доступ к банку и журнал переводов ведёт только сервер — при сохранении игры не теряем
    if (current && current.bank) record.bank = current.bank;
    if (current && current.bankTx) record.bankTx = current.bankTx;
    applySpends(record, body.spends);
    await store.setJSON(key, record);

    if (refBonus) {
      // награда приглашённому уже записана — закрываем метку и начисляем пригласившему
      try {
        await refStore.setJSON(`r_${user.id}`, Object.assign({}, refMarker, { done: true, doneAt: now }));
        const invKey = `u_${refMarker.by.id}`;
        const inv = await store.get(invKey, { type: 'json' });
        if (inv && inv.state) {
          const refs = sanitizeRefs(inv.state.refs);
          if (!refs.list.some(x => String(x.id) === String(user.id))) {
            refs.count += 1; refs.units += 1;
            refs.list.unshift({ id: String(user.id), n: name, ts: now });
            refs.list = refs.list.slice(0, REF_LIST_MAX);
            inv.state.refs = refs;
            addCoins(inv.state, REF_COINS);
            pushRefHistory(inv.state, 'Новый реферал');
            inv.rev = (inv.rev || 0) + 1;
            inv.deviceId = 'referral';
            inv.updatedAt = now;
            await store.setJSON(invKey, inv);
            if (!activeBan(inv)) try { await updateTop(lb, String(refMarker.by.id), inv.name || 'Игрок', Math.floor(Number(inv.state.total)), inv.photoUrl || null); } catch (e) {}
            await tgSend(Number(refMarker.by.id), `по твоей ссылке в игру пришёл ${name}: +${REF_COINS.toLocaleString('ru-RU')} монет и +${REF_INCOME} к прибыли в час`);
          }
        }
      } catch (e) {
        console.error('referral reward failed', e);
      }
    }

    if (lbDue) {
      try {
        await updateTop(lb, String(user.id), name, Math.floor(Number(st.total)), safePhoto(user.photo_url));
      } catch (e) {
        console.error('leaderboard update failed', e);
      }
    }
    if (refBonus) return json({ ok: true, rev: record.rev, bonus: true, record: publicRecord(record) });
    return json({ ok: true, rev: record.rev });
  }

  return json({ error: 'unknown_action' }, 400);
};
