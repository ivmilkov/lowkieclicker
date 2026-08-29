// база данных локальная
    const STORAGE_KEY = 'lowkie_clicker_v2';
    const GAME_KEY = 'lowkie_little_last';
    const MINI_GAME_KEY = 'lowkie_mini_game';
    const WHEEL_KEY = 'lowkie_wheel_last';
    const SPIN_KEY = 'lowkie_wheel_spin';
    const thresholds = [{t:100,v:2},{t:1000,v:5},{t:10000,v:10},{t:50000,v:20},{t:100000,v:50},{t:1000000,v:100},{t:10000000,v:120},{t:100000000,v:140}];
    
    // налоги
    const TAX_RATE = 0.10; // 10% налог на пассивный доход

    // скин лоуки дефолтный
    const defaultImgSrc = 'images/lowkie.png';

    // скины другие
    const SKINS = {
      eikwon: {
        id: 'eikwon',
        name: 'eikwon',
        price: 1000000,
        src: 'images/eikwon.jpg?size=1852x1852&quality=95&crop=0,0,1852,1852&ava=1'
      },
      sorie: {
        id: 'sorie',
        name: 'sorie',
        price: 5000000,
        src: 'images/sorie.jpg'
      }
    };

    // пассивныц доход алмазов
    const DIAMOND_ICON_URL = 'images/diamond.png';
    const DIAMOND_UPGRADES = [
      { id:'dph5',  add:5, displayAdd:5, cost:10000 },
      { id:'dph10', add:5, displayAdd:10, cost:50000 },
      { id:'dph15', add:5, displayAdd:15, cost:100000 },
      { id:'dph20', add:5, displayAdd:20, cost:500000 },
      { id:'dph25', add:5, displayAdd:25, cost:1000000 },
      { id:'dph30', add:5, displayAdd:30, cost:5000000 },
      { id:'dph35', add:5, displayAdd:35, cost:10000000 },
      { id:'dph40', add:5, displayAdd:40, cost:50000000 },
      { id:'dph50', add:5, displayAdd:50, cost:100000000 },
      { id:'dph55', add:5, displayAdd:55, cost:150000000 },
      { id:'dph60', add:5, displayAdd:60, cost:200000000 },
      { id:'dph65', add:5, displayAdd:65, cost:250000000 },
      { id:'dph70', add:5, displayAdd:70, cost:500000000 },
      { id:'dph100', add:5, displayAdd:100, cost:1000000000 },
      { id:'dph200', add:5, displayAdd:200, cost:2000000000 },
      { id:'dph500', add:5, displayAdd:500, cost:5000000000 },
      { id:'dph1000', add:5, displayAdd:1000, cost:10000000000 },
      { id:'dph2000', add:5, displayAdd:2000, cost:20000000000 },
      { id:'dph5000', add:5, displayAdd:5000, cost:50000000000 },
      { id:'dph10000', add:5, displayAdd:10000, cost:100000000000 }
    ];

    // пассивный доход монет
    const PASSIVE_MAX_LEVEL = 15;
    const PASSIVE_RATES = [0, 10, 30, 50, 150, 500, 1000, 1500, 5000, 10000, 50000, 100000, 600000, 800000, 968000, 5000000];
    const PASSIVE_COSTS = [0, 100, 1000, 5000, 10000, 15000, 50000, 100000, 150000, 500000, 1000000, 10000000, 50000000, 100000000, 500000000, 1000000000];

    // энергия (в формате кол-во монет:кол-во энергии)
    const energyThresholds = [
      {t:0, m:100},
      {t:10000, m:1000},
      {t:50000, m:1500},
      {t:100000, m:3000},
      {t:150000, m:3500},
      {t:500000, m:5000},
      {t:1000000, m:5500},
      {t:2000000, m:6000},
      {t:3000000, m:7000},
      {t:5000000, m:8000},
      {t:10000000, m:8500},
      {t:20000000, m:9000},
      {t:50000000, m:9500},
      {t:100000000, m:10000},
      {t:200000000, m:20000},
      {t:300000000, m:30000},
      {t:400000000, m:40000},
      {t:500000000, m:50000},
      {t:600000000, m:60000},
      {t:700000000, m:70000},
      {t:800000000, m:80000},
      {t:900000000, m:90000},
      {t:1000000000, m:100000}
    ];

    // звания
    const levels = [
      { min: 0, max: 10000, title: 'новичок лоуки' },
      { min: 10000, max: 50000, title: 'мини лоуки' },
      { min: 50000, max: 100000, title: 'профессионал лоуки' },
      { min: 100000, max: 500000, title: 'бюджетный лоуки' },
      { min: 500000, max: 1000000, title: 'деловой лоуки' },
      { min: 1000000, max: 5000000, title: 'амбассадор лоуки' },
      { min: 5000000, max: 10000000, title: 'филантроп лоуки' },
      { min: 10000000, max: 50000000, title: 'бизнесмен лоуки' },
      { min: 50000000, max: 100000000, title: 'миллионер лоуки' },
      { min: 100000000, max: 500000000, title: 'мультимиллионер лоуки' },
      { min: 500000000, max: 1000000000, title: 'легендарный лоуки' },
      { min: 1000000000, max: Infinity, title: 'CEO' }
    ];

    // прокачка прибыли за клик
    const MULTICLICK_TIERS = [
      { cost: 10000, add: 1, max: 5 },
      { cost: 100000, add: 2, max: 5 },
      { cost: 500000, add: 3, max: 5 },
      { cost: 1000000, add: 4, max: 5 },
      { cost: 2000000, add: 5, max: 5 },
      { cost: 500000, add: 6, max: 5 },
      { cost: 10000000, add: 7, max: 5 },
      { cost: 100000000, add: 8, max: 5 }
    ];

    // прокачка максимума энергии
    const MULTIENERGY_TIERS = [
      { cost: 1000, add: 1, max: 5 },
      { cost: 5000, add: 2, max: 5 },
      { cost: 10000, add: 5, max: 5 },
      { cost: 50000, add: 10, max: 5 },
      { cost: 100000, add: 20, max: 5 },
      { cost: 500000, add: 50, max: 5 },
      { cost: 1000000, add: 100, max: 5 },
      { cost: 5000000, add: 200, max: 5 },
      { cost: 10000000, add: 500, max: 5 },
      { cost: 50000000, add: 1000, max: 5 },
      { cost: 100000000, add: 2000, max: 5 },
      { cost: 500000000, add: 5000, max: 5 },
      { cost: 1000000000, add: 10000, max: 5 }
    ];

    // база данных локальная
    let state = {
      total:0,
      bonus:0,
      upgrades:{ plus20:false, miniBoost:false },
      skins:{ owned:{}, equipped: null },
      diamonds:{ total:0, lastTs: null, upgrades:{} }, // upgrades: map id->true
      passive:{ level:0, lastTs: null },
      energyCurrent:100,
      lastEnergyRegen: Date.now(),
      lastTapTs: 0,
      multiclick: { totalBonus: 0, currentTier: 0, purchasesInTier: 0 },
      multienergy: { totalBonus: 0, currentTier: 0, purchasesInTier: 0 },
      stockExchange: { active: false, startTs: 0, lastClaimTs: 0 },
      history: [], // {id, type, title, amount, date}
      support: { tickets: [] },
      holdToTap: false // новое поле в БД для автофарма
    };

    // элементы
    const totalTop = document.getElementById('totalTop');
    const perClickEl = document.getElementById('perClick');
    const tapArea = document.getElementById('tapArea');
    const diamondsTopEl = document.getElementById('diamondsTop');
    const energyDisplayEl = document.getElementById('energyDisplay');
    const rankTitleEl = document.getElementById('rankTitle');
    const levelNumEl = document.getElementById('levelNum');
    const progressFillEl = document.getElementById('progressFill');

    // история операций
    function addHistory(type, title, amountDisplay) {
      if(!state.history) state.history = [];
      const entry = {
        id: Date.now() + Math.random().toString().slice(2,6),
        type: type, // 'income', 'spend', 'info'
        title: title,
        amount: amountDisplay,
        date: Date.now()
      };
      state.history.unshift(entry);
      // Optional: limit history size to prevent LS overflow
      if(state.history.length > 500) state.history.pop();
      save();
      updateHistoryWidget();
      renderHistoryList();
    }

    function updateHistoryWidget() {
      const el = document.getElementById('lastOperationText');
      if(!el) return;
      if(state.history && state.history.length > 0) {
        const last = state.history[0];
        el.textContent = `${last.title} (${last.amount})`;
      } else {
        el.textContent = 'Нет операций';
      }
    }

    // история операций UI
    const historyModal = document.getElementById('historyModal');
    const openHistoryBtn = document.getElementById('openHistoryBtn');
    const closeHistoryBtn = document.getElementById('closeHistory');
    const historySearch = document.getElementById('historySearch');
    const historyList = document.getElementById('historyList');

    if(openHistoryBtn) {
        openHistoryBtn.addEventListener('click', () => {
          renderHistoryList();
          historyModal.classList.add('open');
        });
    }

    if(closeHistoryBtn) {
        closeHistoryBtn.addEventListener('click', () => {
          historyModal.classList.remove('open');
        });
    }

    if(historySearch) historySearch.addEventListener('input', renderHistoryList);

    function getHistoryIcon(type) {
      if(type === 'income') return '<span style="font-size:18px">↓</span>'; // Green arrow down (in)
      if(type === 'spend') return '<span style="font-size:18px">↑</span>'; // Red arrow up (out)
      return '<span style="font-size:18px">i</span>';
    }

    function formatHistoryDate(ts) {
      const date = new Date(ts);
      const hours = String(date.getHours()).padStart(2, '0');
      const mins = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${mins}`;
    }

    function getDayKey(ts) {
      const d = new Date(ts);
      return `${d.getDate()}.${d.getMonth()+1}.${d.getFullYear()}`;
    }

    function getDayLabel(ts) {
      const d = new Date(ts);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      
      const diffTime = today - date;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if(diffDays === 0) return 'Сегодня';
      if(diffDays === 1) return 'Вчера';
      
      const day = String(d.getDate()).padStart(2,'0');
      const months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
      return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }

    function renderHistoryList() {
      if(!historyList) return;
      historyList.innerHTML = '';
      
      const query = historySearch.value.toLowerCase();
      
      let data = (state.history || []).filter(item => {
         if(!query) return true;
         return item.title.toLowerCase().includes(query) || 
                String(item.amount).toLowerCase().includes(query) ||
                (item.type === 'income' && 'доход'.includes(query)) ||
                (item.type === 'spend' && 'расход'.includes(query));
      });

      // группировка по дням
      const groups = {};
      data.forEach(item => {
        const key = getDayKey(item.date);
        if(!groups[key]) {
          groups[key] = { label: getDayLabel(item.date), items: [] };
        }
        groups[key].items.push(item);
      });

      Object.keys(groups).forEach(key => {
        const group = groups[key];
        
        const groupTitle = document.createElement('div');
        groupTitle.className = 'history-group-title';
        groupTitle.textContent = group.label;
        historyList.appendChild(groupTitle);

        group.items.forEach(item => {
           const row = document.createElement('div');
           row.className = 'history-item';
           
           let amtClass = 'neutral';
           if(item.type === 'income') amtClass = 'positive';
           if(item.type === 'spend') amtClass = 'negative';

           let iconChar = '•';
           if(item.type === 'income') iconChar = '↓';
           if(item.type === 'spend') iconChar = '↑';
           if(item.title.includes('Функция')) iconChar = 'i';

           row.innerHTML = `
             <div class="h-icon ${item.type === 'income' || item.type === 'spend' ? item.type : 'info'}">
               ${iconChar}
             </div>
             <div class="h-details">
               <div class="h-title">${item.title}</div>
               <div class="h-meta">${formatHistoryDate(item.date)}</div>
             </div>
             <div class="h-amount ${amtClass}">${item.amount}</div>
           `;
           historyList.appendChild(row);
        });
      });
    }

    // база данных локальная
    function load(){
      const raw = localStorage.getItem(STORAGE_KEY);
      if(raw){
        try{
          const parsed = JSON.parse(raw);
          state.total = Number(parsed.total)||0;
          state.nickname = parsed.nickname || 'telegram_nik';
          state.bonus = Number(parsed.bonus)||0;
          state.upgrades = parsed.upgrades && typeof parsed.upgrades==='object' ? parsed.upgrades : { plus20:false, miniBoost:false };
          if(typeof state.upgrades.plus20 !== 'boolean') state.upgrades.plus20 = false;
          if(typeof state.upgrades.miniBoost !== 'boolean') state.upgrades.miniBoost = false;
          if(parsed.skins && typeof parsed.skins === 'object'){
            state.skins = parsed.skins;
            if(!state.skins.owned || typeof state.skins.owned !== 'object') state.skins.owned = {};
            if(!('equipped' in state.skins)) state.skins.equipped = null;
          } else {
            state.skins = { owned:{}, equipped: null };
          }
          if(parsed.diamonds && typeof parsed.diamonds === 'object'){
            state.diamonds = parsed.diamonds;
            if(!state.diamonds.upgrades || typeof state.diamonds.upgrades !== 'object') state.diamonds.upgrades = {};
            if(typeof state.diamonds.total !== 'number') state.diamonds.total = Number(state.diamonds.total)||0;
            if(!('lastTs' in state.diamonds) || !state.diamonds.lastTs) state.diamonds.lastTs = Date.now();
          } else {
            state.diamonds = { total:0, lastTs: Date.now(), upgrades:{} };
          }
          if(parsed.passive && typeof parsed.passive === 'object'){
            state.passive = parsed.passive;
            if(typeof state.passive.level !== 'number') state.passive.level = Number(state.passive.level)||0;
            if(!('lastTs' in state.passive) || !state.passive.lastTs) state.passive.lastTs = Date.now();
          } else {
            state.passive = { level:0, lastTs: Date.now() };
          }
          state.energyCurrent = Number(parsed.energyCurrent) || getMaxEnergy();
          state.lastEnergyRegen = Number(parsed.lastEnergyRegen) || Date.now();
          state.lastTapTs = Number(parsed.lastTapTs) || 0;
          if(parsed.multiclick && typeof parsed.multiclick === 'object'){
            state.multiclick = parsed.multiclick;
            state.multiclick.totalBonus = Number(state.multiclick.totalBonus) || 0;
            state.multiclick.currentTier = Number(state.multiclick.currentTier) || 0;
            state.multiclick.purchasesInTier = Number(state.multiclick.purchasesInTier) || 0;
          } else {
            state.multiclick = { totalBonus: 0, currentTier: 0, purchasesInTier: 0 };
          }
          if(parsed.multienergy && typeof parsed.multienergy === 'object'){
            state.multienergy = parsed.multienergy;
            state.multienergy.totalBonus = Number(state.multienergy.totalBonus) || 0;
            state.multienergy.currentTier = Number(state.multienergy.currentTier) || 0;
            state.multienergy.purchasesInTier = Number(state.multienergy.purchasesInTier) || 0;
          } else {
            state.multienergy = { totalBonus: 0, currentTier: 0, purchasesInTier: 0 };
          }
          if(parsed.stockExchange && typeof parsed.stockExchange === 'object'){
            state.stockExchange = parsed.stockExchange;
            state.stockExchange.active = !!state.stockExchange.active;
            state.stockExchange.startTs = Number(state.stockExchange.startTs) || 0;
            state.stockExchange.lastClaimTs = Number(state.stockExchange.lastClaimTs) || 0;
          } else {
            state.stockExchange = { active: false, startTs: 0, lastClaimTs: 0 };
          }
          if(parsed.history && Array.isArray(parsed.history)){
            state.history = parsed.history;
          } else {
            state.history = [];
          }
          if(parsed.support && typeof parsed.support === 'object'){
              state.support = parsed.support;
              if(!state.support.tickets || !Array.isArray(state.support.tickets)) state.support.tickets = [];
          } else {
              state.support = { tickets: [] };
          }
          state.holdToTap = !!parsed.holdToTap; // загружаем состояние автофарма

        }catch(e){  }
      } else {
        state.diamonds.lastTs = Date.now();
        state.passive.lastTs = Date.now();
        state.lastEnergyRegen = Date.now();
        state.history = [];
        state.support = { tickets: [] };
        state.holdToTap = false;
      }
      accrueDiamondsIfDue(true);
      accruePassiveIfDue(true);
      accrueEnergy();
      updateUI();
      updateHistoryWidget();
      checkStockExchange();
      renderSupportTickets(); // Render tickets on load
      initSupportFilePreview(); // Init Support UI logic
    }
    function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

    // базовый пер-клик по порогам (без апгрейдов)
    function getBasePerClick(){
      let v = 1;
      for(const th of thresholds){ if(state.total >= th.t) v = th.v; }
      return v;
    }

    function getPerClick(){
      let extra = Number(state.bonus)||0;
      if(state.upgrades?.plus20) extra += 20;
      extra += state.multiclick.totalBonus || 0;
      return getBasePerClick() + extra;
    }

    // монеты за поимку маленького лоуки
    function getMiniReward(){
      return (state.upgrades && state.upgrades.miniBoost) ? 1000 : 5;
    }

    function getMaxEnergy(){
      let m = 100;
      for(const th of energyThresholds){ if(state.total >= th.t) m = th.m; }
      m += state.multienergy.totalBonus || 0;
      return m;
    }

    function accrueEnergy(forceSave=false){
      const max = getMaxEnergy();
      if(state.energyCurrent >= max) return;
      const now = Date.now();
      if(now - state.lastTapTs < 300) {
        state.lastEnergyRegen = now;
        return;
      }
      if(!state.lastEnergyRegen) state.lastEnergyRegen = now;
      const elapsed = (now - state.lastEnergyRegen) / 1000;
      const regenRate = max / 6;
      const add = elapsed * regenRate;
      state.energyCurrent = Math.min(max, state.energyCurrent + add);
      state.lastEnergyRegen = now;
      if(forceSave){ save(); }
    }

    // пассивный доход алмазов
    function getDiamondsPerHour(){
      let d=0; const upg = state.diamonds?.upgrades || {};
      for(const u of DIAMOND_UPGRADES){ if(upg[u.id]) d += u.add; }
      return d;
    }
    function accrueDiamondsIfDue(skipSave){
      const dph = getDiamondsPerHour();
      if(!state.diamonds) state.diamonds = { total:0, lastTs: Date.now(), upgrades:{} };
      if(!state.diamonds.lastTs) state.diamonds.lastTs = Date.now();
      if(dph <= 0) return;
      const now = Date.now();
      const elapsed = now - state.diamonds.lastTs;
      const hours = Math.floor(elapsed / 3600000);
      if(hours > 0){
        const grossIncome = hours * dph;
        const tax = Math.floor(grossIncome * TAX_RATE);
        const netIncome = grossIncome - tax;

        state.diamonds.total = Number(state.diamonds.total||0) + netIncome;
        state.diamonds.lastTs = state.diamonds.lastTs + hours * 3600000;
        
        // пассивный доход алмазов засчитывается в историю операций
        addHistory('income', 'Ферма Алмазов (Пассив)', `+${formatNum(netIncome)} алм.`), '(налог 10%)';

        if(!skipSave){ save(); updateUI(); }
      }
    }
    function diamondSecsToNext(){
      const dph = getDiamondsPerHour();
      if(dph <= 0) return 0;
      const last = state.diamonds?.lastTs || Date.now();
      const diff = 3600000 - (Date.now() - last);
      return diff>0 ? Math.ceil(diff/1000) : 0;
    }

    // пассивный доход монет
    function getPassivePerHour(){
      return PASSIVE_RATES[state.passive?.level || 0] || 0;
    }
    function accruePassiveIfDue(skipSave){
      const cph = getPassivePerHour();
      if(!state.passive) state.passive = { level:0, lastTs: Date.now() };
      if(!state.passive.lastTs) state.passive.lastTs = Date.now();
      if(cph <= 0) return;
      const now = Date.now();
      const elapsed = now - state.passive.lastTs;
      const hours = Math.floor(elapsed / 3600000);
      if(hours > 0){
        const grossIncome = hours * cph;
        const tax = Math.floor(grossIncome * TAX_RATE);
        const netIncome = grossIncome - tax;

        state.total += netIncome;
        state.passive.lastTs = state.passive.lastTs + hours * 3600000;
        
        // пассивный доход монет засчитывется в историю операций
        addHistory('income', 'Пассивный доход', `+${formatNum(netIncome)} монет`), '(налог 10%)';

        if(!skipSave){ save(); updateUI(); }
      }
    }
    function passiveSecsToNext(){
      const cph = getPassivePerHour();
      if(cph <= 0) return 0;
      const last = state.passive?.lastTs || Date.now();
      const diff = 3600000 - (Date.now() - last);
      return diff>0 ? Math.ceil(diff/1000) : 0;
    }

    function refreshMiniRewardLabel(){
      const el = document.getElementById('perCatchReward');
      if(!el) return;
      const r = getMiniReward();
      try { el.textContent = `+${Number(r).toLocaleString('ru-RU')} монет`; }
      catch(e){ el.textContent = `+${r} монет`; }
    }

    function formatNum(n){ try { return Number(n).toLocaleString('ru-RU'); } catch(e){ return String(n); } }

    function formatWithSmallDecimal(n) {
      const str = Number(n).toLocaleString('ru-RU');
      const parts = str.split(',');
      if (parts.length === 2) {
        return parts[0] + '<span style="font-size:0.75em;">,' + parts[1] + '</span>';
      } else {
        return str;
      }
    }

    function updateEnergyDisplay(){
      accrueEnergy();
      const max = getMaxEnergy();
      state.energyCurrent = Math.min(max, state.energyCurrent);
      if(energyDisplayEl) energyDisplayEl.textContent = Math.floor(state.energyCurrent) + '/' + formatNum(max);
    }

    function getLevelInfo(total) {
      for (let i = 0; i < levels.length; i++) {
        const lv = levels[i];
        if (total >= lv.min && total < lv.max) {
          const progress = ((total - lv.min) / (lv.max - lv.min)) * 100;
          return { level: i + 1, title: lv.title, progress: Math.min(100, Math.max(0, progress)), maxLevel: levels.length };
        }
      }
      return { level: levels.length, title: levels[levels.length - 1].title, progress: 100, maxLevel: levels.length };
    }

    function updateUI(){
      totalTop.innerHTML = formatWithSmallDecimal(state.total);
      perClickEl.textContent = getPerClick();
      if(diamondsTopEl){ diamondsTopEl.textContent = formatNum(state.diamonds?.total||0); }
      refreshUpgradeUI();
      refreshSkinsUI();
      refreshMiniRewardLabel();
      refreshDiamondsUI();
      renderLeaders();
      updateEnergyDisplay();
      
      const miniTicker = document.getElementById('miniTickerPrice');
      if(miniTicker) {
        const p = getCurrentMarketPrice();
        miniTicker.textContent = `1 АЛМАЗ ≈ ${p.toFixed(2)} LOWKCOIN`;
        miniTicker.style.color = p >= 1763 ? 'var(--green)' : 'var(--red)';
      }

      const info = getLevelInfo(state.total);
      if (rankTitleEl) rankTitleEl.textContent = info.title;
      if (levelNumEl) levelNumEl.textContent = `${info.level}/${info.maxLevel}`;
      if (progressFillEl) progressFillEl.style.width = `${info.progress}%`;

// обновление ника в админпанели
      const nickEl = document.getElementById('playerNick');
      if(nickEl) {
        nickEl.textContent = 'вы: ' + (state.nickname || 'telegram_nik');
      }
    }

    // показ что приходят монеты при тапе
    function showPop(x,y,amount){
      const el = document.createElement('div');
      el.className='coin-pop';
      el.style.left = (x-8)+'px';
      el.style.top=(y-8)+'px';
      el.textContent='+'+formatNum(amount);
      document.body.appendChild(el);
      setTimeout(()=>el.remove(),700);
    }

    // логика тапа (Обычные одиночные клики)
    tapArea.addEventListener('click', (e)=>{
      if (state.holdToTap) return; // Пропускаем клик если включен автофарм по зажатию, так как он обрабатывается отдельно
      state.lastTapTs = Date.now();
      accrueEnergy();
      if(state.energyCurrent < 1) return;
      const oldMax = getMaxEnergy();
      const add = getPerClick();
      state.energyCurrent -= 1;
      state.total += add;
      const newMax = getMaxEnergy();
      if(newMax > oldMax){
        state.energyCurrent = newMax;
        state.lastEnergyRegen = Date.now();
      }
      updateUI(); save();
      showPop(e.clientX, e.clientY, add);
    });

   // ЛОГИКА АВТОФАРМА (по зажатию на картинке + ведению пальцем/мышкой)
    let holdInterval = null;
    let isHolding = false;
    let lastX = 0;
    let lastY = 0;

    function startHolding(e) {
      if (!state.holdToTap) return;
      if (isHolding) return;
      isHolding = true;

      // Получаем координаты пальца или курсора
      let clientX = e.clientX;
      let clientY = e.clientY;
      if (e.type === 'touchstart' && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
      
      lastX = clientX;
      lastY = clientY;

      executeHoldTap(clientX, clientY);

      // Запускаем ультра-быстрый цикл авто-кликов (каждые 30мс ~ 33 клика в секунду!)
      holdInterval = setInterval(() => {
        executeHoldTap(lastX, lastY);
      }, 30);
    }

    function stopHolding() {
      if (holdInterval) {
        clearInterval(holdInterval);
        holdInterval = null;
      }
      isHolding = false;
    }

    function executeHoldTap(x, y) {
      if (state.energyCurrent < 1) {
        stopHolding();
        return;
      }
      state.lastTapTs = Date.now();
      accrueEnergy();
      const oldMax = getMaxEnergy();
      const add = getPerClick();
      state.energyCurrent -= 1;
      state.total += add;
      const newMax = getMaxEnergy();
      if(newMax > oldMax){
        state.energyCurrent = newMax;
        state.lastEnergyRegen = Date.now();
      }
      updateUI();
      save();
      showPop(x, y, add);

      // Имитируем анимацию физического наклона при автокликах
      const rect = tapArea.getBoundingClientRect();
      const offsetX = x - rect.left - rect.width / 2;
      const offsetY = y - rect.top - rect.height / 2;
      const DEG = 25;
      const tiltX = (offsetY / rect.height) * DEG;
      const tiltY = (offsetX / rect.width) * -DEG;
      tapArea.style.setProperty('--tiltX', `${tiltX}deg`);
      tapArea.style.setProperty('--tiltY', `${tiltY}deg`);
      setTimeout(() => {
        tapArea.style.setProperty('--tiltX', '0deg');
        tapArea.style.setProperty('--tiltY', '0deg');
      }, 150);
    }

    // Слушатели зажатия для ПК и Сенсорных экранов
    tapArea.addEventListener('mousedown', startHolding);
    tapArea.addEventListener('touchstart', startHolding, { passive: true });
    window.addEventListener('mouseup', stopHolding);
    window.addEventListener('touchend', stopHolding);
    tapArea.addEventListener('mouseleave', stopHolding);

    // Новые обработчики движения: когда ведешь зажатой мышкой или пальцем — тапает со скоростью движения!
    tapArea.addEventListener('mousemove', (e) => {
      if (!state.holdToTap || !isHolding) return;
      lastX = e.clientX;
      lastY = e.clientY;
      executeHoldTap(e.clientX, e.clientY);
    });

    tapArea.addEventListener('touchmove', (e) => {
      if (!state.holdToTap || !isHolding) return;
      if (e.touches.length > 0) {
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
        executeHoldTap(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });


    // вкладки сверху
    function switchTab(tab){
      ['mining','achievements','friends','little'].forEach(t=>{
        const el = document.getElementById(t);
        if(el) el.style.display = (t===tab? 'block' : 'none');
      });
      document.querySelectorAll('header button').forEach(b=>b.classList.remove('active'));
      const btn = document.getElementById('tab-'+tab);
      if(btn) btn.classList.add('active');
    }
    document.getElementById('tab-mining').onclick = ()=>switchTab('mining');
    document.getElementById('tab-achievements').onclick = ()=>switchTab('achievements');
    document.getElementById('tab-friends').onclick = ()=>switchTab('friends');
    document.getElementById('tab-little').onclick = ()=>switchTab('little');

    // подвладки (прокачка,алмазы,скины итд)
    const subUpgBtn = document.getElementById('sub-upgrades');
    const subDiamondsBtn = document.getElementById('sub-diamonds');
    const subSkinsBtn = document.getElementById('sub-skins');
    const upgradesWrap = document.getElementById('upgradesWrap');
    const diamondsWrap = document.getElementById('diamondsWrap');
    const skinsSubWrap = document.getElementById('skinsSubWrap');

    function switchSub(tab){
 
      subUpgBtn.classList.remove('active');
      subDiamondsBtn.classList.remove('active');
      subSkinsBtn.classList.remove('active');
      upgradesWrap.style.display='none';
      diamondsWrap.style.display='none';
      skinsSubWrap.style.display='none';

      if(tab==='upg'){
        upgradesWrap.style.display='block';
        subUpgBtn.classList.add('active');
      } else if(tab==='diamonds'){
        diamondsWrap.style.display='block';
        subDiamondsBtn.classList.add('active');
      } else if(tab==='skins'){
        skinsSubWrap.style.display='block';
        subSkinsBtn.classList.add('active');
      }
    }
    subUpgBtn.onclick = ()=>switchSub('upg');
    subDiamondsBtn.onclick = ()=>switchSub('diamonds');
    subSkinsBtn.onclick = ()=>switchSub('skins');

    // подтверждение покупок
    const confirmModal = document.getElementById('confirmModal');
    const confirmItemName = document.getElementById('confirmItemName');
    const confirmItemPrice = document.getElementById('confirmItemPrice');
    const confirmYesBtn = document.getElementById('confirmYesBtn');
    const confirmNoBtn = document.getElementById('confirmNoBtn');

    let pendingAction = null;

    function openConfirm(name, price, action) {
      confirmItemName.textContent = name;
      confirmItemPrice.textContent = price;
      pendingAction = action;
      confirmModal.style.display = 'flex';
    }

    confirmYesBtn.addEventListener('click', () => {
      if (pendingAction) pendingAction();
      confirmModal.style.display = 'none';
      pendingAction = null;
    });

    confirmNoBtn.addEventListener('click', () => {
      confirmModal.style.display = 'none';
      pendingAction = null;
    });

    // хранилище улучшений
    const UPGRADE_COST = 100000;
    const UPGRADE_MINIBOOST_COST = 100000;
    const STOCK_EXCHANGE_COST = 567;
    const buyPlus20Btn = document.getElementById('buyPlus20');
    const upgradeHint = document.getElementById('upgradeHint');
    const buyMiniBoostBtn = document.getElementById('buyMiniBoost');
    const upgradeHintMini = document.getElementById('upgradeHintMini');
    const buyPassiveBtn = document.getElementById('buyPassive');
    const upgradeHintPassive = document.getElementById('upgradeHintPassive');
    const passiveTitle = document.getElementById('passiveTitle');
    const passivePrice = document.getElementById('passivePrice');
    const passiveDesc = document.getElementById('passiveDesc');
    const buyMulticlickBtn = document.getElementById('buyMulticlick');
    const multiclickTitle = document.getElementById('multiclickTitle');
    const multiclickPrice = document.getElementById('multiclickPrice');
    const multiclickDesc = document.getElementById('multiclickDesc');
    const upgradeHintMulticlick = document.getElementById('upgradeHintMulticlick');
    const buyMultienergyBtn = document.getElementById('buyMultienergy');
    const multienergyTitle = document.getElementById('multienergyTitle');
    const multienergyPrice = document.getElementById('multienergyPrice');
    const multienergyDesc = document.getElementById('multienergyDesc');
    const upgradeHintMultienergy = document.getElementById('upgradeHintMultienergy');
    const buyStockExchangeBtn = document.getElementById('buyStockExchange');
    const upgradeHintStockExchange = document.getElementById('upgradeHintStockExchange');

    function refreshUpgradeUI(){

      // плюс 20 к клику
      const bought = !!(state.upgrades && state.upgrades.plus20);
      if(bought){
        buyPlus20Btn.textContent = 'куплено';
        buyPlus20Btn.classList.add('disabled');
        buyPlus20Btn.disabled = true;
        upgradeHint.textContent = 'активно: за клик ты получаешь на 20 монет больше';
      }else{
        const affordable = state.total >= UPGRADE_COST;
        buyPlus20Btn.textContent = affordable ? 'купить' : 'недостаточно монет';
        buyPlus20Btn.classList.toggle('disabled', !affordable);
        buyPlus20Btn.disabled = !affordable;
        upgradeHint.textContent = affordable ? '' : `нужно ещё ${formatNum(Math.max(0, UPGRADE_COST - state.total))} монет`;
      }

      // маленький лоуки апгрейд
      const boughtMini = !!(state.upgrades && state.upgrades.miniBoost);
      if(boughtMini){
        buyMiniBoostBtn.textContent = 'куплено';
        buyMiniBoostBtn.classList.add('disabled');
        buyMiniBoostBtn.disabled = true;
        if(upgradeHintMini) upgradeHintMini.textContent = 'активно: за пойманный маленькийлоуки ты получаешь +1000';
      } else {
        const affordableMini = state.total >= UPGRADE_MINIBOOST_COST;
        buyMiniBoostBtn.textContent = affordableMini ? 'купить' : 'недостаточно монет';
        buyMiniBoostBtn.classList.toggle('disabled', !affordableMini);
        buyMiniBoostBtn.disabled = !affordableMini;
        if(upgradeHintMini) upgradeHintMini.textContent = affordableMini ? '' : `нужно ещё ${formatNum(Math.max(0, UPGRADE_MINIBOOST_COST - state.total))} монет`;
      }

      const level = state.passive?.level || 0;
      const maxed = level >= PASSIVE_MAX_LEVEL;
      const currentRate = getPassivePerHour();
      const currentNetRate = currentRate - Math.floor(currentRate * TAX_RATE); // чистая прибыль

      const nextLevel = level + 1;
      const nextRate = PASSIVE_RATES[nextLevel] || 0;
      const nextNetRate = nextRate - Math.floor(nextRate * TAX_RATE); // будущая чистая прибыль
      const nextCost = PASSIVE_COSTS[nextLevel] || 0;

      if(maxed){
        passiveTitle.textContent = `пассивный доход`;
        passivePrice.textContent = `максимум достигнут`;
        passiveDesc.textContent = `+${formatNum(currentNetRate)} монет каждый час (налог 10%)`;
        buyPassiveBtn.textContent = 'максимум';
        buyPassiveBtn.classList.add('disabled');
        buyPassiveBtn.disabled = true;
        upgradeHintPassive.textContent = `начисления: +${formatNum(currentNetRate)} монет/час (чистыми)`;
      }else{
        const affordable = state.total >= nextCost;
        passiveTitle.textContent = `пассивный доход`;
        passivePrice.textContent = `стоимость: ${formatNum(nextCost)} монет`;
        passiveDesc.textContent = `зарабатывай +${formatNum(nextNetRate)} монет каждый час пассивно`;
        buyPassiveBtn.textContent = affordable ? 'купить' : 'недостаточно монет';
        buyPassiveBtn.classList.toggle('disabled', !affordable);
        buyPassiveBtn.disabled = !affordable;
        if(level > 0){
          upgradeHintPassive.textContent = `сейчас: +${formatNum(currentNetRate)} монет/час (чистыми)`;
        }else{
          upgradeHintPassive.textContent = affordable ? '' : `нужно ещё ${formatNum(Math.max(0, nextCost - state.total))} монет`;
        }
      }
      refreshPassiveTimer();

      // прокачка прибыли за клик
      const tierIndex = state.multiclick.currentTier;
      const purchases = state.multiclick.purchasesInTier;
      if (tierIndex >= MULTICLICK_TIERS.length) {
        multiclickTitle.textContent = 'прокачка прибыли за клик';
        multiclickPrice.textContent = 'максимум достигнут';
        multiclickDesc.textContent = `общий бонус: +${formatNum(state.multiclick.totalBonus)} к клику`;
        buyMulticlickBtn.textContent = 'максимум';
        buyMulticlickBtn.classList.add('disabled');
        buyMulticlickBtn.disabled = true;
        upgradeHintMulticlick.textContent = 'все уровни завершены';
      } else {
        const tier = MULTICLICK_TIERS[tierIndex];
        const affordable = state.total >= tier.cost;
        multiclickTitle.textContent = 'прокачка прибыли за клик';
        multiclickPrice.textContent = `стоимость: ${formatNum(tier.cost)} монет`;
        multiclickDesc.textContent = `прибавляет +${tier.add} монет к прибыли за каждый клик`;
        buyMulticlickBtn.textContent = affordable ? 'купить' : 'недостаточно монет';
        buyMulticlickBtn.classList.toggle('disabled', !affordable);
        buyMulticlickBtn.disabled = !affordable;
        upgradeHintMulticlick.textContent = affordable ? `ты получаешь: +${formatNum(state.multiclick.totalBonus)} к клику` : `нужно ещё ${formatNum(Math.max(0, tier.cost - state.total))} монет; ты получаешь: +${formatNum(state.multiclick.totalBonus)} монет за каждый клик`;
      }

      // многоуровневое улучшение энергии
      const energyTierIndex = state.multienergy.currentTier;
      const energyPurchases = state.multienergy.purchasesInTier;
      if (energyTierIndex >= MULTIENERGY_TIERS.length) {
        multienergyTitle.textContent = 'прокачка максимума энергии';
        multienergyPrice.textContent = 'максимум достигнут';
        multienergyDesc.textContent = `общий бонус: +${formatNum(state.multienergy.totalBonus)} к максимуму энергии`;
        buyMultienergyBtn.textContent = 'максимум';
        buyMultienergyBtn.classList.add('disabled');
        buyMultienergyBtn.disabled = true;
        upgradeHintMultienergy.textContent = 'все уровни завершены';
      } else {
        const tier = MULTIENERGY_TIERS[energyTierIndex];
        const affordable = state.total >= tier.cost;
        multienergyTitle.textContent = 'прокачка максимума энергии';
        multienergyPrice.textContent = `стоимость: ${formatNum(tier.cost)} монет`;
        multienergyDesc.textContent = `прибавляет +${tier.add} к максимуму энергии`;
        buyMultienergyBtn.textContent = affordable ? 'купить' : 'недостаточно монет';
        buyMultienergyBtn.classList.toggle('disabled', !affordable);
        buyMultienergyBtn.disabled = !affordable;
        upgradeHintMultienergy.textContent = affordable ? `ты получаешь: +${formatNum(state.multienergy.totalBonus)} к максимуму энергии` : `нужно ещё ${formatNum(Math.max(0, tier.cost - state.total))} монет; ты получаешь: +${formatNum(state.multienergy.totalBonus)} к максимуму энергии`;
      }

      // биржа
      const seActive = state.stockExchange.active;
      const seDaysLeft = getStockExchangeDaysLeft();
      if(seActive){
        buyStockExchangeBtn.textContent = 'куплено';
        buyStockExchangeBtn.classList.add('disabled');
        buyStockExchangeBtn.disabled = true;
        upgradeHintStockExchange.textContent = `активно: осталось ${seDaysLeft} дней`;
      } else {
        const affordable = (state.diamonds.total || 0) >= STOCK_EXCHANGE_COST;
        buyStockExchangeBtn.textContent = affordable ? 'купить' : 'недостаточно алмазов';
        buyStockExchangeBtn.classList.toggle('disabled', !affordable);
        buyStockExchangeBtn.disabled = !affordable;
        upgradeHintStockExchange.textContent = affordable ? '' : `нужно ещё ${formatNum(Math.max(0, STOCK_EXCHANGE_COST - (state.diamonds.total || 0)))} алмазов`;
      }
    }

    function refreshPassiveTimer(){
      if(upgradeHintPassive){
        const level = state.passive?.level || 0;
        if(level > 0){
          const secs = passiveSecsToNext();
          const h = Math.floor(secs/3600);
          const m = Math.floor((secs%3600)/60);
          const s = secs%60;
          const currentRate = getPassivePerHour();
          const netRate = currentRate - Math.floor(currentRate * TAX_RATE);

          upgradeHintPassive.textContent = `прибыль: +${formatNum(netRate)} монет/час (чистыми), налог 10%.\nслед. начисление через ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        }
      }
    }

    buyPlus20Btn.addEventListener('click', ()=>{
      if(state.upgrades?.plus20) return; // уже куплено
      if(state.total < UPGRADE_COST) return; // страховка
      
      openConfirm('+20 к клику', `${formatNum(UPGRADE_COST)} монет`, () => {
        state.total -= UPGRADE_COST;
        if(!state.upgrades) state.upgrades = {};
        state.upgrades.plus20 = true;
        addHistory('spend', 'Улучшение (+20/клик)', `-${formatNum(UPGRADE_COST)} монет`);
        save(); updateUI();
      });
    });

    // покупка апгрейда маленького лоуки
    buyMiniBoostBtn.addEventListener('click', ()=>{
      if(state.upgrades?.miniBoost) return; // уже куплено
      if(state.total < UPGRADE_MINIBOOST_COST) return; // страховка
      
      openConfirm('Маленький Лоуки Апгрейд', `${formatNum(UPGRADE_MINIBOOST_COST)} монет`, () => {
        state.total -= UPGRADE_MINIBOOST_COST;
        if(!state.upgrades) state.upgrades = {};
        state.upgrades.miniBoost = true;
        addHistory('spend', 'Маленький Лоуки Апгрейд', `-${formatNum(UPGRADE_MINIBOOST_COST)} монет`);
        save(); updateUI();
      });
    });

    // покупка пассивного дохода
    buyPassiveBtn.addEventListener('click', ()=>{
      const level = state.passive?.level || 0;
      const nextLevel = level + 1;
      if(nextLevel > PASSIVE_MAX_LEVEL) return;
      const nextCost = PASSIVE_COSTS[nextLevel] || 0;
      if(state.total < nextCost) return;

      openConfirm('Пассивный доход', `${formatNum(nextCost)} монет`, () => {
        state.total -= nextCost;
        state.passive.level = nextLevel;
        if(!state.passive.lastTs) state.passive.lastTs = Date.now();
        addHistory('spend', `Улучшение пассивного дохода (Ур.${nextLevel})`, `-${formatNum(nextCost)} монет`);
        save(); updateUI();
      });
    });

    // покупка прокачки за клик
    buyMulticlickBtn.addEventListener('click', ()=>{
      const tierIndex = state.multiclick.currentTier;
      if (tierIndex >= MULTICLICK_TIERS.length) return;
      const tier = MULTICLICK_TIERS[tierIndex];
      if (state.multiclick.purchasesInTier >= tier.max) return;
      if (state.total < tier.cost) return;

      openConfirm('Прокачку прибыли за клик', `${formatNum(tier.cost)} монет`, () => {
        state.total -= tier.cost;
        state.multiclick.totalBonus += tier.add;
        state.multiclick.purchasesInTier += 1;
        if (state.multiclick.purchasesInTier >= tier.max) {
          state.multiclick.currentTier += 1;
          state.multiclick.purchasesInTier = 0;
        }
        addHistory('spend', 'Прокачка прибыли за клик', `-${formatNum(tier.cost)} монет`);
        save(); updateUI();
      });
    });

    // покупка прокачки энергии
    buyMultienergyBtn.addEventListener('click', ()=>{
      const tierIndex = state.multienergy.currentTier;
      if (tierIndex >= MULTIENERGY_TIERS.length) return;
      const tier = MULTIENERGY_TIERS[tierIndex];
      if (state.multienergy.purchasesInTier >= tier.max) return;
      if (state.total < tier.cost) return;

      openConfirm('Прокачку максимума энергии', `${formatNum(tier.cost)} монет`, () => {
        state.total -= tier.cost;
        state.multienergy.totalBonus += tier.add;
        state.multienergy.purchasesInTier += 1;
        if (state.multienergy.purchasesInTier >= tier.max) {
          state.multienergy.currentTier += 1;
          state.multienergy.purchasesInTier = 0;
        }
        const max = getMaxEnergy();
        state.energyCurrent = Math.min(max, state.energyCurrent);
        addHistory('spend', 'Прокачка энергии', `-${formatNum(tier.cost)} монет`);
        save(); updateUI();
      });
    });

    // покупка биржи
    buyStockExchangeBtn.addEventListener('click', ()=>{
      if(state.stockExchange.active) return;
      if((state.diamonds.total || 0) < STOCK_EXCHANGE_COST) return;

      openConfirm('Доступ к Бирже (30 дней)', `${formatNum(STOCK_EXCHANGE_COST)} алмазов`, () => {
        state.diamonds.total -= STOCK_EXCHANGE_COST;
        state.stockExchange = {
          active: true,
          startTs: Date.now(),
          lastClaimTs: 0
        };
        addHistory('spend', 'Покупка Биржи', `-${formatNum(STOCK_EXCHANGE_COST)} алм.`);
        save(); updateUI();
        checkStockExchange(true); // начислить сразу после покупки
      });
    });

// логика биржи
    function getStockExchangeDaysLeft() {
      if (!state.stockExchange.active) return 0;
      const startDay = Math.floor(state.stockExchange.startTs / 86400000);
      const currentDay = Math.floor(Date.now() / 86400000);
      const daysPassed = currentDay - startDay;
      return Math.max(0, 30 - daysPassed);
    }

    function checkStockExchange(afterPurchase = false) {
      if (!state.stockExchange || !state.stockExchange.active) return;
      
      const currentTs = Date.now();
      const currentDay = Math.floor(currentTs / 86400000);
      const lastTs = state.stockExchange.lastClaimTs || state.stockExchange.startTs;
      const lastClaimDay = Math.floor(lastTs / 86400000);
      const startDay = Math.floor(state.stockExchange.startTs / 86400000);

      if ((currentDay - startDay) >= 30) {
        state.stockExchange = {
          active: false,
          startTs: 0,
          lastClaimTs: 0
        };
        addHistory('info', 'Биржа', 'Срок истек (30 дней)');
        save();
        updateUI();
        return;
      }

      if (afterPurchase) {
        const rand = Math.random();
        const amount = Math.floor(Math.pow(rand, 4) * 100000) + 1;
        state.total += amount;
        state.stockExchange.lastClaimTs = currentTs;
        addHistory('income', 'Доход с Биржи', `+${formatNum(amount)} монет`);
        save();
        updateUI();
        showStockExchangePopup(amount);
        return;
      }

      const diff = currentDay - lastClaimDay;
      if (diff > 1) {
        state.stockExchange = {
          active: false,
          startTs: 0,
          lastClaimTs: 0
        };

        addHistory('spend', 'Биржа', 'Сгорела (пропуск дня)');
        showAlert('биржа аннулирована! вы пропустили ежедневный вход.');
        
        save();
        updateUI();
        return;
      }

      if (diff === 1) {
        const rand = Math.random();
        const amount = Math.floor(Math.pow(rand, 4) * 100000) + 1;
        state.total += amount;
        state.stockExchange.lastClaimTs = currentTs;
        addHistory('income', 'Доход с Биржи', `+${formatNum(amount)} монет`);
        save();
        updateUI();
        showStockExchangePopup(amount);
      }
    }

    const stockExchangeModal = document.getElementById('stockExchangeModal');
    const stockExchangeAmountEl = document.getElementById('stockExchangeAmount');
    const closeStockExchangeBtn = document.getElementById('closeStockExchange');

    function showStockExchangePopup(amount) {
      stockExchangeAmountEl.textContent = formatNum(amount);
      stockExchangeModal.style.display = 'flex';
    }

    closeStockExchangeBtn.addEventListener('click', () => {
      stockExchangeModal.style.display = 'none';
    });

    // логика покупки и использовании скинов
    const skinsHint = document.getElementById('skinsHint');
    const currentSkinNameEl = document.getElementById('currentSkinName');
    const resetSkinBtn = document.getElementById('resetSkin');

    function getSkinSrc(){
      const eq = state.skins && state.skins.equipped;
      if(eq && SKINS[eq]) return SKINS[eq].src;
      return defaultImgSrc;
    }

    function refreshSkinsUI(){
      Object.keys(SKINS).forEach(id=>{
        const btn = document.getElementById('action-'+id);
        if(!btn) return;
        const owned = !!(state.skins && state.skins.owned && state.skins.owned[id]);
        const equipped = state.skins && state.skins.equipped === id;
        if(owned){
          if(equipped){
            btn.textContent = 'в использовании';
            btn.disabled = true;
            btn.classList.add('disabled');
          }else{
            btn.textContent = 'использовать';
            btn.disabled = false;
            btn.classList.remove('disabled');
          }
        }else{
          const affordable = state.total >= SKINS[id].price;
          btn.textContent = affordable ? 'купить и использовать' : 'недостаточно монет';
          btn.disabled = !affordable;
          btn.classList.toggle('disabled', !affordable);
        }
      });

      // текущий скин
      const cur = state.skins && state.skins.equipped;
      currentSkinNameEl.textContent = cur && SKINS[cur] ? SKINS[cur].name : 'стандартный';

      if(cur){
        resetSkinBtn.disabled = false;
        resetSkinBtn.classList.remove('btn-disabled');
      }else{
        resetSkinBtn.disabled = true;
        resetSkinBtn.classList.add('btn-disabled');
      }

      // смена картинки по которой ты тапаешь
      const img = tapArea.querySelector('img');
      if(img) img.src = getSkinSrc();
    }

    document.getElementById('action-eikwon').addEventListener('click', ()=>{
      const id = 'eikwon';
      if(state.skins.owned[id]){
        state.skins.equipped = id;
        save(); updateUI();
      } else {
        if(state.total < SKINS[id].price) return;
        
        openConfirm(`Скин "${SKINS[id].name}"`, `${formatNum(SKINS[id].price)} монет`, () => {
          state.total -= SKINS[id].price;
          state.skins.owned[id] = true;
          state.skins.equipped = id;
          addHistory('spend', `Покупка Скина ${SKINS[id].name}`, `-${formatNum(SKINS[id].price)} монет`);
          save(); updateUI();
        });
      }
    });

    document.getElementById('action-sorie').addEventListener('click', ()=>{
      const id = 'sorie';
      if(state.skins.owned[id]){
        state.skins.equipped = id;
        save(); updateUI();
      } else {
        if(state.total < SKINS[id].price) return;

        openConfirm(`Скин "${SKINS[id].name}"`, `${formatNum(SKINS[id].price)} монет`, () => {
            state.total -= SKINS[id].price;
            state.skins.owned[id] = true;
            state.skins.equipped = id;
            addHistory('spend', `Покупка Скина ${SKINS[id].name}`, `-${formatNum(SKINS[id].price)} монет`);
            save(); updateUI();
        });
      }
    });

    resetSkinBtn.addEventListener('click', ()=>{
      state.skins.equipped = null;
      save(); updateUI();
    });

    // колесо фортуны логика
    const wheelSvg = document.getElementById('wheelSvg');
    const spinBtn = document.getElementById('spinBtn');
    const wheelCooldownEl = document.getElementById('wheelCooldown');
    const wheelResultEl = document.getElementById('wheelResult');
    const wheelModal = document.getElementById('wheelModal');
    const closeWheelBtn = document.getElementById('closeWheel');

    // призы и вероятности
    const WHEEL_PRIZES = [
      { id:'c50',    label:'+50 монет',       type:'coins',    amount:50,     weight:16 },
      { id:'c100',   label:'+100 монет',      type:'coins',    amount:100,    weight:16 },
      { id:'b1',     label:'+1 к клику',      type:'bonus',    amount:1,      weight:14 },
      { id:'c200',   label:'+200 монет',      type:'coins',    amount:200,    weight:12 },
      { id:'c1000a', label:'+1 000 монет',    type:'coins',    amount:1000,   weight:10 },
      { id:'b2',     label:'+2 к клику',      type:'bonus',    amount:2,      weight:12 },
      { id:'c50b',   label:'+50 монет',       type:'coins',    amount:50,     weight:16 },
      { id:'d5',     label:'+5 алмазов',      type:'diamonds', amount:5,      weight:6  },
      { id:'b1b',    label:'+1 к клику',      type:'bonus',    amount:1,      weight:12 },
      { id:'c100k',  label:'+100 000 монет',  type:'coins',    amount:100000, weight:1  }, // очень редкое
      { id:'b20',    label:'+20 к клику',     type:'bonus',    amount:20,     weight:1  }, // очень редкое
      { id:'c1000b', label:'+1 000 монет',    type:'coins',    amount:1000,   weight:10 },
      { id:'d10',    label:'+10 алмазов',     type:'diamonds', amount:10,     weight:4  }
    ];

    // визуал сегментов в колесе фортуны
    const SEGMENT_ORDER = [
      'c50','c100','b1','c200','c1000a','b2',
      'c50b','d5','b1b','c100k','b20','c1000b','d10'
    ];

    function polarToCartesian(cx, cy, r, angleDeg){
      const rad = (angleDeg-90) * Math.PI / 180;
      return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    }
    function describeWedge(cx, cy, rOuter, rInner, a0, a1){
      const p0 = polarToCartesian(cx, cy, rOuter, a0);
      const p1 = polarToCartesian(cx, cy, rOuter, a1);
      const p2 = polarToCartesian(cx, cy, rInner, a1);
      const p3 = polarToCartesian(cx, cy, rInner, a0);
      const large = (a1-a0) % 360 > 180 ? 1 : 0;
      return [
        `M ${p0.x} ${p0.y}`,
        `A ${rOuter} ${rOuter} 0 ${large} 1 ${p1.x} ${p1.y}`,
        `L ${p2.x} ${p2.y}`,
        `A ${rInner} ${rInner} 0 ${large} 0 ${p3.x} ${p3.y}`,
        'Z'
      ].join(' ');
    }

    function buildWheel(){
      const cx=160, cy=160, rOuter=150, rInner=58;
      const segCount = SEGMENT_ORDER.length;
      const segAngle = 360/segCount;
      const g = document.createElementNS('http://www.w3.org/2000/svg','g');
      g.setAttribute('class','wheel-ring');

      for(let i=0;i<segCount;i++){
        const a0 = i*segAngle;
        const a1 = (i+1)*segAngle;
        const path = document.createElementNS('http://www.w3.org/2000/svg','path');
        path.setAttribute('d', describeWedge(cx,cy,rOuter,rInner,a0,a1));
        const hue = Math.round((i/segCount)*360);
        path.setAttribute('fill', `hsl(${hue}, 70%, 50%)`);
        path.setAttribute('stroke','rgba(255,255,255,0.06)');
        path.setAttribute('stroke-width','1');
        g.appendChild(path);

        const prizeId = SEGMENT_ORDER[i];
        const prize = WHEEL_PRIZES.find(p=>p.id===prizeId);
        const mid = a0 + segAngle/2;
        const tr = document.createElementNS('http://www.w3.org/2000/svg','text');
        const pos = polarToCartesian(cx, cy, (rOuter+rInner)/2 + 6, mid);
        tr.setAttribute('x', pos.x);
        tr.setAttribute('y', pos.y);
        tr.setAttribute('fill', '#fff');
        tr.setAttribute('font-size','12');
        tr.setAttribute('font-weight','800');
        tr.setAttribute('text-anchor','middle');
        tr.setAttribute('dominant-baseline','middle');
        tr.setAttribute('transform', `rotate(${mid}, ${pos.x}, ${pos.y})`);
        tr.textContent = prize ? prize.label : '';
        g.appendChild(tr);
      }

      const hub = document.createElementNS('http://www.w3.org/2000/svg','circle');
      hub.setAttribute('cx','160');
      hub.setAttribute('cy','160');
      hub.setAttribute('r','48');
      hub.setAttribute('class','wheel-hub');
      wheelSvg.appendChild(g);
      wheelSvg.appendChild(hub);
    }

    buildWheel();

    function pickPrize(){
      const sum = WHEEL_PRIZES.reduce((a,p)=>a+p.weight,0);
      let r = Math.random()*sum;
      for(const p of WHEEL_PRIZES){
        if(r < p.weight) return p;
        r -= p.weight;
      }
      return WHEEL_PRIZES[0];
    }

    function segmentIndicesByPrize(id){
      const arr=[]; for(let i=0;i<SEGMENT_ORDER.length;i++){ if(SEGMENT_ORDER[i]===id) arr.push(i); }
      return arr;
    }

    let spinning = false;
    let currentRotation = 0;
    let spinStartTime = 0;
    let spinDuration = 0;
    let spinStartRotation = 0;
    let spinTargetRotation = 0;
    let spinPrize = null;

    function wheelCanSpin(){
      const raw = localStorage.getItem(WHEEL_KEY);
      if(!raw) return true;
      const last = Number(raw);
      return (Date.now()-last) >= 24*3600*1000;
    }
    function wheelSecsLeft(){
      const raw = localStorage.getItem(WHEEL_KEY); if(!raw) return 0; const last=Number(raw);
      const diff = 24*3600*1000 - (Date.now()-last);
      return diff>0 ? Math.ceil(diff/1000) : 0;
    }
    function fmtHMS(secs){
      const h = Math.floor(secs/3600);
      const m = Math.floor((secs%3600)/60);
      const s = secs%60;
      const pad=n=>String(n).padStart(2,'0');
      return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }

    function refreshWheelCooldown(){
      const left = wheelSecsLeft();
      if(left<=0){
        wheelCooldownEl.textContent = 'крутить можно';
        spinBtn.disabled=false; spinBtn.classList.remove('btn-disabled');
      }else{
        wheelCooldownEl.textContent = `следующее вращение через ${fmtHMS(left)}`;
        spinBtn.disabled=true; spinBtn.classList.add('btn-disabled');
      }
    }
    setInterval(refreshWheelCooldown, 1000); refreshWheelCooldown();

function applyPrize(prize){
  if(prize.type==='coins'){
    state.total += prize.amount;
    addHistory('income', 'Колесо Фортуны (монеты)', `+${formatNum(prize.amount)} монет`);
    save(); updateUI();
    wheelResultEl.innerHTML = `🎉 выпало: <strong>+${formatNum(prize.amount)} монет</strong>`;
  }else if(prize.type==='bonus'){
    state.bonus = Number(state.bonus||0) + prize.amount;
    addHistory('income', 'Колесо Фортуны (Бонус)', `+${formatNum(prize.amount)}/клик`);
    save(); updateUI();
    wheelResultEl.innerHTML = `🎉 выпало: <strong>+${formatNum(prize.amount)} к клику</strong>`;
  }else if(prize.type==='diamonds'){
    if(!state.diamonds) state.diamonds = { total:0, lastTs: Date.now(), upgrades:{} };
    state.diamonds.total = Number(state.diamonds.total||0) + prize.amount;
    addHistory('income', 'Колесо Фортуны (алмазы)', `+${formatNum(prize.amount)} алм.`);
    save(); updateUI();
    wheelResultEl.innerHTML = `🎉 выпало: <strong>+${formatNum(prize.amount)} алмазов</strong>`;
  }else if(prize.type==='energy'){
    const max = getMaxEnergy();
    state.energyCurrent = Math.min(max, state.energyCurrent + prize.amount);
    addHistory('income', 'Колесо Фортуны (энергия)', `+${formatNum(prize.amount)} энергии`);
    save(); updateUI();
    wheelResultEl.innerHTML = `🎉 выпало: <strong>+${formatNum(prize.amount)} энергии</strong>`;
  }
}

    var NEWTON_ITERATIONS = 4;
    var NEWTON_MIN_SLOPE = 0.001;
    var SUBDIVISION_PRECISION = 0.0000001;
    var SUBDIVISION_MAX_ITERATIONS = 10;
    function A(aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }
    function B(aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1; }
    function C(aA1) { return 3.0 * aA1; }
    function calcBezier(aT, aA1, aA2) { return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT; }
    function getSlope(aT, aA1, aA2) { return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1); }
    function binarySubdivide(aX, aA, aB, mX1, mX2) {
      var currentX, currentT, i = 0;
      do {
        currentT = aA + (aB - aA) / 2.0;
        currentX = calcBezier(currentT, mX1, mX2) - aX;
        if (currentX > 0.0) { aB = currentT; } else { aA = currentT; }
      } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
      return currentT;
    }
    function getTForX(aX, mX1, mX2) {
      if (aX === 0) return 0;
      if (aX === 1) return 1;
      var slope = getSlope(aX, mX1, mX2);
      if (slope === 0) return aX;
      if (slope < NEWTON_MIN_SLOPE) return binarySubdivide(aX, 0, 1, mX1, mX2);
      var currentT = aX;
      for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
        var currentX = calcBezier(currentT, mX1, mX2);
        var currentSlope = getSlope(currentT, mX1, mX2);
        if (currentSlope === 0) return currentT;
        var delta = currentX - aX;
        currentT -= delta / currentSlope;
      }
      return currentT;
    }
    function beziers(mX1, mY1, mX2, mY2) {
      return function(aX) {
        return calcBezier(getTForX(aX, mX1, mX2), mY1, mY2);
      };
    }
    const easing = beziers(0.22, 0.61, 0.36, 1);

function animate() {
  const now = Date.now();
  let progress = (now - spinStartTime) / spinDuration;
  if (progress > 1) progress = 1;
  
  const eased = easing(progress);
  const rotation = spinStartRotation + (spinTargetRotation - spinStartRotation) * eased;
  wheelSvg.style.transform = `rotate(${rotation}deg)`;
  
  if (progress < 1) {
    requestAnimationFrame(animate);
  } else {
    currentRotation = rotation;
    spinning = false;

    applyPrize(spinPrize);
    
    closeWheelBtn.disabled = false;
    closeWheelBtn.classList.remove('btn-disabled');
    localStorage.removeItem(SPIN_KEY);
    refreshWheelCooldown();
  }
}

spinBtn.addEventListener('click', ()=>{
      if(spinning) return;
      if(!wheelCanSpin()){ showAlert('крутить можно раз в 24 часа'); return; }

      wheelModal.style.display = 'flex';
      wheelResultEl.innerHTML = '';
      spinning = true;
      closeWheelBtn.disabled = true;
      closeWheelBtn.classList.add('btn-disabled');
      spinBtn.disabled = true; spinBtn.classList.add('btn-disabled');
      localStorage.setItem(WHEEL_KEY, String(Date.now()));
      refreshWheelCooldown();

      const prize = pickPrize();
      const indices = segmentIndicesByPrize(prize.id);
      const idx = indices[Math.floor(Math.random()*indices.length)];
      const segCount = SEGMENT_ORDER.length;
      const segAngle = 360 / segCount;
      const centerAngle = idx * segAngle + segAngle / 2;
      const jitter = (Math.random() - 0.5) * (segAngle * 0.8);
      const turns = 5 + Math.floor(Math.random() * 3);
      let curNorm = currentRotation % 360;
      if (curNorm < 0) curNorm += 360;
      let destNorm = (360 - centerAngle + jitter) % 360;
      if (destNorm < 0) destNorm += 360;
      let delta = destNorm - curNorm;
      if (delta < 0) delta += 360;
      const targetRotation = currentRotation + (turns * 360) + delta;

      spinStartTime = Date.now();
      spinDuration = 5000;
      spinStartRotation = currentRotation;
      spinTargetRotation = targetRotation;
      spinPrize = prize;

      localStorage.setItem(SPIN_KEY, JSON.stringify({
        startTime: spinStartTime,
        duration: spinDuration,
        startRotation: spinStartRotation,
        targetRotation: spinTargetRotation,
        prize: spinPrize
      }));

      wheelSvg.style.transition = '';

      requestAnimationFrame(animate);
    });

    closeWheelBtn.addEventListener('click', () => {
      if (spinning) return;
      wheelModal.style.display = 'none';
    });

    // логика маленького лоуки
    const startBtn = document.getElementById('startGame');
    const cooldownInfo = document.getElementById('cooldownInfo');
    const miniGameModal = document.getElementById('miniGameModal');
    const gameArea = document.getElementById('gameArea');
    const timeLeftEl = document.getElementById('timeLeft');
    const caughtEl = document.getElementById('caught');

    function canPlay(){
      const raw = localStorage.getItem(GAME_KEY);
      if(!raw) return true;
      const last = Number(raw);
      return (Date.now() - last) >= 3600*1000;
    }
    function timeUntilNext(){
      const raw = localStorage.getItem(GAME_KEY); if(!raw) return 0; const last=Number(raw); const diff = 3600*1000 - (Date.now()-last); return diff>0? Math.ceil(diff/1000) : 0;
    }

    function refreshCooldown(){
      const secs = timeUntilNext();
      if(secs<=0){ cooldownInfo.textContent='играть можно'; startBtn.classList.remove('btn-disabled'); startBtn.disabled=false; }
      else{ const m = Math.floor(secs/60); const s = secs%60; cooldownInfo.textContent = `следующий запуск через ${m}m ${s}s`; startBtn.classList.add('btn-disabled'); startBtn.disabled=true; }
    }
    setInterval(refreshCooldown,1000); refreshCooldown();

    let gameTimer = null; let spawnTimer = null; let timeLeft = 10; let caught = 0; let earnedThisGame = 0; let gameStartTime = 0; let isGameActive = false;
    function startGame(resume = false){
      if(!resume && !canPlay()) return;
      startBtn.classList.add('btn-disabled'); startBtn.disabled=true;
      miniGameModal.style.display = 'flex';
      gameArea.innerHTML=''; 
      if (!resume) {
        caught=0; earnedThisGame=0; timeLeft=10; gameStartTime = Date.now();
        const last = Date.now(); localStorage.setItem(GAME_KEY, String(last)); refreshCooldown();
      } else {
        const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
        timeLeft = Math.max(0, 10 - elapsed);
        if (timeLeft <= 0) {
          endGame();
          return;
        }
      }
      caughtEl.textContent = caught; timeLeftEl.textContent=timeLeft;
      isGameActive = true;

      // спавн маленьких лоуки и бомб в мини игре
      spawnTimer = setInterval(()=>{
        const count = Math.floor(Math.random()*4)+2;
        for(let i=0;i<count;i++) spawnLowki();
        const bombCount = Math.floor(Math.random()*3);
        for(let i=0;i<bombCount;i++) spawnBomb();
      }, 700);

      // кд в маленьком лоуки
      gameTimer = setInterval(()=>{
        timeLeft--; timeLeftEl.textContent = timeLeft;
        if(timeLeft<=0) endGame();
        saveMiniGameState();
      },1000);
    }

    function spawnLowki(){
      const el = document.createElement('div'); el.className='lowki';
      el.style.backgroundImage = `url(${getSkinSrc()})`;
      const gw = gameArea.clientWidth; const gh = gameArea.clientHeight;
      const x = Math.random()*(gw-60); const y = Math.random()*(gh-60);
      el.style.left = x+'px'; el.style.top = y+'px';
      gameArea.appendChild(el);

      let vx = (Math.random()-0.5)*2.2; let vy = (Math.random()-0.5)*2.2;
      const mover = setInterval(()=>{
        const gw = gameArea.clientWidth; const gh = gameArea.clientHeight;
        if(!el.parentNode || !isGameActive){ clearInterval(mover); return; }
        let nx = el.offsetLeft + vx; let ny = el.offsetTop + vy;
        if(nx<0||nx>gw-42) vx *= -1;
        if(ny<0||ny>gh-42) vy *= -1;
        el.style.left = Math.max(0, Math.min(gw-42, el.offsetLeft + vx))+'px';
        el.style.top = Math.max(0, Math.min(gh-42, el.offsetTop + vy))+'px';
      },40);

      function collect(e){
        const reward = getMiniReward();
        state.total += reward; save(); updateUI(); caught++; caughtEl.textContent = caught; earnedThisGame += reward; showPop(e.clientX, e.clientY, reward);
        clearInterval(mover); el.removeEventListener('click', collect); if(el.parentNode) el.remove();
      }
      el.addEventListener('click', collect);

      setTimeout(()=>{ if(el.parentNode && isGameActive) el.remove(); }, 18000);
    }

    function spawnBomb(){
      const el = document.createElement('div'); el.className='bomb';
      const gw = gameArea.clientWidth; const gh = gameArea.clientHeight;
      const x = Math.random()*(gw-40); const y = Math.random()*(gh-40);
      el.style.left = x+'px'; el.style.top = y+'px';
      gameArea.appendChild(el);

      let vx = (Math.random()-0.5)*3.2; let vy = (Math.random()-0.5)*3.2;
      const mover = setInterval(()=>{
        const gw = gameArea.clientWidth; const gh = gameArea.clientHeight;
        if(!el.parentNode || !isGameActive){ clearInterval(mover); return; }
        let nx = el.offsetLeft + vx; let ny = el.offsetTop + vy;
        if(nx<0||nx>gw-34) vx *= -1;
        if(ny<0||ny>gh-34) vy *= -1;
        el.style.left = Math.max(0, Math.min(gw-34, el.offsetLeft + vx))+'px';
        el.style.top = Math.max(0, Math.min(gh-34, el.offsetTop + vy))+'px';
      },40);

      function explode(e){
        clearInterval(mover);
        el.removeEventListener('click', explode);
        if(el.parentNode) el.remove();
        bombHit();
      }
      el.addEventListener('click', explode);

      setTimeout(()=>{ if(el.parentNode && isGameActive) el.remove(); }, 18000);
    }

    function bombHit(){
      clearInterval(gameTimer); clearInterval(spawnTimer); gameTimer=null; spawnTimer=null; isGameActive = false;
      gameArea.querySelectorAll('.lowki, .bomb').forEach(n=>n.remove());
      miniGameModal.style.display='none';
      showAlert(`бах! нажал бомбу — игра окончена. поймано: ${caught}. заработано: ${earnedThisGame} монет`);
      addHistory('income', 'Маленький Лоуки', `+${formatNum(earnedThisGame)} монет`);
      localStorage.removeItem(MINI_GAME_KEY);
      updateUI(); refreshCooldown();
    }

    function endGame(){
      clearInterval(gameTimer); clearInterval(spawnTimer); gameTimer=null; spawnTimer=null; isGameActive = false;
      gameArea.querySelectorAll('.lowki').forEach(n=>n.remove());
      miniGameModal.style.display='none';
      showAlert(`время вышло! поймано: ${caught}. заработано: ${earnedThisGame} монет`);
      addHistory('income', 'Маленький Лоуки', `+${formatNum(earnedThisGame)} монет`);
      localStorage.removeItem(MINI_GAME_KEY);
      updateUI(); refreshCooldown();
    }

    function saveMiniGameState() {
      if (isGameActive) {
        localStorage.setItem(MINI_GAME_KEY, JSON.stringify({
          startTime: gameStartTime,
          timeLeft: timeLeft,
          caught: caught,
          earnedThisGame: earnedThisGame
        }));
      }
    }

    startBtn.addEventListener('click', ()=>{
      if(!canPlay()){ showAlert('игра пока недоступна — можно играть раз в час'); return; }
      startGame();
    });

    // пассивный доход алмазов начисление
    const diamondUpgradesList = document.getElementById('diamondUpgradesList');
    const diamondRateEl = document.getElementById('diamondRate');
    const diamondNextEl = document.getElementById('diamondNext');

    function isPreviousOwned(u) {
      const idx = DIAMOND_UPGRADES.findIndex(up => up.id === u.id);
      if (idx === 0) return true;
      for (let i = 0; i < idx; i++) {
        const prevId = DIAMOND_UPGRADES[i].id;
        if (!state.diamonds.upgrades[prevId]) return false;
      }
      return true;
    }

    function renderDiamondUpgrades(){
      if(!diamondUpgradesList) return;
      diamondUpgradesList.innerHTML = '';
      DIAMOND_UPGRADES.forEach(u=>{
        const card = document.createElement('div'); card.className='upgrade-card';
        const info = document.createElement('div'); info.className='upgrade-info';
        const strong = document.createElement('strong'); strong.textContent = `+${u.displayAdd || u.add} алмазов/час`;
        const price = document.createElement('div'); price.className='price'; price.textContent = `стоимость: ${formatNum(u.cost)} монет`;
        const desc = document.createElement('div'); desc.style.color='var(--muted)'; desc.textContent = 'улучшение для фермы алмазов';
        info.appendChild(strong); info.appendChild(price); info.appendChild(desc);

        const actions = document.createElement('div'); actions.className='skin-actions';
        const btn = document.createElement('button'); btn.id = `buy-${u.id}`; btn.className='buy-btn'; btn.textContent='купить';
        const hint = document.createElement('div'); hint.id = `hint-${u.id}`; hint.style.color='var(--muted)';
        actions.appendChild(btn); actions.appendChild(hint);

        card.appendChild(info); card.appendChild(actions);
        diamondUpgradesList.appendChild(card);

        btn.addEventListener('click', ()=>{
          accrueDiamondsIfDue();
          const owned = !!(state.diamonds.upgrades && state.diamonds.upgrades[u.id]);
          if(owned) return;
          if (!isPreviousOwned(u)) return;
          if(state.total < u.cost) return;

          openConfirm(`Ферму алмазов (+${u.displayAdd || u.add}/ч)`, `${formatNum(u.cost)} монет`, () => {
             state.total -= u.cost;
             if(!state.diamonds.upgrades) state.diamonds.upgrades = {};
             state.diamonds.upgrades[u.id] = true;
             addHistory('spend', `Ферма Алмазов`, `-${formatNum(u.cost)} монет`);
             save(); updateUI();
          });
        });
      });
    }

    function refreshDiamondsUI(){
      if(!state.diamonds) state.diamonds = { total:0, lastTs: Date.now(), upgrades:{} };
      if(diamondsTopEl) diamondsTopEl.textContent = formatNum(state.diamonds.total||0);
      
      if(diamondRateEl) {
          const rawRate = getDiamondsPerHour();
          const netRate = rawRate - Math.floor(rawRate * TAX_RATE);
          diamondRateEl.innerHTML = `${formatNum(netRate)} <span style="font-size:0.8em; opacity:0.7;">(налог 10%)</span>`;
      }

      if(diamondNextEl){
        const secs = diamondSecsToNext();
        if(getDiamondsPerHour()<=0){
          diamondNextEl.textContent = 'начисления отключены (0 алм/час)';
        } else {
          const h = Math.floor(secs/3600);
          const m = Math.floor((secs%3600)/60);
          const s = secs%60;
          diamondNextEl.textContent = `следующее начисление через ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        }
      }

      if(diamondUpgradesList && diamondUpgradesList.children.length===0) renderDiamondUpgrades();
      DIAMOND_UPGRADES.forEach(u=>{
        const btn = document.getElementById(`buy-${u.id}`);
        const hint = document.getElementById(`hint-${u.id}`);
        if(!btn || !hint) return;
        const owned = !!(state.diamonds.upgrades && state.diamonds.upgrades[u.id]);
        if(owned){
          btn.textContent='куплено'; btn.disabled=true; btn.classList.add('disabled'); hint.textContent='активно';
        } else {
          const prevOk = isPreviousOwned(u);
          if (!prevOk) {
            btn.textContent = 'сначала предыдущие';
            btn.disabled = true;
            btn.classList.add('disabled');
            hint.textContent = 'купите все предыдущие улучшения';
          } else {
            const affordable = state.total >= u.cost;
            btn.textContent = affordable ? 'купить' : 'недостаточно монет';
            btn.disabled = !affordable; btn.classList.toggle('disabled', !affordable);
            hint.textContent = affordable ? '' : `нужно ещё ${formatNum(Math.max(0, u.cost - state.total))} монет`;
          }
        }
      });
    }

    setInterval(()=>{ accrueDiamondsIfDue(); accruePassiveIfDue(); refreshDiamondsUI(); refreshPassiveTimer(); }, 1000);

    setInterval(()=>{ accrueEnergy(); updateEnergyDisplay(); }, 100);

    // лотерея за алмазы логика
    const startLotteryBtn = document.getElementById('startLottery');
    const lotteryModal = document.getElementById('lotteryModal');
    const cancelLotteryBtn = document.getElementById('cancelLottery');
    const buyLottery1Btn = document.getElementById('buyLottery1');
    const buyLottery2Btn = document.getElementById('buyLottery2');
    const buyLottery3Btn = document.getElementById('buyLottery3');
    const buyLottery4Btn = document.getElementById('buyLottery4');

    const LOTTERY_TICKETS = [
      { id: 1, cost: 1, maxWin: 10 },
      { id: 2, cost: 100, maxWin: 1000 },
      { id: 3, cost: 1000, maxWin: 10000 },
      { id: 4, cost: 10000, maxWin: 1000000 }
    ];

    function playLottery(ticket) {
      const currentDiamonds = state.diamonds.total || 0;
      if (currentDiamonds < ticket.cost) {
        showAlert('недостаточно алмазов для покупки!');
        return;
      }

      openConfirm(`Лотерейный билет #${ticket.id}`, `${formatNum(ticket.cost)} алмазов`, () => {
        state.diamonds.total -= ticket.cost;
        let win = 0;
        if (Math.random() >= 0.9) { // 10% шанс выиграть что-то
          win = Math.floor(Math.random() * ticket.maxWin) + 1;
        }
        state.diamonds.total += win;
        
        const historyMsg = win > 0 ? `Выигрыш +${win}` : `Проигрыш -${ticket.cost}`;
        const historyType = win > 0 ? 'income' : 'spend';
        addHistory(historyType, 'Лотерея', historyMsg + ' алм.');

        save();
        updateUI();
        lotteryModal.style.display = 'none';
        if (win > 0) {
          showAlert(`поздравляем! вы выиграли ${formatNum(win)} алмазов!`);
        } else {
          showAlert(`увы, вы ничего не выиграли. попробуйте еще раз!`);
        }
      });
    }

    startLotteryBtn.addEventListener('click', () => {
      lotteryModal.style.display = 'flex';
    });

    cancelLotteryBtn.addEventListener('click', () => {
      lotteryModal.style.display = 'none';
    });

    buyLottery1Btn.addEventListener('click', () => playLottery(LOTTERY_TICKETS[0]));
    buyLottery2Btn.addEventListener('click', () => playLottery(LOTTERY_TICKETS[1]));
    buyLottery3Btn.addEventListener('click', () => playLottery(LOTTERY_TICKETS[2]));
    buyLottery4Btn.addEventListener('click', () => playLottery(LOTTERY_TICKETS[3]));

// функция для рендера списков лидеров (изза локальной бд он только один)
function renderLeaders() {
  const leadersList = document.getElementById('leadersList');
  if (!leadersList) return;
  leadersList.innerHTML = '';

  const leaderCard = document.createElement('div');
  leaderCard.className = 'upgrade-card';
  leaderCard.style.background = 'rgba(255,255,255,0.02)';
  leaderCard.style.border = '1px solid rgba(255,255,255,0.03)';

  const avatar = document.createElement('div');
  avatar.style.width = '56px';
  avatar.style.height = '56px';
  avatar.style.borderRadius = '50%';
  avatar.style.background = 'linear-gradient(135deg, #ff7e5f, #feb47b)';
  avatar.style.display = 'flex';
  avatar.style.alignItems = 'center';
  avatar.style.justifyContent = 'center';
  avatar.style.fontSize = '18px';
  avatar.style.fontWeight = '800';
  avatar.style.color = '#fff';
  avatar.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
  avatar.textContent = 'You';

  const info = document.createElement('div');
  info.style.flex = '1';
  info.style.marginLeft = '12px';

  const nick = document.createElement('strong');
  nick.textContent = 'you';
  nick.style.display = 'block';

  const balance = document.createElement('div');
  balance.id = 'leaderBalance';
  balance.style.color = 'var(--accent)';
  balance.style.fontWeight = '700';
  balance.innerHTML = '$ ' + formatWithSmallDecimal(state.total);

  info.appendChild(nick);
  info.appendChild(balance);

  leaderCard.appendChild(avatar);
  leaderCard.appendChild(info);

  leadersList.appendChild(leaderCard);
}

// логика службы поддержки
const supportModal = document.getElementById('supportModal');
const openSupportBtn = document.getElementById('openSupportBtn');
const closeSupportBtn = document.getElementById('closeSupport');
const supportForm = document.getElementById('supportForm');
const ticketsList = document.getElementById('ticketsList');
const supportFileInput = document.getElementById('supportFile');

// прикладывать файлы к обращению в поддержку
let selectedSupportFiles = [];
const MAX_SUPPORT_FILES = 10;
const MAX_FILE_SIZE_MB = 5;

function initSupportFilePreview() {
    if (!supportFileInput) return;
    
    let container = document.getElementById('supportFilePreviews');
    if (!container) {
        container = document.createElement('div');
        container.id = 'supportFilePreviews';
        container.style.display = 'flex';
        container.style.flexWrap = 'wrap';
        container.style.gap = '8px';
        container.style.marginTop = '10px';
        container.style.marginBottom = '10px';
        supportFileInput.parentNode.insertBefore(container, supportFileInput.nextSibling);
    }
    
    supportFileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        
        let addedCount = 0;
        
        files.forEach(file => {
             // лимит на загрузку
             if (selectedSupportFiles.length >= MAX_SUPPORT_FILES) {
                 showAlert('Максимум 10 файлов!');
                 return;
             }
             // лимит на размер файлов
             if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                 showAlert(`Файл ${file.name} слишком большой (макс ${MAX_FILE_SIZE_MB}МБ)`);
                 return;
             }
             // проверка на одинаковые файлы
             const exists = selectedSupportFiles.some(f => f.name === file.name && f.size === file.size);
             if (!exists) {
                 selectedSupportFiles.push(file);
                 addedCount++;
             }
        });
        
        supportFileInput.value = ''; 
        
        renderFilePreviews();
    });
}

function renderFilePreviews() {
    const container = document.getElementById('supportFilePreviews');
    if (!container) return;
    container.innerHTML = '';
    
    if (selectedSupportFiles.length === 0) {
        if(supportFileInput) supportFileInput.disabled = false;
        return;
    }
    
    selectedSupportFiles.forEach((file, index) => {
        const el = document.createElement('div');
        el.style.position = 'relative';
        el.style.width = '80px';
        el.style.height = '80px';
        el.style.borderRadius = '8px';
        el.style.background = 'rgba(255,255,255,0.05)';
        el.style.border = '1px solid rgba(255,255,255,0.1)';
        el.style.overflow = 'hidden';
        el.style.display = 'flex';
        el.style.flexDirection = 'column';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        const delBtn = document.createElement('div');
        delBtn.innerHTML = '×';
        delBtn.style.position = 'absolute';
        delBtn.style.top = '2px';
        delBtn.style.right = '2px';
        delBtn.style.background = 'rgba(0,0,0,0.6)';
        delBtn.style.color = '#fff';
        delBtn.style.borderRadius = '50%';
        delBtn.style.width = '18px';
        delBtn.style.height = '18px';
        delBtn.style.display = 'flex';
        delBtn.style.alignItems = 'center';
        delBtn.style.justifyContent = 'center';
        delBtn.style.cursor = 'pointer';
        delBtn.style.fontSize = '14px';
        delBtn.style.zIndex = '2';
        delBtn.onclick = () => {
            selectedSupportFiles.splice(index, 1);
            renderFilePreviews();
        };
        el.appendChild(delBtn);

        // показ приложеных файлов
        if (file.type.startsWith('image')) {
            const img = document.createElement('img');
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            el.appendChild(img);
            
            const reader = new FileReader();
            reader.onload = (e) => { img.src = e.target.result; };
            reader.readAsDataURL(file);
        } else {
             const icon = document.createElement('div');
             icon.textContent = '📄';
             icon.style.fontSize = '24px';
             el.appendChild(icon);
             const ext = file.name.split('.').pop() || '?';
             const extLabel = document.createElement('div');
             extLabel.textContent = ext.toUpperCase();
             extLabel.style.fontSize = '8px';
             extLabel.style.marginTop = '2px';
             extLabel.style.color = 'var(--muted)';
             el.appendChild(extLabel);
        }
        
        const name = document.createElement('div');
        name.textContent = file.name;
        name.style.position = 'absolute';
        name.style.bottom = '0';
        name.style.left = '0';
        name.style.width = '100%';
        name.style.background = 'rgba(0,0,0,0.7)';
        name.style.fontSize = '9px';
        name.style.color = '#fff';
        name.style.padding = '2px 4px';
        name.style.whiteSpace = 'nowrap';
        name.style.overflow = 'hidden';
        name.style.textOverflow = 'ellipsis';
        name.style.textAlign = 'center';
        el.appendChild(name);
        
        container.appendChild(el);
    });

    // блокировка кнопки прикладки файлов если достигнут лимит файлов
    if (supportFileInput) {
        if (selectedSupportFiles.length >= MAX_SUPPORT_FILES) {
            supportFileInput.disabled = true;
        } else {
            supportFileInput.disabled = false;
        }
    }
}

if (openSupportBtn) {
    openSupportBtn.addEventListener('click', () => {
        supportModal.classList.add('open');
        renderSupportTickets();
    });
}
if (closeSupportBtn) {
    closeSupportBtn.addEventListener('click', () => {
        supportModal.classList.remove('open');
    });
}

function renderSupportTickets() {
    if (!ticketsList) return;
    ticketsList.innerHTML = '';
    
    const tickets = state.support && state.support.tickets ? state.support.tickets : [];
    
    if (tickets.length === 0) {
        ticketsList.innerHTML = '<div style="color:var(--muted);text-align:center;padding:20px;font-size:13px;">У вас пока нет обращений</div>';
        return;
    }

    tickets.forEach(ticket => {
        const el = document.createElement('div');
        el.className = 'ticket-item';
        
        const dateStr = new Date(ticket.date).toLocaleString('ru-RU');
        let filesHtml = '';
        
        if (ticket.fileData && !ticket.files) {
             filesHtml += `
            <div class="ticket-file" 
                 style="margin-top:10px; padding:8px 12px; background:rgba(255,255,255,0.05); border:1px dashed rgba(255,255,255,0.2); border-radius:6px; cursor:pointer; display:flex; align-items:center; gap:10px; transition:0.2s;" 
                 onmouseover="this.style.background='rgba(255,255,255,0.1)'" 
                 onmouseout="this.style.background='rgba(255,255,255,0.05)'"
                 onclick="const w=window.open(); w.document.write('<img src=\\'${ticket.fileData}\\' style=\\'width:100%; height:100%; object-fit:contain; background:#111;\\'>'); w.document.body.style.margin='0'; w.document.body.style.background='#111';">
                <span style="font-size:20px;">📎</span>
                <div>
                   <div style="font-size:12px; font-weight:bold; color:#fff;">Файл (старый)</div>
                   <div style="font-size:10px; color:var(--muted);">Нажми, чтобы развернуть</div>
                </div>
            </div>`;
        }

        if (ticket.files && ticket.files.length > 0) {
            filesHtml += '<div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:10px;">';
            ticket.files.forEach(f => {
                const isImg = f.type && f.type.startsWith('image/');
                const safeName = f.name.replace(/'/g, "\\'");
                const safeData = f.data;
                let iconContent = isImg 
                    ? `<img src="${safeData}" style="width:100%; height:100%; object-fit:cover;">`
                    : `<span style="font-size:20px;">📄</span>`;

                filesHtml += `
                <div onclick="const w=window.open(); w.document.write('<img src=\\'${safeData}\\' style=\\'width:100%; height:100%; object-fit:contain; background:#111;\\'>');"
                     style="width:60px; height:60px; position:relative; border-radius:6px; overflow:hidden; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); cursor:pointer; display:flex; align-items:center; justify-content:center;"
                     title="${safeName}">
                     ${iconContent}
                     <div style="position:absolute; bottom:0; left:0; width:100%; background:rgba(0,0,0,0.6); color:#fff; font-size:8px; padding:1px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; text-align:center;">
                        ${f.name}
                     </div>
                </div>`;
            });
            filesHtml += '</div>';
        }

        el.innerHTML = `
            <div class="ticket-header">
                <span class="ticket-subject">${ticket.subject}</span>
                <span class="ticket-status status-pending">НА РАССМОТРЕНИИ</span>
            </div>
            <div class="ticket-msg">${ticket.message}</div>
            ${filesHtml}
            <div class="ticket-date">${dateStr}</div>
        `;
        ticketsList.prepend(el);
    });
}

if (supportForm) {
    supportForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const subject = document.getElementById('supportSubject').value;
        const message = document.getElementById('supportMessage').value;
        
        if (!subject || !message) {
            showAlert('Пожалуйста, заполните тему и сообщение');
            return;
        }

        const readFilesAsync = (files) => {
            return Promise.all(files.map(file => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve({
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: reader.result
                    });
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            }));
        };

        const submitBtn = supportForm.querySelector('button[type="submit"]');
        const oldBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Отправка...';
        submitBtn.disabled = true;

        try {
            let processedFiles = [];
            if (selectedSupportFiles.length > 0) {
                processedFiles = await readFilesAsync(selectedSupportFiles);
            }

            const newTicket = {
                id: Date.now(),
                subject: subject,
                message: message,
                files: processedFiles,
                status: 'pending',
                date: Date.now()
            };

            if (!state.support) state.support = { tickets: [] };
            if (!state.support.tickets) state.support.tickets = [];
            state.support.tickets.push(newTicket);
            
            save();
            renderSupportTickets();
            supportForm.reset();
            
            selectedSupportFiles = [];
            renderFilePreviews();
            
            showAlert('Ваше обращение успешно отправлено! Мы ответим вам в ближайшее время.');
        } catch (err) {
            console.error(err);
            showAlert('Ошибка при отправке файлов. Попробуйте снова.');
        } finally {
            submitBtn.textContent = oldBtnText;
            submitBtn.disabled = false;
        }
    });
}

// логика ленивого ии ассистента
const aiTriggerBtn = document.getElementById('aiTriggerBtn');
const aiModal = document.getElementById('aiModal');
const closeAiBtn = document.getElementById('closeAiBtn');
const aiMessageEl = document.getElementById('aiMessage');

const AI_PHRASES = [
  "Технический перерыв, он никогда не закончится",
  "Я пока думаю, но процессор не справляется",
  "Я бы помог, но мой виртуальный позвоночник заболел",
  "А ты пробовал просто закрыть глаза и представить, что всё уже сделано?",
  "Ты правда верил, что я начну работать?"
];

let typeTimer = null;

function typeText(text, element) {
  if (typeTimer) clearTimeout(typeTimer);

  element.textContent = "";
  let i = 0;
  const speed = 40; // скорость того как он пишет

  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      typeTimer = setTimeout(type, speed);
    } else {
      typeTimer = null;
    }
  }
  type();
}

if (aiTriggerBtn && aiModal && closeAiBtn && aiMessageEl) {
  aiTriggerBtn.addEventListener('click', () => {
    aiModal.classList.add('open');
    // рандомная фраза
    const randomPhrase = AI_PHRASES[Math.floor(Math.random() * AI_PHRASES.length)];
    typeText(randomPhrase, aiMessageEl);
  });

  closeAiBtn.addEventListener('click', () => {
    aiModal.classList.remove('open');
    // Останавливаем печать немедленно при закрытии
    if (typeTimer) clearTimeout(typeTimer);
    aiMessageEl.textContent = "";
  });
}
    load();

// анимация тапа (применяется для единичных кликов)
const circle = document.getElementById('tapArea');
circle.addEventListener('click', (event) => {
if (state.energyCurrent < 1) return;
  const rect = circle.getBoundingClientRect();
  const offsetX = event.clientX - rect.left - rect.width / 2;
  const offsetY = event.clientY - rect.top - rect.height / 2;
  const DEG = 25;
  const tiltX = (offsetY / rect.height) * DEG;
  const tiltY = (offsetX / rect.width) * -DEG;
  circle.style.setProperty('--tiltX', `${tiltX}deg`);
  circle.style.setProperty('--tiltY', `${tiltY}deg`);
  setTimeout(() => {
    circle.style.setProperty('--tiltX', '0deg');
    circle.style.setProperty('--tiltY', '0deg');
  }, 300);
});

    // восстановления бд
    const spinRaw = localStorage.getItem(SPIN_KEY);
    if (spinRaw) {
      const data = JSON.parse(spinRaw);
      spinStartTime = data.startTime;
      spinDuration = data.duration;
      spinStartRotation = data.startRotation;
      spinTargetRotation = data.targetRotation;
      spinPrize = data.prize;
      const now = Date.now();
      let progress = (now - spinStartTime) / spinDuration;
      if (progress >= 1) {
        currentRotation = data.targetRotation;
        wheelSvg.style.transform = `rotate(${currentRotation}deg)`;
        applyPrize(data.prize);
        wheelResultEl.innerHTML = `🎉 выпало: <strong>${data.prize.label}</strong>`;
        localStorage.removeItem(SPIN_KEY);
        spinning = false;
        closeWheelBtn.disabled = false;
        closeWheelBtn.classList.remove('btn-disabled');
        refreshWheelCooldown();
        wheelModal.style.display = 'flex';
      } else {
        spinning = true;
        wheelModal.style.display = 'flex';
        wheelResultEl.innerHTML = '';
        closeWheelBtn.disabled = true;
        closeWheelBtn.classList.add('btn-disabled');
        requestAnimationFrame(animate);
      }
    }

    const miniRaw = localStorage.getItem(MINI_GAME_KEY);
    if (miniRaw) {
      const data = JSON.parse(miniRaw);
      gameStartTime = data.startTime;
      timeLeft = data.timeLeft;
      caught = data.caught;
      earnedThisGame = data.earnedThisGame;
      if (timeLeft > 0) {
        startGame(true);
      } else {
        localStorage.removeItem(MINI_GAME_KEY);
      }
    }

// логика игры угадай число
    const startGuessBtn = document.getElementById('startGuessGame');
    const guessGameModal = document.getElementById('guessGameModal');
    const guessGameArea = document.getElementById('guessGameArea');
    const guessOptionsEl = document.getElementById('guessOptions');
    const guessTimeLeftEl = document.getElementById('guessTimeLeft');
    const closeGuessBtn = document.getElementById('closeGuessGame');
    const timeoutBarEl = document.getElementById('timeoutBar');
    const timeoutFillEl = timeoutBarEl.querySelector('.fill');
    const GUESS_CD_KEY = 'lowkie_guess_cd';
    let nextRoundTimer = null;

    let guessTimer = null;
    let guessTimeLeft = 5;
    let isGuessActive = false;
    let roundActive = false;
    let correctNumber = 0;

    function generateNumbers() {
      correctNumber = Math.floor(Math.random() * 100) + 1;
      const wrong1 = Math.floor(Math.random() * 100) + 1;
      let wrong2 = Math.floor(Math.random() * 100) + 1;
      while (wrong2 === wrong1 || wrong2 === correctNumber) {
        wrong2 = Math.floor(Math.random() * 100) + 1;
      }
      const options = [correctNumber, wrong1, wrong2];
      options.sort(() => Math.random() - 0.5);
      return options;
    }

    function showGuessNotification(message) {
      const notif = document.createElement('div');
      notif.className = 'guess-notification';
      notif.textContent = message;
      document.body.appendChild(notif);
      setTimeout(() => {
        if (notif.parentNode) notif.remove();
      }, 2500);
    }

    function startGuessRound() {
      if (nextRoundTimer) {
        clearTimeout(nextRoundTimer);
        nextRoundTimer = null;
      }

      roundActive = true;
      guessTimeLeft = 5;
      guessTimeLeftEl.textContent = guessTimeLeft;
      const options = generateNumbers();
      guessOptionsEl.innerHTML = '';
      options.forEach(num => {
        const opt = document.createElement('div');
        opt.className = 'guess-option';
        opt.textContent = num;
        opt.addEventListener('click', () => handleGuess(num));
        guessOptionsEl.appendChild(opt);
      });
      timeoutBarEl.style.display = 'none';

      clearInterval(guessTimer);
      guessTimer = setInterval(() => {
        guessTimeLeft--;
        guessTimeLeftEl.textContent = guessTimeLeft;
        if (guessTimeLeft <= 0) {
          endGuessRound(false, true);
        }
      }, 1000);
    }

    function handleGuess(selected) {
      if (!isGuessActive || !roundActive) return;
      roundActive = false;
      guessOptionsEl.querySelectorAll('.guess-option').forEach(opt => opt.classList.add('disabled'));
      if (selected === correctNumber) {
        state.total += correctNumber;
        addHistory('income', 'Угадай число', `+${correctNumber} монет`);
        save();
        updateUI();
        showGuessNotification(`верно! +${correctNumber} монет`);
        endGuessRound(true);
      } else {
        showGuessNotification('неверно');
        endGuessRound(false);
      }
    }

    function endGuessRound(success, timeout = false) {
      clearInterval(guessTimer);
      if(timeout){
        showGuessNotification('клиент ушел');
        nextRoundTimer = setTimeout(startGuessRound, 1000);
      } else {
        const cooldownTime = 3000;
        
        const cooldownEnd = Date.now() + cooldownTime;
        localStorage.setItem(GUESS_CD_KEY, String(cooldownEnd));
        runCooldownBar(cooldownTime);
        nextRoundTimer = setTimeout(() => {
          localStorage.removeItem(GUESS_CD_KEY); // КД прошло, удаляем метку
          startGuessRound();
        }, cooldownTime);
      }
    }

    function runCooldownBar(duration, remaining) {
        const ms = remaining || duration;
        timeoutBarEl.style.display = 'block';
        timeoutFillEl.style.transition = 'none';
        const startWidth = (ms / 3000) * 100;
        timeoutFillEl.style.width = `${startWidth}%`;
        timeoutFillEl.offsetHeight; 
        timeoutFillEl.style.transition = `width ${ms}ms linear`;
        timeoutFillEl.style.width = '0%';
    }

    function startGuessGame() {
      isGuessActive = true;
      guessGameModal.style.display = 'flex';
      
      const savedCd = localStorage.getItem(GUESS_CD_KEY);
      const now = Date.now();

      if (savedCd && now < Number(savedCd)) {
          const remaining = Number(savedCd) - now;
          
          guessOptionsEl.innerHTML = '';
          
          runCooldownBar(3000, remaining);
          
          if(nextRoundTimer) clearTimeout(nextRoundTimer);
          nextRoundTimer = setTimeout(() => {
              localStorage.removeItem(GUESS_CD_KEY);
              startGuessRound();
          }, remaining);
          
      } else {
          localStorage.removeItem(GUESS_CD_KEY);
          startGuessRound();
      }
    }

    startGuessBtn.addEventListener('click', startGuessGame);

    closeGuessBtn.addEventListener('click', () => {
      clearInterval(guessTimer);

      if (nextRoundTimer) {
          clearTimeout(nextRoundTimer);
          nextRoundTimer = null;
      }
      
      isGuessActive = false;
      guessGameModal.style.display = 'none';
      guessOptionsEl.innerHTML = '';
    });

    // логика курса алмазов
    const openMarketBtn = document.getElementById('openMarketBtn');
    const cryptoTerminal = document.getElementById('cryptoTerminal');
    const closeMarketBtn = document.getElementById('closeMarket');
    const marketPriceDisplay = document.getElementById('marketPriceDisplay');
    const chartCanvas = document.getElementById('priceChart');
    const tradeList = document.getElementById('tradeList');
    const chartLiveIndicator = document.getElementById('chartLiveIndicator');

    const btnBuyTab = document.getElementById('btnBuyTab');
    const btnSellTab = document.getElementById('btnSellTab');
    const tradeAmountInput = document.getElementById('tradeAmount');
    const tradeWalletBalance = document.getElementById('tradeWalletBalance');
    const setMaxAmount = document.getElementById('setMaxAmount');
    const tradeTotalCost = document.getElementById('tradeTotalCost');
    const placeOrderBtn = document.getElementById('placeOrderBtn');

    let isMarketOpen = false;
    let tradeMode = 'buy';
    let marketInterval = null;
    let lastPrice = 0;

    let chartView = {
      offset: 0,       
      zoom: 1.0,       
      isDragging: false,
      lastX: 0,
      auto: true       
    };

    function getPriceAtTime(t) {
      const base = 1763;
      const val = base 
        + Math.sin(t / 1200) * 400
        + Math.sin(t / 150) * 100
        + Math.cos(t / 25) * 30
        + Math.sin(t / 7) * 15;
      return Math.abs(val);
    }

    function getCurrentMarketPrice() {
      return getPriceAtTime(Date.now() / 1000);
    }

    function renderChart() {
      const ctx = chartCanvas.getContext('2d');
      const w = chartCanvas.width = chartCanvas.offsetWidth;
      const h = chartCanvas.height = chartCanvas.offsetHeight;

      const baseDuration = 300;
      const visibleDuration = baseDuration * chartView.zoom;
      
      const now = Date.now() / 1000;
      const endTime = now - chartView.offset;
      const startTime = endTime - visibleDuration;

      const steps = 100;
      const stepSize = visibleDuration / steps;

      const dataPoints = [];
      let minP = Infinity, maxP = -Infinity;

      for(let i=0; i <= steps; i++) {
        const t = startTime + i * stepSize;
        const p = getPriceAtTime(t);
        dataPoints.push({ t, p });
        if(p < minP) minP = p;
        if(p > maxP) maxP = p;
      }

      const padding = (maxP - minP) * 0.1;
      if (padding === 0) { minP -= 10; maxP += 10; }
      else { minP -= padding; maxP += padding; }

      ctx.clearRect(0,0,w,h);
      
      const startP = dataPoints[0].p;
      const endP = dataPoints[dataPoints.length-1].p;
      const isUp = endP >= startP;
      const color = isUp ? '#0ecb81' : '#f6465d';

      const grad = ctx.createLinearGradient(0,0,0,h);
      grad.addColorStop(0, isUp ? 'rgba(14,203,129,0.2)' : 'rgba(246,70,93,0.2)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.beginPath();
      for(let i=0; i < dataPoints.length; i++) {
        const point = dataPoints[i];
        const x = ((point.t - startTime) / visibleDuration) * w;
        const y = h - ((point.p - minP) / (maxP - minP)) * h;
        
        if(i===0) ctx.moveTo(x,y);
        else ctx.lineTo(x,y);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      if (endTime >= now - stepSize) {
          const currentY = h - ((dataPoints[dataPoints.length-1].p - minP) / (maxP - minP)) * h;
          ctx.beginPath();
          ctx.setLineDash([4, 4]);
          ctx.moveTo(0, currentY);
          ctx.lineTo(w, currentY);
          ctx.strokeStyle = 'rgba(255,255,255,0.3)';
          ctx.stroke();
          ctx.setLineDash([]);
      }

      if (chartView.auto) {
          chartLiveIndicator.style.opacity = 1;
      } else {
          chartLiveIndicator.style.opacity = 0;
      }
    }

    chartCanvas.addEventListener('mousedown', (e) => {
      chartView.isDragging = true;
      chartView.lastX = e.clientX;
      chartView.auto = false;
    });

    window.addEventListener('mouseup', () => {
      chartView.isDragging = false;
    });
    
    chartCanvas.addEventListener('mouseleave', () => {
      chartView.isDragging = false;
    });

    chartCanvas.addEventListener('mousemove', (e) => {
      if (!chartView.isDragging) return;
      
      const deltaX = e.clientX - chartView.lastX;
      chartView.lastX = e.clientX;

      const w = chartCanvas.width;
      const baseDuration = 300;
      const visibleDuration = baseDuration * chartView.zoom;
      const secondsPerPixel = visibleDuration / w;
      chartView.offset += deltaX * secondsPerPixel;
      if (chartView.offset < 0) chartView.offset = 0;
      
      renderChart();
    });

    let lastTap = 0;
    
    chartCanvas.addEventListener('touchstart', (e) => {
      const now = Date.now();
      if (now - lastTap < 300) {
        e.preventDefault(); 
        chartView.offset = 0;
        chartView.zoom = 1.0;
        chartView.auto = true;
        renderChart();
        lastTap = 0;
        return;
      }
      lastTap = now;

      if (e.touches.length === 1) {
          chartView.isDragging = true;
          chartView.lastX = e.touches[0].clientX;
          chartView.auto = false;
      }
    }, { passive: false });

    chartCanvas.addEventListener('touchmove', (e) => {
      if (!chartView.isDragging || e.touches.length !== 1) return;
      e.preventDefault();

      const currentX = e.touches[0].clientX;
      const deltaX = currentX - chartView.lastX;
      chartView.lastX = currentX;

      const w = chartCanvas.width;
      const baseDuration = 300;
      const visibleDuration = baseDuration * chartView.zoom;
      const secondsPerPixel = visibleDuration / w;
      
      chartView.offset += deltaX * secondsPerPixel;

      if (chartView.offset < 0) chartView.offset = 0;

      renderChart();
    }, { passive: false });

    chartCanvas.addEventListener('touchend', (e) => {
      chartView.isDragging = false;
    });

    chartCanvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      chartView.auto = false;

      const zoomSensitivity = 0.001;
      chartView.zoom += e.deltaY * zoomSensitivity * chartView.zoom;
      if (chartView.zoom < 0.1) chartView.zoom = 0.1;
      if (chartView.zoom > 10) chartView.zoom = 10;

      renderChart();
    }, { passive: false });

    chartCanvas.addEventListener('dblclick', () => {
      chartView.offset = 0;
      chartView.zoom = 1.0;
      chartView.auto = true;
      renderChart();
    });


    // кошельки торговцев алмазами
    const walletPrefixes = ['0x7a','0xb2','0x9f','0x1c','0x4d','0xe3','0x88','0x23','1u21','8x78','1w32','0x5g','0l1a','0p1q','0x7e','0x6c','0x2a','0x8e','0x9a','0x1f','0x3e','0x4a','a9f2','k3e7','m8q1','r4z6','rzr1','p2x9','pek2','w7c5','n6d3','l1i7','o0l9','i1l0','q9p6','b8h3','s5z2','ivan','alex','crypto','whale','kiren','poqkw','broken','dusty','empty','binn','feen','flake','wobble','twitch','ripple','mumble','glitch','stumble','feat','paper','stone','glass','metal','snow','dighe','signal','mirror','shadow','pids','water'];
    function generateFakeTrade() {
      if(Math.random() > 0.3) return null;

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
      
      const type = Math.random() > 0.5 ? 'buy' : 'sell';
      const vol = (Math.random() * 50).toFixed(2);
      const wallet = walletPrefixes[Math.floor(Math.random()*walletPrefixes.length)] + '...' + Math.floor(Math.random()*99);
      
      return { time: timeStr, wallet, type, vol };
    }

    function updateOrderBook() {
      const trade = generateFakeTrade();
      if(trade) {
        const row = document.createElement('div');
        row.className = 'trade-item';
        row.innerHTML = `
          <span>${trade.time}</span>
          <span>${trade.wallet}</span>
          <span class="type-${trade.type}">${trade.type === 'buy' ? 'Купил' : 'Продал'}</span>
          <span>${trade.vol}</span>
        `;
        tradeList.prepend(row);
        if(tradeList.children.length > 20) {
          tradeList.lastElementChild.remove();
        }
      }
    }

    function marketLoop() {
      const p = getCurrentMarketPrice();
      marketPriceDisplay.textContent = formatNum(p.toFixed(2));
      
      if(p > lastPrice) {
        marketPriceDisplay.classList.remove('down');
        marketPriceDisplay.style.color = 'var(--green)';
      } else if (p < lastPrice) {
        marketPriceDisplay.classList.add('down');
        marketPriceDisplay.style.color = 'var(--red)';
      }
      lastPrice = p;
      if (chartView.auto) {
          chartView.offset = 0;
      }

      renderChart();
      updateOrderBook();
      updateTradeCalculations();
    }

    function openMarket() {
      isMarketOpen = true;
      cryptoTerminal.classList.add('open');
      marketInterval = setInterval(marketLoop, 1000); // 1 sec updates
      chartView.auto = true;
      chartView.offset = 0;
      chartView.zoom = 1.0;
      
      renderChart();
      tradeAmountInput.value = '';
      updateTradeUI();
    }

    function closeMarket() {
      isMarketOpen = false;
      cryptoTerminal.classList.remove('open');
      clearInterval(marketInterval);
    }

    openMarketBtn.addEventListener('click', openMarket);
    closeMarketBtn.addEventListener('click', closeMarket);

    // логика трейдинга
    function updateTradeUI() {
      if(tradeMode === 'buy') {
        tradeWalletBalance.textContent = formatNum(Math.floor(state.total)) + ' монет';
        placeOrderBtn.textContent = 'КУПИТЬ АЛМАЗЫ';
        placeOrderBtn.className = 'btn btn-start place-order-btn buy';
        btnBuyTab.classList.add('active');
        btnSellTab.classList.remove('active');
      } else {
        tradeWalletBalance.textContent = formatNum((state.diamonds.total||0).toFixed(4)) + ' АЛМАЗОВ';
        placeOrderBtn.textContent = 'ПРОДАТЬ АЛМАЗЫ';
        placeOrderBtn.className = 'btn btn-start place-order-btn sell';
        btnSellTab.classList.add('active');
        btnBuyTab.classList.remove('active');
      }
      updateTradeCalculations();
    }

    function updateTradeCalculations() {
      const amount = parseFloat(tradeAmountInput.value) || 0;
      const price = getCurrentMarketPrice();
      const total = amount * price;

      if(tradeMode === 'buy') {
        tradeTotalCost.textContent = `${formatNum(total.toFixed(2))} монет`;
        if(total > 0 && total <= state.total) {
          placeOrderBtn.disabled = false;
          placeOrderBtn.style.opacity = 1;
        } else {
          placeOrderBtn.disabled = true;
          placeOrderBtn.style.opacity = 0.5;
        }
      } else {
        tradeTotalCost.textContent = `+${formatNum(total.toFixed(2))} монет`;
        if(amount > 0 && amount <= (state.diamonds.total||0)) {
           placeOrderBtn.disabled = false;
           placeOrderBtn.style.opacity = 1;
        } else {
           placeOrderBtn.disabled = true;
           placeOrderBtn.style.opacity = 0.5;
        }
      }
    }

    btnBuyTab.addEventListener('click', ()=>{ tradeMode='buy'; updateTradeUI(); });
    btnSellTab.addEventListener('click', ()=>{ tradeMode='sell'; updateTradeUI(); });
    
    tradeAmountInput.addEventListener('input', updateTradeCalculations);
    
    setMaxAmount.addEventListener('click', ()=>{
      const price = getCurrentMarketPrice();
      if(tradeMode === 'buy') {
        const max = state.total / price;
        tradeAmountInput.value = Math.floor(max * 100) / 100;
      } else {
        tradeAmountInput.value = state.diamonds.total || 0;
      }
      updateTradeCalculations();
    });

    placeOrderBtn.addEventListener('click', ()=>{
      const amount = parseFloat(tradeAmountInput.value) || 0;
      const price = getCurrentMarketPrice();
      const totalCost = amount * price;

      if(amount <= 0) return;

      if(tradeMode === 'buy') {
        if(state.total >= totalCost) {
          
          openConfirm('Алмазы на бирже', `${formatNum(totalCost.toFixed(2))} монет`, () => {
             state.total -= totalCost;
             state.diamonds.total = (state.diamonds.total||0) + amount;
             addHistory('spend', `Покупка ${amount} алмазов`, `-${formatNum(totalCost.toFixed(2))} монет`);

             save();
             updateUI();
             updateTradeUI();
             showAlert(`Успешно куплено ${amount} АЛМАЗОВ!`);
             tradeAmountInput.value = '';
          });

        }
      } else {
        if((state.diamonds.total||0) >= amount) {
          
           openConfirm('Продажа алмазов', `${amount} алмазов`, () => {
             state.diamonds.total -= amount;
             state.total += totalCost;
             addHistory('income', `Продажа ${amount} алмазов`, `+${formatNum(totalCost.toFixed(2))} монет`);

             save();
             updateUI();
             updateTradeUI();
             showAlert(`Успешно продано за ${formatNum(totalCost.toFixed(2))} монет!`);
             tradeAmountInput.value = '';
           });
        }
      }
    });

// логика новостей
    const newsModal = document.getElementById('newsModal');
    const openNewsBtn = document.getElementById('openNewsBtn');
    const closeNewsBtn = document.getElementById('closeNews');

    if (openNewsBtn) {
        openNewsBtn.addEventListener('click', () => {
            newsModal.classList.add('open');
        });
    }
    if (closeNewsBtn) {
        closeNewsBtn.addEventListener('click', () => {
            newsModal.classList.remove('open');
        });
    }

// логика кастомного уведомления
const customAlertModal = document.getElementById('customAlertModal');
const customAlertTitle = document.getElementById('customAlertTitle');
const customAlertMessage = document.getElementById('customAlertMessage');
const customAlertOkBtn = document.getElementById('customAlertOkBtn');
const alertIconSymbol = document.querySelector('.alert-icon-symbol');

// появление уведомления
function showAlert(message, title = "Уведомление", isError = false) {
  if (!customAlertModal) {
    alert(message);
    return;
  }
  
  customAlertMessage.innerHTML = message;
  customAlertTitle.textContent = title;
  if (alertIconSymbol) {
    if (isError) {
        alertIconSymbol.style.color = 'var(--red)';
        alertIconSymbol.textContent = '×';
    } else {
        alertIconSymbol.style.color = 'var(--accent)';
        alertIconSymbol.textContent = '!';
    }
  }

  customAlertModal.classList.add('open');
}

if (customAlertOkBtn) {
  customAlertOkBtn.addEventListener('click', () => {
    customAlertModal.classList.remove('open');
  });
}