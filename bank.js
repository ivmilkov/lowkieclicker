/* =========================================================================
   Lowkie Bank — клиентская логика.
   Банк — это оболочка поверх игры: баланс, тапы, история и улучшения берутся из
   того же state, что и в обычной игре (script.js), а синхронизация с Telegram идёт
   через cloud.js. Здесь только интерфейс банка и вызовы банковских функций сервера:
   переводы, запросы денег, уведомления.
   Грузится ПОСЛЕ script.js и cloud.js.
   ========================================================================= */
(function () {
  "use strict";

  function byId(id) { return document.getElementById(id); }
  var L = window.LowkieCloud || null;                       // вне Telegram его нет — банк только показывает баланс
  var tg = window.Telegram && window.Telegram.WebApp;
  var MY_ID = L && L.uid ? String(L.uid) : "";

  /* ---------------------------------------------------------------------
     общие помощники
     --------------------------------------------------------------------- */
  function fmt(n) { return typeof formatNum === "function" ? formatNum(n) : String(n); }
  function intFmt(n) { return Math.trunc(Number(n) || 0).toLocaleString("ru-RU"); }
  function plural(n, f) {
    n = Math.abs(Math.trunc(n)); var a = n % 10, b = n % 100;
    return a === 1 && b !== 11 ? f[0] : (a >= 2 && a <= 4 && (b < 10 || b >= 20)) ? f[1] : f[2];
  }
  function money(n, cur) {
    return intFmt(n) + " " + (cur === "diamonds" ? plural(n, ["алмаз", "алмаза", "алмазов"]) : plural(n, ["монета", "монеты", "монет"]));
  }
  function balance(cur) {
    if (typeof state === "undefined") return 0;
    return Math.floor(Number(cur === "diamonds" ? (state.diamonds && state.diamonds.total) : state.total) || 0);
  }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function when(ts) {
    try { return new Date(ts).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }); }
    catch (e) { return ""; }
  }
  function letter(name) { return (Array.from(String(name || "?"))[0] || "?").toUpperCase(); }

  var toastTimer = null;
  function toast(msg, kind) {
    var t = byId("bkToast");
    if (!t) return;
    t.textContent = msg;
    t.className = "bk-toast show " + (kind || "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.className = "bk-toast " + (kind || ""); }, 2800);
  }

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) {}
    try {
      var i = document.createElement("input");
      i.value = text; i.style.cssText = "position:fixed;opacity:0;left:-999px";
      document.body.appendChild(i); i.select();
      var ok = document.execCommand("copy");
      i.remove();
      return ok;
    } catch (e) { return false; }
  }

  // человеческие тексты для ошибок сервера
  function errText(code, data) {
    var map = {
      not_enough: "Недостаточно средств" + (data && data.available != null ? ": у тебя " + intFmt(data.available) : ""),
      bad_amount: "Введи целое число больше нуля",
      bad_currency: "Выбери монеты или алмазы",
      self: "Нельзя отправить самому себе",
      no_recipient: "Игрок с таким ID не найден — он должен хотя бы раз зайти в игру",
      recipient_banned: "Этот игрок заблокирован",
      target_no_bank: "У этого игрока нет доступа к банку — запросить у него деньги нельзя",
      too_fast: "Подожди пару секунд и попробуй снова",
      too_many: "У тебя слишком много запросов без ответа",
      too_many_pair: "Ты уже отправил этому игроку несколько запросов — дождись ответа",
      transfer_failed: "Не получилось — деньги не списаны, попробуй ещё раз",
      no_request: "Запрос не найден — возможно, он уже удалён",
      already_done: "На этот запрос уже ответили",
      no_bank: "У тебя нет доступа к банку",
      bad_tx: "Что-то пошло не так, попробуй ещё раз",
      unauthorized: "Сессия устарела — закрой банк и открой заново"
    };
    return map[code] || "Не получилось, попробуй позже";
  }

  function needTelegram() {
    if (L) return false;
    toast("Переводы работают только внутри Telegram", "err");
    return true;
  }

  /* ---------------------------------------------------------------------
     1. Переносим реальные игровые узлы в банковский интерфейс
        (двигаем существующие элементы — обработчики script.js продолжают работать)
     --------------------------------------------------------------------- */
  function relocateGameNodes() {
    var tapCard = document.querySelector("#mining .tap-card");
    var tapSlot = byId("bkTapSlot");
    if (tapCard && tapSlot) tapSlot.appendChild(tapCard);

    var little = byId("little");
    if (little) {
      little.style.display = "block";
      var gamesSlot = byId("bkGamesSlot");
      if (gamesSlot) gamesSlot.appendChild(little);
    }

    var subtabs = document.querySelector("#achievements .subtabs");
    var upgSlot = byId("bkUpgradesSlot");
    if (upgSlot) {
      if (subtabs) upgSlot.appendChild(subtabs);
      ["upgradesWrap", "diamondsWrap", "skinsSubWrap"].forEach(function (id) {
        var e = byId(id);
        if (e) upgSlot.appendChild(e);
      });
    }
  }

  /* ---------------------------------------------------------------------
     2. Вкладки банка
     --------------------------------------------------------------------- */
  function initTabs() {
    var pages = document.querySelectorAll(".bk-page");
    var navItems = document.querySelectorAll(".bk-navitem[data-tab]");

    function goTab(tab) {
      pages.forEach(function (p) { p.classList.toggle("active", p.getAttribute("data-page") === tab); });
      navItems.forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-tab") === tab); });
      window.scrollTo(0, 0);
    }
    navItems.forEach(function (btn) {
      btn.addEventListener("click", function () { goTab(btn.getAttribute("data-tab")); });
    });
    document.querySelectorAll(".bk-shortcut[data-tab]").forEach(function (btn) {
      btn.addEventListener("click", function () { goTab(btn.getAttribute("data-tab")); });
    });
    window.__bkGoTab = goTab;
  }

  /* ---------------------------------------------------------------------
     3. Сервисы: мини-игры / улучшения / магазин
     --------------------------------------------------------------------- */
  function initServicesNav() {
    var pills = document.querySelectorAll("#bkServicesNav .bk-pill");
    var gamesSlot = byId("bkGamesSlot");
    var upgSlot = byId("bkUpgradesSlot");
    pills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        pills.forEach(function (p) { p.classList.remove("active"); });
        pill.classList.add("active");
        var svc = pill.getAttribute("data-svc");
        if (svc === "games") {
          gamesSlot.style.display = "block";
          upgSlot.style.display = "none";
        } else {
          gamesSlot.style.display = "none";
          upgSlot.style.display = "block";
          var subBtn = byId(svc === "shop" ? "sub-skins" : "sub-upgrades");
          if (subBtn) subBtn.click();
        }
      });
    });
  }

  /* ---------------------------------------------------------------------
     4. Свайп карточки баланса: монеты <-> алмазы (в любую сторону переключает на другой баланс)
     --------------------------------------------------------------------- */
  function initBalanceSwipe() {
    var card = byId("bkBalanceCard");
    var track = byId("bkBalanceTrack");
    var dots = document.querySelectorAll(".bk-dot");
    var face = 0;
    var startX = 0, dx = 0, dragging = false;

    function render() {
      track.style.transform = "translateX(" + (-face * 50) + "%)";
      dots.forEach(function (d, i) { d.classList.toggle("active", i === face); });
    }
    function setFace(i) { face = i ? 1 : 0; render(); }

    dots.forEach(function (d) {
      d.addEventListener("click", function () { setFace(Number(d.getAttribute("data-face"))); });
    });

    function pointerDown(x) { dragging = true; startX = x; dx = 0; track.style.transition = "none"; }
    function pointerMove(x) {
      if (!dragging) return;
      dx = x - startX;
      var w = card.offsetWidth || 1;
      var natural = face === 0 ? dx < 0 : dx > 0;          // в эту сторону сдвигается карточка за пальцем
      var eff = natural ? dx : dx * 0.2;
      var pct = -face * 50 + (eff / w) * 50;               // ширина дорожки = 2 карточки, поэтому 50% на карточку
      track.style.transform = "translateX(" + Math.max(-50, Math.min(0, pct)) + "%)";
    }
    function pointerUp() {
      if (!dragging) return;
      dragging = false;
      track.style.transition = "";
      if (Math.abs(dx) > 50) setFace(face ? 0 : 1);
      else render();
    }

    card.addEventListener("touchstart", function (e) { pointerDown(e.touches[0].clientX); }, { passive: true });
    card.addEventListener("touchmove", function (e) { pointerMove(e.touches[0].clientX); }, { passive: true });
    card.addEventListener("touchend", pointerUp);
    card.addEventListener("touchcancel", pointerUp);
    card.addEventListener("mousedown", function (e) { pointerDown(e.clientX); });
    window.addEventListener("mousemove", function (e) { pointerMove(e.clientX); });
    window.addEventListener("mouseup", pointerUp);

    render();
  }

  /* ---------------------------------------------------------------------
     5. Шторки
     --------------------------------------------------------------------- */
  function openSheet(id) { var o = byId(id); if (o) o.classList.add("open"); }
  function closeSheet(id) { var o = byId(id); if (o) o.classList.remove("open"); }
  function isOpen(id) { var o = byId(id); return !!(o && o.classList.contains("open")); }
  function closeAnySheet() {
    var closed = false;
    document.querySelectorAll(".bk-sheet-overlay.open").forEach(function (o) { o.classList.remove("open"); closed = true; });
    return closed;
  }
  function wireSheet(overlayId, openBtnIds, closeBtnId, onOpen) {
    var overlay = byId(overlayId);
    if (!overlay) return;
    openBtnIds.forEach(function (id) {
      var btn = byId(id);
      if (btn) btn.addEventListener("click", function () { if (onOpen) onOpen(); overlay.classList.add("open"); });
    });
    var closeBtn = byId(closeBtnId);
    if (closeBtn) closeBtn.addEventListener("click", function () { overlay.classList.remove("open"); });
    overlay.addEventListener("click", function (e) { if (e.target === overlay) overlay.classList.remove("open"); });
  }

  /* ---------------------------------------------------------------------
     6. Кнопки, которые «нажимают» настоящие кнопки игры
     --------------------------------------------------------------------- */
  function proxyClick(myId, realId) {
    var mine = byId(myId), real = byId(realId);
    if (mine && real) mine.addEventListener("click", function () { real.click(); });
  }
  function initProxies() {
    proxyClick("bkOpenHistory", "openHistoryBtn");
    proxyClick("bkOpenHistory2", "openHistoryBtn");
    proxyClick("bkOpenMarket", "openMarketBtn");
    proxyClick("bkOpenSupport", "openSupportBtn");
    proxyClick("bkOpenNews", "openNewsBtn");

    var farmBtn = byId("bkOpenDiamondFarm");
    if (farmBtn) {
      farmBtn.addEventListener("click", function () {
        if (window.__bkGoTab) window.__bkGoTab("services");
        var pill = document.querySelector('#bkServicesNav .bk-pill[data-svc="upgrades"]');
        if (pill) pill.click();
        var subDiamonds = byId("sub-diamonds");
        if (subDiamonds) subDiamonds.click();
      });
    }
  }

  /* ---------------------------------------------------------------------
     7. Режим доступа: стрелка «назад в игру» только у тех, кому банк выдан кнопкой в игре
     --------------------------------------------------------------------- */
  function goBack() {
    if (closeAnySheet()) return;
    if (L) L.navigate("index.html"); else location.href = "index.html";
  }
  function readMode() {
    var m = L && L.mode;
    if (!m && MY_ID) { try { m = localStorage.getItem("lowkie_bank_mode_" + MY_ID); } catch (e) {} }
    return m || null;
  }
  function applyMode(mode) {
    var show = mode === "button";
    var b = byId("bkBack");
    if (b) b.style.display = show ? "flex" : "none";
    if (tg && tg.BackButton) { try { if (show) tg.BackButton.show(); else tg.BackButton.hide(); } catch (e) {} }
  }
  function initMode() {
    var b = byId("bkBack");
    if (b) b.addEventListener("click", goBack);
    if (tg && tg.BackButton) { try { tg.BackButton.onClick(goBack); } catch (e) {} }
    window.addEventListener("lowkie-bank-mode", function (e) { applyMode(e.detail); });
    applyMode(readMode());
  }

  /* ---------------------------------------------------------------------
     9. Перевод и запрос денег (одна форма): получатель выбирается из списка игроков по нику
     --------------------------------------------------------------------- */
  var M = { mode: "transfer", cur: "coins", id: "", rcpt: null, tx: null, busy: false, step: "form" };
  var PL = { list: null, at: 0, loading: false, failed: false };

  function setStep(step) {
    M.step = step;
    byId("bkMoneyForm").hidden = step !== "form";
    byId("bkMoneyConfirm").hidden = step !== "confirm";
    byId("bkMoneyDone").hidden = step !== "done";
  }
  function setErr(text, confirmStep) { byId(confirmStep ? "bkConfirmErr" : "bkMoneyErr").textContent = text || ""; }

  function readAmount() {
    var v = String(byId("bkAmount").value || "").replace(/\D/g, "");
    return v ? Number(v) : 0;
  }
  function readComment() { return String(byId("bkComment").value || "").replace(/\s+/g, " ").trim(); }

  function updateAmountInfo() {
    var cur = M.cur, amt = readAmount();
    byId("bkAvail").textContent = M.mode === "transfer" ? "доступно: " + intFmt(balance(cur)) : "";
    byId("bkMax").hidden = M.mode !== "transfer";
    byId("bkPreview").textContent = amt > 0 ? "= " + money(amt, cur) : "";
  }

  function mkAva(name, photo) {
    var ava = el("div", "bk-ava", letter(name));
    if (photo) {
      var img = new Image();
      img.referrerPolicy = "no-referrer"; img.alt = "";
      img.onload = function () { ava.textContent = ""; ava.appendChild(img); };
      img.src = photo;
    }
    return ava;
  }

  async function loadPlayers() {
    if (!L) return;
    if (!PL.list) { PL.loading = true; renderPickList(); }
    try {
      var r = await L.api({ action: "bank_players" });
      if (r.ok && r.data) { PL.list = r.data.players || []; PL.at = Date.now(); PL.failed = false; }
      else PL.failed = true;
    } catch (e) { PL.failed = true; }
    PL.loading = false;
    renderPickList();
  }

  function renderPickList() {
    var box = byId("bkPickList");
    if (!box) return;
    box.innerHTML = "";
    if (!PL.list) { box.appendChild(el("div", "bk-empty", PL.failed ? "Не удалось загрузить игроков, закрой окно и открой снова" : "Загружаем игроков…")); return; }
    var q = byId("bkPickSearch").value.trim().toLowerCase();
    var list = PL.list.filter(function (p) {
      return (M.mode !== "request" || p.hasBank) && (!q || p.name.toLowerCase().indexOf(q) >= 0);
    });
    if (!list.length) {
      box.appendChild(el("div", "bk-empty", q ? "Никого не нашли" : (M.mode === "request" ? "Пока нет других игроков с доступом к банку" : "Других игроков пока нет")));
      return;
    }
    list.forEach(function (p) {
      var row = el("button", "bk-prow");
      row.type = "button";
      row.appendChild(mkAva(p.name, p.photo));
      row.appendChild(el("div", "bk-prow-name", p.name));
      row.addEventListener("click", function () { pickPlayer(p); });
      box.appendChild(row);
    });
  }

  function pickPlayer(p) {
    M.id = p.id;
    M.rcpt = { id: p.id, name: p.name, photo: p.photo, hasBank: !!p.hasBank };
    setErr("");
    paintRecipient();
  }

  function paintRecipient() {
    var box = byId("bkRecipient"), pick = byId("bkPick"), r = M.rcpt;
    pick.hidden = !!r;
    box.hidden = !r;
    box.innerHTML = "";
    if (!r) return;
    box.appendChild(mkAva(r.name, r.photo));
    var text = el("div", "bk-rc-text");
    text.appendChild(el("div", "bk-rc-name", r.name));
    text.appendChild(el("div", "bk-rc-sub", M.mode === "transfer" ? "Получатель перевода" : "У него запросим деньги"));
    box.appendChild(text);
    var change = el("button", "bk-copy", "сменить");
    change.type = "button";
    change.addEventListener("click", function () {
      M.id = ""; M.rcpt = null; setErr(""); paintRecipient();
      byId("bkPickSearch").value = ""; renderPickList();
    });
    box.appendChild(change);
  }

  function describeMode() {
    var transfer = M.mode === "transfer";
    byId("bkMoneyDesc").textContent = transfer
      ? "Перевод придёт сразу, даже если у игрока нет доступа к банку"
      : "Запрос увидят только игроки с доступом к банку. Платить или нет, решает он сам";
  }

  function resetMoney(mode) {
    M.mode = mode; M.cur = "coins"; M.id = ""; M.rcpt = null; M.tx = null; M.busy = false;
    var transfer = mode === "transfer";
    byId("bkMoneyTitle").textContent = transfer ? "Перевести" : "Запросить деньги";
    describeMode();
    byId("bkToLabel").textContent = transfer ? "Кому перевести" : "У кого запросить";
    byId("bkMoneySubmit").textContent = transfer ? "Далее" : "Отправить запрос";
    byId("bkMoneySubmit").disabled = false;
    byId("bkConfirmYes").disabled = false;
    byId("bkPickSearch").value = ""; byId("bkAmount").value = ""; byId("bkComment").value = "";
    document.querySelectorAll("#bkCurSeg button").forEach(function (b) { b.classList.toggle("active", b.dataset.cur === "coins"); });
    paintRecipient(); renderPickList(); setErr(""); setErr("", true);
    updateAmountInfo();
    setStep("form");
    loadPlayers();
  }

  // проверка формы; возвращает текст ошибки или null
  function validateMoney() {
    if (!L) return "Переводы работают только внутри Telegram";
    if (!M.rcpt) return M.mode === "transfer" ? "Выбери, кому перевести, из списка игроков" : "Выбери игрока, у которого просишь деньги";
    var amt = readAmount();
    if (!(amt >= 1)) return "Введи сумму: целое число больше нуля";
    if (amt > 1e15) return "Слишком большая сумма";
    if (M.mode === "transfer" && amt > balance(M.cur)) return "Недостаточно средств: у тебя " + money(balance(M.cur), M.cur);
    if (M.mode === "request" && !M.rcpt.hasBank) return "У этого игрока нет доступа к банку, запросить у него деньги нельзя";
    return null;
  }

  async function onMoneySubmit() {
    if (M.busy) return;
    M.busy = true; setErr("");
    var btn = byId("bkMoneySubmit"); btn.disabled = true;
    try {
      var err = validateMoney();
      if (err) { setErr(err); return; }
      if (M.mode === "transfer") showConfirm(); else await doRequest();
    } finally { M.busy = false; btn.disabled = false; }
  }

  function sumRow(label, value, big, dia) {
    var row = el("div", "bk-sum-row");
    row.appendChild(el("span", "", label));
    row.appendChild(el("span", big ? "bk-sum-big" + (dia ? " dia" : "") : "", value));
    return row;
  }
  function showConfirm() {
    var amt = readAmount(), r = M.rcpt, sum = byId("bkSum"), note = readComment();
    sum.innerHTML = "";
    sum.appendChild(sumRow("Получатель", r.name));
    sum.appendChild(sumRow("Сумма", money(amt, M.cur), true, M.cur === "diamonds"));
    if (note) sum.appendChild(sumRow("Комментарий", note));
    sum.appendChild(sumRow("Останется у тебя", money(Math.max(0, balance(M.cur) - amt), M.cur)));
    setErr("", true);
    byId("bkMoneyDesc").textContent = "Проверь данные: перевод нельзя отменить";
    setStep("confirm");
  }

  function newTxId() { return "tx_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10); }

  async function doTransfer() {
    if (M.busy) return;
    M.busy = true; setErr("", true);
    var yes = byId("bkConfirmYes"), back = byId("bkConfirmBack");
    yes.disabled = true; back.disabled = true;
    var amt = readAmount(), r = M.rcpt, note = readComment();
    var key = [M.id, M.cur, amt, note].join("|");
    // тот же номер операции при повторной попытке после обрыва связи: деньги не спишутся дважды
    if (!M.tx || M.tx.key !== key) M.tx = { key: key, id: newTxId() };
    var res = null;
    try {
      res = await L.bankCall({ action: "bank_transfer", to: M.id, currency: M.cur, amount: String(amt), comment: note, txid: M.tx.id });
    } catch (e) { res = null; }
    yes.disabled = false; back.disabled = false; M.busy = false;
    if (!res) { setErr("Нет связи с сервером. Нажми «Подтвердить» ещё раз: повторная отправка не спишет деньги дважды", true); return; }
    M.tx = null;                                       // ответ получен, операция закрыта
    if (res.ok) {
      byId("bkMoneyDesc").textContent = "";
      byId("bkDoneTitle").textContent = res.data && res.data.dup ? "Перевод уже отправлен" : "Перевод отправлен";
      byId("bkDoneText").textContent = money(amt, M.cur) + " → " + r.name + (note ? "\n«" + note + "»" : "");
      byId("bkDoneText").style.whiteSpace = "pre-line";
      setStep("done");
      updateAmountInfo();
      return;
    }
    var code = res.data && res.data.error;
    if (code === "no_bank" && L.sync) L.sync();
    setErr(errText(code, res.data), true);
  }

  async function doRequest() {
    var amt = readAmount(), r = M.rcpt;
    var res = null;
    try {
      res = await L.api({ action: "bank_request", to: M.id, currency: M.cur, amount: String(amt), comment: readComment() });
    } catch (e) { res = null; }
    if (!res) { setErr("Нет связи с сервером, попробуй ещё раз"); return; }
    if (res.ok) {
      byId("bkMoneyDesc").textContent = "";
      byId("bkDoneTitle").textContent = "Запрос отправлен";
      byId("bkDoneText").textContent = "Ты попросил " + money(amt, M.cur) + " у " + r.name + ". Когда он ответит, ты увидишь это в уведомлениях";
      byId("bkDoneText").style.whiteSpace = "";
      setStep("done");
      refreshInbox();
      return;
    }
    setErr(errText(res.data && res.data.error, res.data));
  }

  function initMoney() {
    wireSheet("bkMoneyOverlay", [], "bkCloseMoney");
    byId("bkOpenTransfer").addEventListener("click", function () {
      if (needTelegram()) return;
      resetMoney("transfer"); openSheet("bkMoneyOverlay");
    });
    byId("bkOpenRequest").addEventListener("click", function () {
      if (needTelegram()) return;
      resetMoney("request"); openSheet("bkMoneyOverlay");
    });
    byId("bkPickSearch").addEventListener("input", renderPickList);
    byId("bkAmount").addEventListener("input", function () {
      var inp = byId("bkAmount");
      var v = String(inp.value || "").replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 16);
      if (inp.value !== v) inp.value = v;
      setErr(""); updateAmountInfo();
    });
    byId("bkMax").addEventListener("click", function () {
      var b = balance(M.cur);
      if (b < 1) return toast("На балансе пока пусто", "err");
      byId("bkAmount").value = String(b); setErr(""); updateAmountInfo();
    });
    document.querySelectorAll("#bkCurSeg button").forEach(function (b) {
      b.addEventListener("click", function () {
        M.cur = b.dataset.cur;
        document.querySelectorAll("#bkCurSeg button").forEach(function (x) { x.classList.toggle("active", x === b); });
        setErr(""); updateAmountInfo();
      });
    });
    byId("bkMoneySubmit").addEventListener("click", onMoneySubmit);
    byId("bkConfirmYes").addEventListener("click", doTransfer);
    byId("bkConfirmBack").addEventListener("click", function () { describeMode(); setErr("", true); setStep("form"); });
    byId("bkDoneBtn").addEventListener("click", function () { closeSheet("bkMoneyOverlay"); });
  }

  /* ---------------------------------------------------------------------
     10. Уведомления: входящие и отправленные запросы денег
     --------------------------------------------------------------------- */
  var inbox = { incoming: [], outgoing: [], pending: 0, loaded: false };
  var inboxTab = "in";
  var STATUS_TEXT = { pending: "ждёт ответа", paid: "оплачен", declined: "отклонён" };

  function updateBell() {
    var n = inbox.pending || 0;
    var c = byId("bkBellCount");
    if (!c) return;
    c.hidden = !n;
    c.textContent = n > 9 ? "9+" : String(n);
  }

  async function refreshInbox() {
    if (!L || !L.ready) return;
    try {
      var r = await L.api({ action: "bank_inbox" });
      if (r.ok && r.data) {
        inbox = { incoming: r.data.incoming || [], outgoing: r.data.outgoing || [], pending: r.data.pending || 0, loaded: true };
        updateBell();
        if (isOpen("bkBellOverlay")) renderInbox();
      }
    } catch (e) {}
  }

  function rqNode(rq, dir) {
    var other = dir === "in" ? { id: rq.from, name: rq.fromName } : { id: rq.to, name: rq.toName };
    var box = el("div", "bk-rq " + rq.status + " " + dir);

    var top = el("div", "bk-rq-top");
    top.appendChild(el("div", "bk-ava", letter(other.name)));
    var who = el("div", "bk-rq-who");
    who.appendChild(el("div", "bk-rq-name", (dir === "in" ? "" : "Кому: ") + other.name));
    who.appendChild(el("div", "bk-rq-sub", when(rq.ts)));
    top.appendChild(who);
    var amt = el("div", "bk-rq-amt " + rq.currency, intFmt(rq.amount));
    amt.appendChild(el("small", "", rq.currency === "diamonds" ? plural(rq.amount, ["алмаз", "алмаза", "алмазов"]) : plural(rq.amount, ["монета", "монеты", "монет"])));
    top.appendChild(amt);
    box.appendChild(top);

    if (rq.comment) box.appendChild(el("div", "bk-rq-note", "«" + rq.comment + "»"));

    if (dir === "in" && rq.status === "pending") {
      var acts = el("div", "bk-rq-actions");
      var pay = el("button", "bk-btn green small", "Оплатить");
      var no = el("button", "bk-btn red small", "Отклонить");
      pay.type = "button"; no.type = "button";
      var armed = false, armTimer = null;
      pay.addEventListener("click", function () {
        if (!armed) {
          armed = true; pay.textContent = "Точно оплатить?";
          armTimer = setTimeout(function () { armed = false; pay.textContent = "Оплатить"; }, 4000);
          return;
        }
        clearTimeout(armTimer);
        payRequest(rq, pay, no);
      });
      no.addEventListener("click", function () { declineRequest(rq, pay, no); });
      acts.appendChild(pay); acts.appendChild(no);
      box.appendChild(acts);
    } else {
      var foot = el("div", "bk-rq-foot");
      foot.appendChild(el("span", "bk-chip " + rq.status, STATUS_TEXT[rq.status] || rq.status));
      if (rq.doneAt) foot.appendChild(el("span", "bk-rq-sub", when(rq.doneAt)));
      box.appendChild(foot);
    }
    return box;
  }

  function renderInbox() {
    var box = byId("bkInboxList");
    if (!box) return;
    box.innerHTML = "";
    var list = inboxTab === "in" ? inbox.incoming : inbox.outgoing;
    if (!inbox.loaded) { box.appendChild(el("div", "bk-empty", L ? "Загрузка…" : "Уведомления работают только внутри Telegram")); return; }
    if (!list.length) {
      box.appendChild(el("div", "bk-empty", inboxTab === "in"
        ? "Пока никто не просил у тебя деньги"
        : "Ты ещё никого не просил. Запрос можно отправить с главной страницы банка"));
      return;
    }
    list.forEach(function (rq) { box.appendChild(rqNode(rq, inboxTab)); });
  }

  async function payRequest(rq, payBtn, noBtn) {
    payBtn.disabled = true; noBtn.disabled = true; payBtn.textContent = "Отправляем…";
    var res = null;
    try { res = await L.bankCall({ action: "bank_respond", id: rq.id, accept: true }); } catch (e) { res = null; }
    if (res && res.ok) {
      toast("Оплачено: " + money(rq.amount, rq.currency) + " → " + rq.fromName, "ok");
    } else if (!res) {
      toast("Нет связи с сервером, попробуй ещё раз", "err");
    } else {
      toast(errText(res.data && res.data.error, res.data), "err");
    }
    await refreshInbox();
    renderInbox();
  }

  async function declineRequest(rq, payBtn, noBtn) {
    payBtn.disabled = true; noBtn.disabled = true;
    var res = null;
    try { res = await L.api({ action: "bank_respond", id: rq.id, accept: false }); } catch (e) { res = null; }
    if (res && res.ok) toast("Запрос отклонён", "ok");
    else toast(res ? errText(res.data && res.data.error, res.data) : "Нет связи с сервером", "err");
    await refreshInbox();
    renderInbox();
  }

  function initInbox() {
    wireSheet("bkBellOverlay", ["bkBell"], "bkCloseBell", function () {
      renderInbox();
      refreshInbox();
    });
    document.querySelectorAll("#bkInboxTabs button").forEach(function (b) {
      b.addEventListener("click", function () {
        inboxTab = b.dataset.tab;
        document.querySelectorAll("#bkInboxTabs button").forEach(function (x) { x.classList.toggle("active", x === b); });
        renderInbox();
      });
    });
    // ждём, пока игра подключится к серверу, и дальше проверяем новые запросы каждые 15 секунд
    var wait = setInterval(function () {
      if (L && L.ready) { clearInterval(wait); refreshInbox(); }
    }, 400);
    setInterval(function () { if (document.visibilityState === "visible") refreshInbox(); }, 15000);
    document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") refreshInbox(); });
  }

  /* ---------------------------------------------------------------------
     11. Опрос состояния игры и обновление интерфейса (только чтение)
     --------------------------------------------------------------------- */
  function safeText(id, value) { var e = byId(id); if (e) e.textContent = value; }

  function tick() {
    if (typeof state === "undefined") return;

    var nick = state.nickname || "telegram_nik";
    safeText("bkNick", nick);
    safeText("bkProfileNick", nick);

    var coins = Number(state.total) || 0;
    var diamonds = Number((state.diamonds && state.diamonds.total) || 0);
    var perClick = typeof getPerClick === "function" ? getPerClick() : 0;
    var maxEnergy = typeof getMaxEnergy === "function" ? getMaxEnergy() : 100;
    var energyNow = Math.floor(state.energyCurrent || 0);
    var dph = typeof getDiamondsPerHour === "function" ? getDiamondsPerHour() : 0;
    var cph = typeof getPassiveNetPerHour === "function" ? getPassiveNetPerHour() : (typeof getPassivePerHour === "function" ? getPassivePerHour() : 0);

    safeText("bkCoinsAmount", fmt(coins));
    safeText("bkCoinsSub", "за клик: " + fmt(perClick) + " · энергия: " + energyNow + "/" + fmt(maxEnergy));
    safeText("bkDiamondsAmount", fmt(diamonds));
    safeText("bkDiamondsSub", "доход " + fmt(dph) + " алм/час");

    var lastOp = "нет операций";
    if (state.history && state.history.length > 0) {
      var last = state.history[0];
      lastOp = last.title + " (" + last.amount + ")";
    }
    safeText("bkLastOp", lastOp);

    if (typeof getCurrentMarketPrice === "function") {
      var price = getCurrentMarketPrice();
      var priceEl = byId("bkInvestPrice");
      if (priceEl) {
        priceEl.textContent = price.toFixed(2) + " LOWKCOIN";
        priceEl.style.color = price >= 1763 ? "var(--bk-green)" : "var(--bk-red)";
      }
    }
    safeText("bkInvestCoins", fmt(coins));
    safeText("bkInvestDiamonds", fmt(diamonds));
    safeText("bkDiamondRate", fmt(dph) + "/час");

    if (typeof getLevelInfo === "function") {
      var info = getLevelInfo(coins);
      safeText("bkProfileRank", info.title);
      safeText("bkProfileLevel", "уровень " + info.level + "/" + info.maxLevel);
      var fill = byId("bkProfileProgressFill");
      if (fill) fill.style.width = info.progress + "%";
    }
    safeText("bkStatCoins", fmt(coins));
    safeText("bkStatDiamonds", fmt(diamonds));
    safeText("bkStatPerClick", fmt(perClick));
    safeText("bkStatEnergy", energyNow + "/" + fmt(maxEnergy));
    safeText("bkStatPassive", fmt(cph) + "/час");
    safeText("bkStatDiamondRate", fmt(dph) + "/час");

    if (isOpen("bkMoneyOverlay") && M.step === "form") updateAmountInfo();
  }

  /* ---------------------------------------------------------------------
     init
     --------------------------------------------------------------------- */
  function init() {
    relocateGameNodes();
    initTabs();
    initServicesNav();
    initBalanceSwipe();
    wireSheet("bkTopupOverlay", ["bkOpenTopup"], "bkCloseTopup");
    initProxies();
    initMode();
    initMoney();
    initInbox();
    tick();
    setInterval(tick, 400);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
