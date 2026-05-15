/**
 * App — orchestrates menu, theme switching, engine, and UI.
 */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);

  // ---- Subsystems ----
  const engine    = new CalculatorEngine();
  const audio     = new AudioManager();
  const canvasEl  = $('particles');
  const particles = new ParticleSystem(canvasEl);
  particles.start();
  window._particles = particles; // expose for themes

  // ---- DOM refs (calc screen) ----
  const resultEl   = $('result');
  const exprEl     = $('expression');
  const modeEl     = $('mode-indicator');
  const dispCont   = $('display-container');
  const overlay    = $('theme-overlay');
  const calcScreen = $('calc-screen');
  const menuScreen = $('menu');

  // ---- Current theme ----
  let activeTheme = null;
  let idleTimer = null;

  // ============================================================
  // MENU
  // ============================================================
  function buildMenu() {
    const grid = $('menu-grid');
    grid.innerHTML = '';
    ThemeRegistry.all().forEach(([id, theme]) => {
      const card = document.createElement('div');
      card.className = 'menu-card';
      card.style.setProperty('--card-color', theme.color);
      card.innerHTML = `
        <span class="menu-card-icon">${theme.icon}</span>
        <div class="menu-card-name">${theme.name}</div>
        <div class="menu-card-desc">${theme.description}</div>
      `;
      card.addEventListener('click', () => selectTheme(id));
      grid.appendChild(card);
    });
  }

  function selectTheme(id) {
    const theme = ThemeRegistry.get(id);
    if (!theme) return;

    // Deactivate previous
    if (activeTheme) {
      activeTheme.deactivate();
      overlay.innerHTML = '';
    }

    activeTheme = theme;

    // Show calc screen
    menuScreen.classList.add('hidden');
    calcScreen.classList.remove('hidden');
    calcScreen.style.animation = 'none';
    void calcScreen.offsetWidth;
    calcScreen.style.animation = 'calc-enter 0.5s cubic-bezier(0.34,1.56,0.64,1)';

    // Inject overlay HTML (eyes, icons, etc.)
    const overlayHTML = theme.getOverlayHTML();
    if (overlayHTML) {
      // Place overlay inside display-container for proper positioning
      const existing = dispCont.querySelector('.theme-injected');
      if (existing) existing.remove();
      const wrapper = document.createElement('div');
      wrapper.className = 'theme-injected';
      wrapper.innerHTML = overlayHTML;
      dispCont.appendChild(wrapper);
    }

    // Activate theme
    theme.activate({
      result: resultEl,
      expression: exprEl,
      display: dispCont,
      calculator: $('calculator'),
      overlay: overlay,
    });

    // Reset calculator
    engine.clear();
    render(engine._view());

    // Start idle timer
    startIdleTimer();
  }

  function goBack() {
    if (activeTheme) {
      activeTheme.deactivate();
      const existing = dispCont.querySelector('.theme-injected');
      if (existing) existing.remove();
      overlay.innerHTML = '';
      activeTheme = null;
    }
    if (idleTimer) clearInterval(idleTimer);
    calcScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
    menuScreen.style.animation = 'none';
    void menuScreen.offsetWidth;
    menuScreen.style.animation = 'menu-fade-in 0.4s ease';
    // Remove any leftover theme classes
    document.body.className = '';
  }

  function startIdleTimer() {
    if (idleTimer) clearInterval(idleTimer);
    idleTimer = setInterval(() => {
      if (activeTheme && activeTheme.onIdle) activeTheme.onIdle();
    }, 4000);
  }

  // ============================================================
  // DISPLAY RENDERING
  // ============================================================
  function render(view) {
    exprEl.textContent = view.expression;
    resultEl.textContent = view.display;
    resultEl.classList.remove('error');
  }

  function renderError(msg) {
    resultEl.textContent = msg;
    resultEl.classList.add('error');
    dispCont.classList.add('flash');
    setTimeout(() => dispCont.classList.remove('flash'), 300);
    audio.error();
    animateShake(resultEl);
    if (activeTheme) activeTheme.onError(msg);
  }

  function animatePop() {
    resultEl.classList.remove('pop');
    void resultEl.offsetWidth;
    resultEl.classList.add('pop');
  }

  function animateShake(el) {
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
  }

  // ============================================================
  // EASTER EGGS (from shared module)
  // ============================================================
  function triggerEasterEggs(resultStr, exprLength) {
    const effects = EasterEggs.check(resultStr, exprLength);
    for (const effect of effects) {
      switch (effect.action) {
        case 'rainbow':
          if (effect.title) resultEl.title = effect.title;
          setTimeout(() => resultEl.classList.add('rainbow'), 200);
          setTimeout(() => resultEl.classList.remove('rainbow'), 3000);
          break;
        case 'confetti': particles.confetti(effect.count || 40); break;
        case 'rain': particles.rain(); break;
        case 'toast':
          setTimeout(() => {
            const el = document.createElement('div');
            el.textContent = effect.message;
            el.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
              font-family:'Press Start 2P';font-size:48px;color:#00ff88;
              text-shadow:0 0 30px #00ff88;z-index:200;pointer-events:none;
              animation:fadeUp 1.5s ease forwards;`;
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 1500);
          }, 200);
          break;
        case 'float-away':
          resultEl.style.transition = 'transform 1s ease, opacity 1s ease';
          resultEl.style.transform = 'translateY(-40px)';
          resultEl.style.opacity = '0.3';
          setTimeout(() => {
            resultEl.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
            resultEl.style.transform = '';
            resultEl.style.opacity = '1';
          }, 1200);
          break;
      }
    }
  }

  // ============================================================
  // HANDLE RESULTS
  // ============================================================
  function handleResult(outcome) {
    if (outcome.error) {
      renderError(outcome.error);
      animateShake($('calculator'));
      return;
    }
    if (outcome.result == null) return;
    audio.equals();
    render(outcome);
    animatePop();

    // Particle burst at result
    const rect = resultEl.getBoundingClientRect();
    particles.burstAt(rect.left + rect.width / 2, rect.top + rect.height / 2);

    // Theme-specific animation
    if (activeTheme) activeTheme.onEquals(outcome.result, outcome.expression);

    // Shared easter eggs
    triggerEasterEggs(outcome.result, outcome.expression.length);
  }

  // ============================================================
  // FIND BUTTON ELEMENT (for theme animations)
  // ============================================================
  function findBtn(key) {
    return document.querySelector(`.btn[data-key="${key}"]`);
  }

  // ============================================================
  // PUBLIC ACTIONS (onclick + keyboard)
  // ============================================================
  window.inputDigit = (d) => {
    audio.click();
    render(engine.inputDigit(d));
    if (activeTheme) activeTheme.onDigit(d, findBtn(d));
  };
  window.inputDot = () => {
    audio.click();
    render(engine.inputDot());
    if (activeTheme) activeTheme.onDigit('.', findBtn('dot'));
  };
  window.inputOp = (op) => {
    audio.op();
    render(engine.inputOp(op));
    const keyMap = { '+': 'add', '-': 'sub', '*': 'mul', '/': 'div', '^': 'pow' };
    if (activeTheme) activeTheme.onOperator(op, findBtn(keyMap[op]));
  };
  window.inputParen = (p) => { audio.click(); render(engine.inputParen(p)); };
  window.toggleSign = () => { audio.click(); render(engine.toggleSign()); };
  window.inputPercent = () => { audio.click(); render(engine.inputPercent()); };
  window.backspace = () => { audio.click(); render(engine.backspace()); };
  window.clearAll = () => {
    audio.clear();
    render(engine.clear());
    if (activeTheme) activeTheme.onClear();
  };
  window.calcEquals = () => handleResult(engine.evaluate());
  window.sciFn = (name) => { audio.op(); handleResult(engine.scientificFn(name)); };

  window.insertConstant = (name) => {
    audio.click();
    const view = engine.insertConstant(name);
    if (view.error) { renderError(view.error); return; }
    render(view);
  };

  // ---- Equals buttons (addEventListener, not onclick) ----
  $('btn-equals').addEventListener('click', window.calcEquals);
  $('btn-equals-sci').addEventListener('click', window.calcEquals);

  // ---- Back button ----
  $('back-btn').addEventListener('click', goBack);

  // ---- Mode switching ----
  window.switchMode = (mode) => {
    audio.click();
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    $('keypad-normal').classList.toggle('hidden', mode !== 'normal');
    $('keypad-scientific').classList.toggle('hidden', mode !== 'scientific');
    $('history-panel').classList.toggle('hidden', mode !== 'history');
    modeEl.textContent = { normal: 'NORMAL', scientific: 'SCIENTIFIC', history: 'HISTORY' }[mode];
    if (mode === 'history') renderHistory();
  };

  // ---- History ----
  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function renderHistory() {
    const list = $('history-list');
    const entries = engine.getHistory();
    if (entries.length === 0) {
      list.innerHTML = '<div class="history-empty">No calculations yet. Go crunch some numbers!</div>';
      return;
    }
    list.innerHTML = [...entries].reverse().map(e => `
      <div class="history-entry" onclick="useHistoryResult('${e.result.replace(/'/g, "\\'")}')">
        <div class="expr">${escapeHtml(e.expression)}</div>
        <div class="res">${escapeHtml(e.result)}</div>
      </div>
    `).join('');
  }

  window.useHistoryResult = (val) => {
    audio.click();
    engine.display = val;
    engine.newInput = false;
    engine.justEvaluated = false;
    engine.expression = '';
    render(engine._view());
    switchMode('normal');
  };

  window.clearHistory = () => {
    audio.clear();
    engine.clearHistory();
    renderHistory();
  };

  // ---- Keyboard ----
  document.addEventListener('keydown', (e) => {
    // Only handle keys when calc is visible
    if (calcScreen.classList.contains('hidden')) return;
    if (e.key >= '0' && e.key <= '9') inputDigit(e.key);
    else if (e.key === '.') inputDot();
    else if (e.key === '+') inputOp('+');
    else if (e.key === '-') inputOp('-');
    else if (e.key === '*') inputOp('*');
    else if (e.key === '/') { e.preventDefault(); inputOp('/'); }
    else if (e.key === '^') inputOp('^');
    else if (e.key === '%') inputPercent();
    else if (e.key === '(' || e.key === ')') inputParen(e.key);
    else if (e.key === 'Enter' || e.key === '=') calcEquals();
    else if (e.key === 'Escape') {
      if (!menuScreen.classList.contains('hidden')) return;
      goBack();
    }
    else if (e.key === 'Backspace') backspace();
  });

  // ---- Inject fadeUp animation ----
  const style = document.createElement('style');
  style.textContent = '@keyframes fadeUp{0%{opacity:1;transform:translate(-50%,-50%)}100%{opacity:0;transform:translate(-50%,-120%)}}';
  document.head.appendChild(style);

  // ---- Build menu and start ----
  buildMenu();

})();
