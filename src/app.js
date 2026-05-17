/**
 * App — menu and theme lifecycle management.
 * Each theme is a full PixiJS application. This module handles
 * the menu, theme selection, and keyboard forwarding.
 */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const menuScreen  = $('menu');
  const calcScreen  = $('calc-screen');
  const canvasCont  = $('canvas-container');

  const engine = new CalculatorEngine();
  let activeTheme = null;

  // ---- Theme registry ----
  const themes = [
    {
      id: 'matrix',
      name: 'Matrix',
      icon: '\u{1F7E2}',
      description: 'Rain of digits. Catch numbers from falling columns.',
      color: '#00ff41',
      ThemeClass: MatrixTheme,
    },
    {
      id: 'odonto',
      name: 'Odontology',
      icon: '\u{1F9B7}',
      description: 'An open mouth. Teeth are buttons. Drill to calculate.',
      color: '#44ddff',
      ThemeClass: OdontoTheme,
    },
    {
      id: 'dragon',
      name: 'Dragon',
      icon: '\u{1F409}',
      description: 'Gold coins, rune stones, and a cauldron. Brew your math.',
      color: '#ff8800',
      ThemeClass: DragonTheme,
    },
  ];

  // ---- Build menu ----
  function buildMenu() {
    const grid = $('menu-grid');
    grid.innerHTML = '';
    themes.forEach((t) => {
      const card = document.createElement('div');
      card.className = 'menu-card';
      card.style.setProperty('--card-color', t.color);
      card.innerHTML = `
        <span class="menu-card-icon">${t.icon}</span>
        <div class="menu-card-name">${t.name}</div>
        <div class="menu-card-desc">${t.description}</div>
      `;
      card.addEventListener('click', () => selectTheme(t));
      grid.appendChild(card);
    });
  }

  // ---- Theme lifecycle ----
  function selectTheme(t) {
    if (activeTheme) { activeTheme.destroy(); activeTheme = null; }
    canvasCont.innerHTML = '';

    engine.clear();
    activeTheme = new t.ThemeClass(engine);
    activeTheme.create(canvasCont);

    menuScreen.classList.add('hidden');
    calcScreen.classList.remove('hidden');
    calcScreen.style.animation = 'none';
    void calcScreen.offsetWidth;
    calcScreen.style.animation = 'calc-enter 0.5s cubic-bezier(0.34,1.56,0.64,1)';
  }

  function goBack() {
    if (activeTheme) { activeTheme.destroy(); activeTheme = null; }
    canvasCont.innerHTML = '';
    calcScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
    menuScreen.style.animation = 'none';
    void menuScreen.offsetWidth;
    menuScreen.style.animation = 'menu-fade-in 0.4s ease';
  }

  $('back-btn').addEventListener('click', goBack);

  // ---- Keyboard support ----
  document.addEventListener('keydown', (e) => {
    if (!activeTheme) return;
    if (e.key >= '0' && e.key <= '9') activeTheme.digit(e.key);
    else if (e.key === '.') activeTheme.dot();
    else if (e.key === '+') activeTheme.op('+');
    else if (e.key === '-') activeTheme.op('-');
    else if (e.key === '*') activeTheme.op('*');
    else if (e.key === '/') { e.preventDefault(); activeTheme.op('/'); }
    else if (e.key === '%') activeTheme.percent();
    else if (e.key === 'Enter' || e.key === '=') activeTheme.equals();
    else if (e.key === 'Escape') goBack();
    else if (e.key === 'Backspace') activeTheme.backspace();
  });

  // ---- Start ----
  buildMenu();
})();
