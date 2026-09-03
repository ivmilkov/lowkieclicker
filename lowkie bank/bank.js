/* =========================================================================
   Lowkie Bank — интерфейс поверх игры.
   Это ТОЛЬКО оболочка: здесь нет своей экономики, своих балансов и своих
   данных. Всё, что показывается ниже, читается напрямую из переменных и
   функций script.js (state, getPerClick, getMaxEnergy, getLevelInfo,
   getDiamondsPerHour, getCurrentMarketPrice, formatNum, state.history...),
   а все действия дергают реальные кнопки/обработчики игры.
   ========================================================================= */
(function () {
  "use strict";

  function byId(id) { return document.getElementById(id); }

  /* ---------------------------------------------------------------------
     1. Переносим реальные игровые узлы в банковский интерфейс.
        Мы двигаем существующие DOM-элементы (не клонируем), поэтому все
        обработчики событий и все getElementById-ссылки в script.js
        продолжают работать как ни в чём не бывало.
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
        var el = byId(id);
        if (el) upgSlot.appendChild(el);
      });
    }
  }

  /* ---------------------------------------------------------------------
     2. Переключение вкладок банка (Главная / Сервисы / Инвестиции / Профиль)
     --------------------------------------------------------------------- */
  function initTabs() {
    var pages = document.querySelectorAll(".bk-page");
    var navItems = document.querySelectorAll(".bk-navitem[data-tab]");

    function goTab(tab) {
      pages.forEach(function (p) {
        p.classList.toggle("active", p.getAttribute("data-page") === tab);
      });
      navItems.forEach(function (b) {
        b.classList.toggle("active", b.getAttribute("data-tab") === tab);
      });
    }

    navItems.forEach(function (btn) {
      btn.addEventListener("click", function () {
        goTab(btn.getAttribute("data-tab"));
      });
    });

    document.querySelectorAll(".bk-shortcut[data-tab]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        goTab(btn.getAttribute("data-tab"));
      });
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
     4. Свайп карточки баланса (монеты <-> алмазы)
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

    function setFace(i) { face = Math.max(0, Math.min(1, i)); render(); }

    dots.forEach(function (d) {
      d.addEventListener("click", function () {
        setFace(Number(d.getAttribute("data-face")));
      });
    });

    function pointerDown(x) { dragging = true; startX = x; dx = 0; track.style.transition = "none"; }
    function pointerMove(x) {
      if (!dragging) return;
      dx = x - startX;
      var base = -face * 50;
      var pct = base + (dx / card.offsetWidth) * 100;
      track.style.transform = "translateX(" + pct + "%)";
    }
    function pointerUp() {
      if (!dragging) return;
      dragging = false;
      track.style.transition = "";
      if (dx < -60) setFace(face + 1);
      else if (dx > 60) setFace(face - 1);
      else render();
    }

    card.addEventListener("touchstart", function (e) { pointerDown(e.touches[0].clientX); }, { passive: true });
    card.addEventListener("touchmove", function (e) { pointerMove(e.touches[0].clientX); }, { passive: true });
    card.addEventListener("touchend", pointerUp);

    card.addEventListener("mousedown", function (e) { pointerDown(e.clientX); });
    window.addEventListener("mousemove", function (e) { pointerMove(e.clientX); });
    window.addEventListener("mouseup", pointerUp);

    render();
  }

  /* ---------------------------------------------------------------------
     5. Bottom sheets (пополнить / перевести)
     --------------------------------------------------------------------- */
  function wireSheet(overlayId, openBtnIds, closeBtnId) {
    var overlay = byId(overlayId);
    if (!overlay) return;
    openBtnIds.forEach(function (id) {
      var btn = byId(id);
      if (btn) btn.addEventListener("click", function () { overlay.classList.add("open"); });
    });
    var closeBtn = byId(closeBtnId);
    if (closeBtn) closeBtn.addEventListener("click", function () { overlay.classList.remove("open"); });
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) overlay.classList.remove("open");
    });
  }

  /* ---------------------------------------------------------------------
     6. Кнопки, которые просто «нажимают» на настоящие кнопки игры —
        никакой новой логики, только проксирование клика.
     --------------------------------------------------------------------- */
  function proxyClick(myId, realId) {
    var mine = byId(myId);
    var real = byId(realId);
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
     7. Опрос состояния игры и обновление банковского интерфейса.
        Только чтение — новых значений и балансов здесь не появляется.
     --------------------------------------------------------------------- */
  function safeText(id, value) {
    var el = byId(id);
    if (el) el.textContent = value;
  }

  function tick() {
    if (typeof state === "undefined") return;

    var nick = state.nickname || "telegram_nik";
    safeText("bkNick", nick);
    safeText("bkProfileNick", nick);

    var coins = Number(state.total) || 0;
    var diamonds = Number((state.diamonds && state.diamonds.total) || 0);
    var perClick = (typeof getPerClick === "function") ? getPerClick() : 0;
    var maxEnergy = (typeof getMaxEnergy === "function") ? getMaxEnergy() : 100;
    var energyNow = Math.floor(state.energyCurrent || 0);
    var dph = (typeof getDiamondsPerHour === "function") ? getDiamondsPerHour() : 0;
    var cph = (typeof getPassivePerHour === "function") ? getPassivePerHour() : 0;
    var fmt = (typeof formatNum === "function") ? formatNum : function (n) { return String(n); };

    safeText("bkCoinsAmount", fmt(coins));
    safeText("bkCoinsSub", "за клик: " + fmt(perClick) + " · энергия: " + energyNow + "/" + fmt(maxEnergy));
    safeText("bkDiamondsAmount", fmt(diamonds));
    safeText("bkDiamondsSub", "доход " + fmt(dph) + " алм/час");

    // последняя операция
    var lastOp = "нет операций";
    if (state.history && state.history.length > 0) {
      var last = state.history[0];
      lastOp = last.title + " (" + last.amount + ")";
    }
    safeText("bkLastOp", lastOp);

    // инвестиции / курс
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

    // профиль
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
    wireSheet("bkTransferOverlay", ["bkOpenTransfer"], "bkCloseTransfer");
    initProxies();
    tick();
    setInterval(tick, 400);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
