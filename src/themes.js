/**
 * Theme system — Strategy pattern.
 * Each theme implements the same interface but with wildly different behavior.
 *
 * Interface:
 *   activate(els)        — set up theme (els = DOM references)
 *   deactivate()         — tear down
 *   onDigit(digit, btn)  — digit pressed
 *   onOperator(op, btn)  — operator pressed
 *   onEquals(result, expr) — result computed
 *   onError(msg)         — error occurred
 *   onClear()            — AC pressed
 *   onIdle()             — called every few seconds
 *   getOverlayHTML()     — extra DOM to inject
 */

// ============================================================
// THEME REGISTRY
// ============================================================
const ThemeRegistry = {
  _themes: {},
  register(id, theme) { this._themes[id] = theme; },
  get(id) { return this._themes[id]; },
  all() { return Object.entries(this._themes); },
};

// Helper: inject a <style> tag and return its reference for cleanup
function injectCSS(id, css) {
  let el = document.getElementById('theme-css-' + id);
  if (el) el.remove();
  el = document.createElement('style');
  el.id = 'theme-css-' + id;
  el.textContent = css;
  document.head.appendChild(el);
  return el;
}

function removeCSS(id) {
  const el = document.getElementById('theme-css-' + id);
  if (el) el.remove();
}

// Helper: create a floating text animation
function floatingText(text, x, y, color = '#fff', size = '24px', duration = 1200) {
  const el = document.createElement('div');
  el.textContent = text;
  el.style.cssText = `
    position:fixed; left:${x}px; top:${y}px; color:${color};
    font-family:'Press Start 2P',monospace; font-size:${size};
    pointer-events:none; z-index:999; text-shadow:0 0 10px ${color};
    transition: transform ${duration}ms ease, opacity ${duration}ms ease;
  `;
  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.style.transform = `translateY(-60px) scale(1.3)`;
    el.style.opacity = '0';
  });
  setTimeout(() => el.remove(), duration);
}

// ============================================================
// 1. RETRO ARCADE
// ============================================================
ThemeRegistry.register('retro', {
  name: 'Retro Arcade',
  icon: '👾',
  description: 'CRT scanlines, pixel fonts, 8-bit sounds',
  color: '#00ff88',
  _style: null,

  activate(els) {
    document.body.classList.add('theme-retro');
    this._style = injectCSS('retro', `
      .theme-retro .calculator {
        border-color: #333355;
        box-shadow: 0 0 40px rgba(0,255,136,0.1), inset 0 0 60px rgba(0,0,0,0.3);
      }
      .theme-retro .scanlines-overlay {
        position: fixed; top:0; left:0; right:0; bottom:0;
        background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px);
        pointer-events: none; z-index: 101;
      }
      .theme-retro::before {
        content:''; position:fixed; top:0;left:0;right:0;bottom:0;
        background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%);
        pointer-events:none; z-index:100;
      }
    `);
    els.overlay.innerHTML = '<div class="scanlines-overlay"></div>';
  },
  deactivate() { document.body.classList.remove('theme-retro'); removeCSS('retro'); },
  onDigit() {},
  onOperator() {},
  onEquals(result) {
    if (Math.abs(parseFloat(result)) >= 1000000) {
      if (window._particles) window._particles.confetti(30);
    }
  },
  onError() {},
  onClear() {},
  onIdle() {},
  getOverlayHTML() { return ''; },
});

// ============================================================
// 2. DESTRUCTION
// ============================================================
ThemeRegistry.register('destruction', {
  name: 'Destruction',
  icon: '💥',
  description: 'Buttons shatter when used. AC rebuilds.',
  color: '#ff4444',
  _usedBtns: new Set(),

  activate(els) {
    this._usedBtns.clear();
    document.body.classList.add('theme-destruction');
    injectCSS('destruction', `
      .theme-destruction { background: #1a0a0a; }
      .theme-destruction .calculator {
        background: #2a1515; border-color: #553333;
        box-shadow: 0 0 40px rgba(255,68,68,0.15);
      }
      .theme-destruction .display-container {
        background: #1a0808; border-color: #553333;
      }
      .theme-destruction .display-result { color: #ff6644; text-shadow: 0 0 20px rgba(255,100,68,0.6); }
      .theme-destruction .display-expression { color: #aa4433; }
      .theme-destruction .btn.num { background: #3a2020; }
      .theme-destruction .btn.num:hover { background: #4a2a2a; }
      .theme-destruction .btn.op { background: #cc3300; }
      .theme-destruction .btn.fn { background: #443333; }
      .theme-destruction .btn.equals { background: #ff4400; }
      .theme-destruction .mode-btn.active { background: #ff4400; }
      .theme-destruction .btn.destroyed {
        animation: shatter 0.6s ease forwards;
        pointer-events: none;
      }
      .theme-destruction .btn.rebuild {
        animation: rebuild 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards;
      }
      @keyframes shatter {
        0% { transform: scale(1); opacity:1; filter: brightness(1); }
        30% { transform: scale(1.2) rotate(5deg); filter: brightness(3); }
        100% { transform: scale(0) rotate(180deg); opacity:0; filter: brightness(0); }
      }
      @keyframes rebuild {
        0% { transform: scale(0) rotate(-180deg); opacity:0; }
        60% { transform: scale(1.1) rotate(5deg); opacity:1; }
        100% { transform: scale(1) rotate(0); opacity:1; }
      }
      @keyframes crack-glow { 0%,100%{box-shadow:none;} 50%{box-shadow: 0 0 15px #ff4400, inset 0 0 10px rgba(255,68,0,0.3);} }
    `);
  },
  deactivate() { document.body.classList.remove('theme-destruction'); removeCSS('destruction'); this._usedBtns.clear(); },

  onDigit(d, btn) {
    if (btn) this._usedBtns.add(btn);
    if (btn) { btn.style.animation = 'crack-glow 0.3s ease'; setTimeout(() => btn.style.animation = '', 300); }
  },
  onOperator(op, btn) {
    if (btn) this._usedBtns.add(btn);
    if (btn) { btn.style.animation = 'crack-glow 0.3s ease'; setTimeout(() => btn.style.animation = '', 300); }
  },
  onEquals(result) {
    // Shatter all used buttons
    this._usedBtns.forEach(btn => {
      btn.classList.add('destroyed');
      // Spawn debris particles
      const r = btn.getBoundingClientRect();
      if (window._particles) {
        for (let i = 0; i < 6; i++) {
          window._particles._particles.push({
            x: r.left + r.width/2, y: r.top + r.height/2,
            vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10 - 3,
            life: 1, decay: 0.015, size: 3+Math.random()*4,
            color: `hsl(${Math.random()*30}, 100%, ${50+Math.random()*30}%)`,
            shape: 'rect', w: 4+Math.random()*6, h: 3+Math.random()*4, gravity: true,
          });
        }
      }
    });
    // Screen shake
    const calc = document.getElementById('calculator');
    calc.style.animation = 'none'; void calc.offsetWidth;
    calc.style.animation = 'shake 0.4s ease';
    setTimeout(() => calc.style.animation = '', 400);
  },
  onError() {},
  onClear() {
    // Rebuild all destroyed buttons
    document.querySelectorAll('.btn.destroyed').forEach((btn, i) => {
      setTimeout(() => {
        btn.classList.remove('destroyed');
        btn.classList.add('rebuild');
        setTimeout(() => btn.classList.remove('rebuild'), 500);
      }, i * 80);
    });
    this._usedBtns.clear();
  },
  onIdle() {},
  getOverlayHTML() { return ''; },
});

// ============================================================
// 3. LIVING CREATURE
// ============================================================
ThemeRegistry.register('living', {
  name: 'Living Creature',
  icon: '🐸',
  description: 'Your calculator is alive. Feed it math!',
  color: '#88ff44',
  _blinkTimer: null,
  _mood: 'idle', // idle, chewing, happy, sick, excited

  activate(els) {
    document.body.classList.add('theme-living');
    injectCSS('living', `
      .theme-living { background: #0a1a0a; }
      .theme-living .calculator {
        background: #1a3a1a; border-color: #336633; border-radius: 30px;
        box-shadow: 0 0 40px rgba(100,255,100,0.1);
        transition: transform 0.3s ease;
      }
      .theme-living .display-container {
        background: #0f2a0f; border-color: #336633; border-radius: 20px;
        position: relative; overflow: visible;
      }
      .theme-living .display-result { color: #88ff44; text-shadow: 0 0 15px rgba(136,255,68,0.5); }
      .theme-living .display-expression { color: #559933; }
      .theme-living .btn.num { background: #2a4a2a; }
      .theme-living .btn.num:hover { background: #3a5a3a; }
      .theme-living .btn.op { background: #44aa22; }
      .theme-living .btn.fn { background: #334433; }
      .theme-living .btn.equals { background: #66cc22; }
      .theme-living .mode-btn.active { background: #66cc22; }
      .creature-eyes { position:absolute; top:-25px; left:50%; transform:translateX(-50%); display:flex; gap:60px; z-index:10; }
      .creature-eye {
        width:30px; height:30px; background:#fff; border-radius:50%;
        display:flex; align-items:center; justify-content:center;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        transition: transform 0.2s ease;
      }
      .creature-pupil {
        width:14px; height:14px; background:#111; border-radius:50%;
        transition: transform 0.15s ease;
      }
      .creature-eye.blink { transform: scaleY(0.1); }
      .creature-mouth {
        position:absolute; bottom:-15px; left:50%; transform:translateX(-50%);
        width:40px; height:10px; background:#2a5a2a; border-radius:0 0 20px 20px;
        border: 2px solid #336633; border-top:none;
        transition: all 0.3s ease; z-index:10;
      }
      .creature-mouth.chewing {
        animation: chew 0.3s ease infinite;
      }
      .creature-mouth.happy { height:20px; width:50px; border-radius:0 0 25px 25px; }
      .creature-mouth.sick { background:#aa4422; border-color:#884422; }
      @keyframes chew { 0%,100%{height:10px;} 50%{height:18px;width:35px;} }
      .theme-living .calculator.bounce { animation: creature-bounce 0.5s ease; }
      @keyframes creature-bounce {
        0%,100%{transform:translateY(0);} 25%{transform:translateY(-15px);} 75%{transform:translateY(5px);}
      }
      .theme-living .calculator.wiggle { animation: creature-wiggle 0.4s ease; }
      @keyframes creature-wiggle {
        0%,100%{transform:rotate(0);} 25%{transform:rotate(-3deg);} 75%{transform:rotate(3deg);}
      }
    `);
    this._startBlinking();
  },
  deactivate() {
    document.body.classList.remove('theme-living');
    removeCSS('living');
    if (this._blinkTimer) clearInterval(this._blinkTimer);
  },
  _startBlinking() {
    this._blinkTimer = setInterval(() => {
      document.querySelectorAll('.creature-eye').forEach(eye => {
        eye.classList.add('blink');
        setTimeout(() => eye.classList.remove('blink'), 150);
      });
    }, 3000 + Math.random() * 2000);
  },
  _movePupils(x, y) {
    document.querySelectorAll('.creature-pupil').forEach(p => {
      const eye = p.parentElement;
      const r = eye.getBoundingClientRect();
      const cx = r.left + r.width/2, cy = r.top + r.height/2;
      const dx = Math.min(5, Math.max(-5, (x - cx) * 0.03));
      const dy = Math.min(5, Math.max(-5, (y - cy) * 0.03));
      p.style.transform = `translate(${dx}px, ${dy}px)`;
    });
  },
  _setMouth(cls) {
    const m = document.querySelector('.creature-mouth');
    if (!m) return;
    m.className = 'creature-mouth ' + cls;
  },

  onDigit(d, btn) {
    if (btn) {
      const r = btn.getBoundingClientRect();
      this._movePupils(r.left + r.width/2, r.top + r.height/2);
    }
    this._setMouth('chewing');
    setTimeout(() => this._setMouth(''), 400);
  },
  onOperator(op, btn) {
    if (btn) {
      const r = btn.getBoundingClientRect();
      this._movePupils(r.left + r.width/2, r.top + r.height/2);
    }
    const calc = document.getElementById('calculator');
    calc.classList.add('wiggle');
    setTimeout(() => calc.classList.remove('wiggle'), 400);
  },
  onEquals(result) {
    this._setMouth('chewing');
    setTimeout(() => {
      this._setMouth('happy');
      const calc = document.getElementById('calculator');
      calc.classList.add('bounce');
      setTimeout(() => { calc.classList.remove('bounce'); this._setMouth(''); }, 1000);
    }, 600);
  },
  onError() {
    this._setMouth('sick');
    const calc = document.getElementById('calculator');
    calc.style.filter = 'hue-rotate(90deg)';
    setTimeout(() => { this._setMouth(''); calc.style.filter = ''; }, 2000);
  },
  onClear() { this._setMouth(''); },
  onIdle() {
    // Occasionally look around
    this._movePupils(
      window.innerWidth * Math.random(),
      window.innerHeight * Math.random()
    );
  },
  getOverlayHTML() {
    return `
      <div class="creature-eyes">
        <div class="creature-eye"><div class="creature-pupil"></div></div>
        <div class="creature-eye"><div class="creature-pupil"></div></div>
      </div>
      <div class="creature-mouth"></div>
    `;
  },
});

// ============================================================
// 4. RUBE GOLDBERG
// ============================================================
ThemeRegistry.register('rube', {
  name: 'Rube Goldberg',
  icon: '⚙️',
  description: 'Watch your math go through a machine!',
  color: '#ffaa00',
  _animating: false,

  activate(els) {
    document.body.classList.add('theme-rube');
    injectCSS('rube', `
      .theme-rube { background: #1a1500; }
      .theme-rube .calculator {
        background: #2a2010; border-color: #554422;
        box-shadow: 0 0 40px rgba(255,170,0,0.1);
      }
      .theme-rube .display-container { background: #1a1508; border-color: #554422; }
      .theme-rube .display-result { color: #ffcc44; text-shadow: 0 0 15px rgba(255,200,68,0.5); }
      .theme-rube .display-expression { color: #aa8833; }
      .theme-rube .btn.num { background: #3a3020; }
      .theme-rube .btn.num:hover { background: #4a3a28; }
      .theme-rube .btn.op { background: #cc8800; }
      .theme-rube .btn.fn { background: #443a22; }
      .theme-rube .btn.equals { background: #ffaa00; color:#1a1500; }
      .theme-rube .mode-btn.active { background: #ffaa00; color:#1a1500; }
      .rube-machine {
        position:fixed; top:0; left:0; right:0; bottom:0;
        pointer-events:none; z-index:200; display:none;
      }
      .rube-machine.active { display:block; }
      .rube-ball {
        position:absolute; width:30px; height:30px; border-radius:50%;
        display:flex; align-items:center; justify-content:center;
        font-family:'Press Start 2P'; font-size:10px; color:#fff;
        text-shadow:0 0 5px rgba(0,0,0,0.5);
      }
      .rube-gear {
        position:absolute; font-size:40px; animation: spin 2s linear infinite;
        pointer-events:none;
      }
      @keyframes spin { 0%{transform:rotate(0)} 100%{transform:rotate(360deg)} }
    `);
  },
  deactivate() { document.body.classList.remove('theme-rube'); removeCSS('rube'); },
  onDigit() {},
  onOperator() {},
  onEquals(result, expr) {
    if (this._animating) return;
    this._animating = true;
    const machine = document.getElementById('theme-overlay');
    const origContent = machine.innerHTML;

    // Parse the expression for display
    const parts = expr.replace(' =', '').split(/\s+/);

    const colors = ['#ff6644', '#44aaff', '#44ff88', '#ffaa00', '#ff44aa'];
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    // Create gear elements
    let html = '';
    const gearPositions = [
      [cx - 100, cy - 80], [cx + 60, cy - 40], [cx - 40, cy + 20]
    ];
    gearPositions.forEach(([gx, gy]) => {
      html += `<div class="rube-gear" style="left:${gx}px;top:${gy}px;">⚙️</div>`;
    });
    machine.innerHTML = html;
    machine.classList.add('rube-machine', 'active');

    // Animate balls for each part
    parts.forEach((part, i) => {
      setTimeout(() => {
        const ball = document.createElement('div');
        ball.className = 'rube-ball';
        ball.textContent = part;
        ball.style.background = colors[i % colors.length];
        ball.style.left = (cx - 150 + Math.random() * 40) + 'px';
        ball.style.top = '0px';
        ball.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        machine.appendChild(ball);

        // Fall to gear area
        requestAnimationFrame(() => {
          ball.style.top = (cy - 60 + i * 30) + 'px';
          ball.style.left = (cx - 50 + i * 40) + 'px';
        });

        // After landing, bounce toward center
        setTimeout(() => {
          ball.style.transition = 'all 0.4s ease';
          ball.style.top = cy + 'px';
          ball.style.left = cx + 'px';
          ball.style.transform = 'scale(0.5)';
          ball.style.opacity = '0.5';
        }, 500);
      }, i * 300);
    });

    // Final result explosion
    const totalTime = parts.length * 300 + 1000;
    setTimeout(() => {
      // Flash and show result
      const resultBall = document.createElement('div');
      resultBall.className = 'rube-ball';
      resultBall.textContent = result;
      resultBall.style.background = '#ffcc00';
      resultBall.style.left = (cx - 15) + 'px';
      resultBall.style.top = (cy - 15) + 'px';
      resultBall.style.width = '50px';
      resultBall.style.height = '50px';
      resultBall.style.fontSize = '14px';
      resultBall.style.transition = 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)';
      resultBall.style.boxShadow = '0 0 30px #ffaa00';
      machine.appendChild(resultBall);

      requestAnimationFrame(() => {
        resultBall.style.transform = 'scale(2)';
      });

      if (window._particles) window._particles.confetti(20);

      setTimeout(() => {
        machine.classList.remove('active');
        machine.innerHTML = origContent;
        this._animating = false;
      }, 1000);
    }, totalTime);
  },
  onError() { this._animating = false; },
  onClear() {},
  onIdle() {},
  getOverlayHTML() { return ''; },
});

// ============================================================
// 5. GRAVITY
// ============================================================
ThemeRegistry.register('gravity', {
  name: 'Gravity',
  icon: '🌍',
  description: 'Numbers obey physics. Math has weight.',
  color: '#6688ff',

  activate(els) {
    document.body.classList.add('theme-gravity');
    injectCSS('gravity', `
      .theme-gravity { background: #08081a; }
      .theme-gravity .calculator {
        background: #151530; border-color: #333366;
        box-shadow: 0 0 40px rgba(100,130,255,0.1);
      }
      .theme-gravity .display-container { background: #0a0a20; border-color: #333366; }
      .theme-gravity .display-result {
        color: #88aaff; text-shadow: 0 0 15px rgba(130,170,255,0.5);
        transition: transform 0.5s cubic-bezier(0.34,1.56,0.64,1);
      }
      .theme-gravity .display-expression { color: #5566aa; }
      .theme-gravity .btn.num { background: #252550; }
      .theme-gravity .btn.num:hover { background: #353570; }
      .theme-gravity .btn.op { background: #4455cc; }
      .theme-gravity .btn.fn { background: #333355; }
      .theme-gravity .btn.equals { background: #5577ff; }
      .theme-gravity .mode-btn.active { background: #5577ff; }
      .gravity-digit {
        position: fixed; pointer-events:none; z-index:200;
        font-family:'Press Start 2P'; font-size:24px; color:#88aaff;
        text-shadow: 0 0 10px rgba(130,170,255,0.8);
      }
      @keyframes gravity-fall {
        0% { transform: translateY(0) rotate(0); opacity:1; }
        70% { opacity:1; }
        100% { transform: translateY(120px) rotate(25deg); opacity:0; }
      }
      @keyframes gravity-collide {
        0% { transform: scale(1); }
        50% { transform: scale(1.8); filter: brightness(2); }
        100% { transform: scale(1); filter: brightness(1); }
      }
      .gravity-collide { animation: gravity-collide 0.5s ease; }
    `);
  },
  deactivate() { document.body.classList.remove('theme-gravity'); removeCSS('gravity'); },

  _dropDigit(char, btn) {
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const el = document.createElement('div');
    el.className = 'gravity-digit';
    el.textContent = char;
    el.style.left = (r.left + r.width/2 - 10) + 'px';
    el.style.top = (r.top) + 'px';
    el.style.animation = 'gravity-fall 0.8s cubic-bezier(0.55,0.06,0.68,0.19) forwards';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 800);
  },

  onDigit(d, btn) { this._dropDigit(d, btn); },
  onOperator(op, btn) {
    this._dropDigit(op === '*' ? '×' : op === '/' ? '÷' : op, btn);
  },
  onEquals(result) {
    const disp = document.getElementById('result');
    disp.classList.add('gravity-collide');
    setTimeout(() => disp.classList.remove('gravity-collide'), 500);

    // Shockwave particles
    if (window._particles) {
      const r = disp.getBoundingClientRect();
      const cx = r.left + r.width/2, cy = r.top + r.height/2;
      for (let i = 0; i < 15; i++) {
        const angle = (i / 15) * Math.PI * 2;
        window._particles._particles.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * 5, vy: Math.sin(angle) * 5,
          life: 1, decay: 0.025, size: 3,
          color: `hsl(${220 + Math.random()*40}, 80%, 70%)`,
          shape: 'circle',
        });
      }
    }
  },
  onError() {},
  onClear() {},
  onIdle() {},
  getOverlayHTML() { return ''; },
});

// ============================================================
// 6. RPG BATTLE
// ============================================================
ThemeRegistry.register('rpg', {
  name: 'RPG Battle',
  icon: '⚔️',
  description: 'Every calculation is a battle!',
  color: '#ff44ff',
  _xp: 0,
  _level: 1,

  activate(els) {
    this._xp = 0; this._level = 1;
    document.body.classList.add('theme-rpg');
    injectCSS('rpg', `
      .theme-rpg { background: #1a0a1a; }
      .theme-rpg .calculator {
        background: #2a1530; border-color: #553355;
        box-shadow: 0 0 40px rgba(255,68,255,0.1);
      }
      .theme-rpg .display-container {
        background: #150a18; border-color: #553355;
        position: relative;
      }
      .theme-rpg .display-result { color: #ff88ff; text-shadow: 0 0 15px rgba(255,130,255,0.5); }
      .theme-rpg .display-expression { color: #aa55aa; }
      .theme-rpg .btn.num { background: #352040; }
      .theme-rpg .btn.num:hover { background: #452a50; }
      .theme-rpg .btn.op { background: #aa22aa; }
      .theme-rpg .btn.fn { background: #3a2840; }
      .theme-rpg .btn.equals { background: #cc44cc; }
      .theme-rpg .mode-btn.active { background: #cc44cc; }
      .rpg-hud {
        position:absolute; top:5px; right:8px;
        font-family:'Press Start 2P'; font-size:7px; color:#aa88aa;
        text-align:right; line-height:1.6;
      }
      .rpg-xp-bar {
        width:60px; height:4px; background:#2a1530; border-radius:2px;
        margin-top:2px; overflow:hidden;
      }
      .rpg-xp-fill { height:100%; background: linear-gradient(90deg,#ff44ff,#ffaa44); width:0%; transition: width 0.5s ease; }
      @keyframes rpg-slash {
        0% { transform: scaleX(0) rotate(-30deg); opacity:1; }
        50% { transform: scaleX(1) rotate(-30deg); opacity:1; }
        100% { transform: scaleX(1.5) rotate(-30deg); opacity:0; }
      }
      .rpg-slash {
        position:fixed; pointer-events:none; z-index:200;
        width:200px; height:4px;
        background: linear-gradient(90deg, transparent, #ff88ff, #fff, #ff88ff, transparent);
        border-radius:2px;
        animation: rpg-slash 0.4s ease forwards;
      }
      @keyframes rpg-hit { 0%,100%{filter:none;} 50%{filter:brightness(3) saturate(2);} }
      .rpg-hit { animation: rpg-hit 0.3s ease; }
    `);
  },
  deactivate() { document.body.classList.remove('theme-rpg'); removeCSS('rpg'); },

  _addXP(amount) {
    this._xp += amount;
    const needed = this._level * 100;
    if (this._xp >= needed) {
      this._xp -= needed;
      this._level++;
      floatingText(`LEVEL ${this._level}!`, window.innerWidth/2 - 60, window.innerHeight/2, '#ffaa44', '20px', 2000);
      if (window._particles) window._particles.confetti(40);
    }
    const fill = document.querySelector('.rpg-xp-fill');
    if (fill) fill.style.width = (this._xp / (this._level * 100) * 100) + '%';
    const lvlEl = document.querySelector('.rpg-level');
    if (lvlEl) lvlEl.textContent = `LV ${this._level}`;
  },

  _slash(x, y) {
    const el = document.createElement('div');
    el.className = 'rpg-slash';
    el.style.left = (x - 100) + 'px';
    el.style.top = y + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 400);
  },

  onDigit() {},
  onOperator(op, btn) {
    if (btn) {
      const r = btn.getBoundingClientRect();
      this._slash(r.left + r.width/2, r.top + r.height/2);
    }
    const attacks = { '+': 'RECRUIT', '-': 'STRIKE', '*': 'POWER UP', '/': 'CRITICAL' };
    const name = attacks[op] || 'ATTACK';
    if (btn) {
      const r = btn.getBoundingClientRect();
      floatingText(name, r.left, r.top - 20, '#ffaa44', '10px', 800);
    }
  },
  onEquals(result) {
    const num = Math.abs(parseFloat(result));
    const disp = document.getElementById('result');
    disp.classList.add('rpg-hit');
    setTimeout(() => disp.classList.remove('rpg-hit'), 300);

    // XP based on result magnitude
    const xp = Math.min(50, Math.max(5, Math.floor(Math.log10(num + 1) * 15)));
    this._addXP(xp);

    const r = disp.getBoundingClientRect();
    floatingText(`+${xp} XP`, r.right, r.top, '#88ff88', '10px', 1000);

    if (num === 0) floatingText('DEFEAT!', window.innerWidth/2 - 50, window.innerHeight/2, '#ff4444', '18px', 1500);
    if (num >= 1000) {
      this._slash(window.innerWidth/2, window.innerHeight/2);
      floatingText('CRITICAL HIT!', window.innerWidth/2 - 80, window.innerHeight/2 - 40, '#ff4444', '14px', 1500);
    }
  },
  onError() {
    floatingText('MISS!', window.innerWidth/2 - 30, window.innerHeight/2, '#888', '20px', 1000);
  },
  onClear() {},
  onIdle() {},
  getOverlayHTML() {
    return `
      <div class="rpg-hud">
        <div class="rpg-level">LV 1</div>
        <div class="rpg-xp-bar"><div class="rpg-xp-fill"></div></div>
      </div>
    `;
  },
});

// ============================================================
// 7. ODONTOLOGY
// ============================================================
ThemeRegistry.register('odonto', {
  name: 'Odontology',
  icon: '🦷',
  description: 'A dental calculator. Open wide!',
  color: '#44ddff',

  activate(els) {
    document.body.classList.add('theme-odonto');
    injectCSS('odonto', `
      .theme-odonto { background: #f0f8ff; }
      .theme-odonto .calculator {
        background: #ffffff; border: 2px solid #b0d4e8; border-radius: 24px;
        box-shadow: 0 8px 40px rgba(0,150,200,0.12);
      }
      .theme-odonto .display-container {
        background: #e8f4f8; border-color: #b0d4e8; border-radius: 16px;
      }
      .theme-odonto .display-result {
        color: #0088aa; text-shadow: none; font-size: 28px;
      }
      .theme-odonto .display-expression { color: #66aabb; }
      .theme-odonto .mode-indicator { color: #88bbcc; }
      .theme-odonto .btn {
        border-color: #c0dde8; border-radius: 14px;
        font-family: 'VT323', monospace;
      }
      .theme-odonto .btn.num {
        background: #f8fcff; color: #335566;
        box-shadow: 0 2px 8px rgba(0,100,150,0.08);
      }
      .theme-odonto .btn.num:hover { background: #e8f4ff; }
      .theme-odonto .btn.op { background: #44bbdd; color:#fff; }
      .theme-odonto .btn.op:hover { background: #33aacc; }
      .theme-odonto .btn.fn { background: #d8eef5; color: #447788; }
      .theme-odonto .btn.equals { background: #22aacc; color:#fff; }
      .theme-odonto .btn.sci { background: #e0f0f5; color: #336677; }
      .theme-odonto .mode-btn { background: #d8eef5; color:#6699aa; border-color:#b0d4e8; }
      .theme-odonto .mode-btn.active { background: #22aacc; color:#fff; }
      .theme-odonto .controls-bar { gap: 8px; }
      .tooth-icon {
        position:absolute; font-size:20px; pointer-events:none; z-index:10; opacity:0.7;
      }
      @keyframes drill { 0%,100%{transform:rotate(0)} 25%{transform:rotate(3deg)} 75%{transform:rotate(-3deg)} }
      .theme-odonto .btn:active { animation: drill 0.15s ease 2; }
      @keyframes sparkle-tooth {
        0% { transform:scale(0) rotate(0); opacity:1; }
        100% { transform:scale(1.5) rotate(180deg); opacity:0; }
      }
      .tooth-sparkle {
        position:fixed; pointer-events:none; z-index:200;
        font-size:20px;
        animation: sparkle-tooth 0.6s ease forwards;
      }
      .odonto-banner {
        position:absolute; top:4px; right:8px; font-size:16px; z-index:10;
      }
    `);
  },
  deactivate() { document.body.classList.remove('theme-odonto'); removeCSS('odonto'); },

  _sparkle(x, y) {
    const chars = ['✨', '🦷', '💎', '⭐'];
    const el = document.createElement('div');
    el.className = 'tooth-sparkle';
    el.textContent = chars[Math.floor(Math.random() * chars.length)];
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 600);
  },

  onDigit(d, btn) {
    if (btn) {
      const r = btn.getBoundingClientRect();
      // Small vibration for "drilling"
      btn.style.animation = 'drill 0.1s ease 2';
      setTimeout(() => btn.style.animation = '', 200);
    }
  },
  onOperator() {},
  onEquals(result) {
    // Clean smile! Sparkles around the display
    const disp = document.getElementById('display-container');
    const r = disp.getBoundingClientRect();
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        this._sparkle(
          r.left + Math.random() * r.width,
          r.top + Math.random() * r.height
        );
      }, i * 100);
    }
  },
  onError() {
    // Cavity! Red flash
    const disp = document.getElementById('display-container');
    disp.style.background = '#ffe8e8';
    disp.style.borderColor = '#ffaaaa';
    floatingText('CAVITY!', window.innerWidth/2 - 40, window.innerHeight/2, '#cc4444', '16px', 1200);
    setTimeout(() => { disp.style.background = ''; disp.style.borderColor = ''; }, 1500);
  },
  onClear() {},
  onIdle() {},
  getOverlayHTML() {
    return '<div class="odonto-banner">🦷</div>';
  },
});

// ============================================================
// 8. DRAGON
// ============================================================
ThemeRegistry.register('dragon', {
  name: 'Dragon',
  icon: '🐉',
  description: 'Fire-breathing calculations!',
  color: '#ff6600',
  _fireCanvas: null,
  _fireCtx: null,
  _fireParticles: [],
  _fireAnim: null,

  activate(els) {
    document.body.classList.add('theme-dragon');
    injectCSS('dragon', `
      .theme-dragon { background: #1a0800; }
      .theme-dragon .calculator {
        background: linear-gradient(180deg, #2a1508 0%, #1a0a04 100%);
        border: 2px solid #664422;
        box-shadow: 0 0 60px rgba(255,100,0,0.2), inset 0 0 30px rgba(0,0,0,0.5);
      }
      .theme-dragon .display-container {
        background: #120804; border-color: #664422;
        box-shadow: inset 0 0 20px rgba(255,100,0,0.1);
      }
      .theme-dragon .display-result {
        color: #ff8833;
        text-shadow: 0 0 20px rgba(255,130,50,0.8), 0 0 40px rgba(255,80,0,0.4);
      }
      .theme-dragon .display-expression { color: #aa6633; }
      .theme-dragon .btn.num {
        background: linear-gradient(180deg, #3a2010, #2a1508);
        color: #ffcc88;
        border-color: #553311;
      }
      .theme-dragon .btn.num:hover {
        background: linear-gradient(180deg, #4a2a18, #3a1a0a);
        box-shadow: 0 0 10px rgba(255,100,0,0.3);
      }
      .theme-dragon .btn.op {
        background: linear-gradient(180deg, #cc4400, #993300);
        color: #ffddaa;
        text-shadow: 0 0 8px rgba(255,200,100,0.5);
      }
      .theme-dragon .btn.fn { background: #3a2818; color:#cc9966; }
      .theme-dragon .btn.equals {
        background: linear-gradient(180deg, #ff6600, #cc4400);
        color: #fff;
        text-shadow: 0 0 10px rgba(255,255,255,0.5);
      }
      .theme-dragon .btn.sci { background: #2a1a0a; color:#cc8844; }
      .theme-dragon .mode-btn { background:#3a2818; color:#aa7744; border-color:#553311; }
      .theme-dragon .mode-btn.active { background:#ff6600; color:#fff; }
      .dragon-fire-canvas {
        position:fixed; top:0; left:0; right:0; bottom:0;
        pointer-events:none; z-index:200;
      }
      @keyframes ember-float {
        0% { transform:translateY(0) scale(1); opacity:1; }
        100% { transform:translateY(-80px) scale(0); opacity:0; }
      }
      .dragon-ember {
        position:fixed; pointer-events:none; z-index:150;
        width:4px; height:4px; border-radius:50%;
        background: radial-gradient(circle, #ffcc00, #ff6600);
        animation: ember-float 2s ease forwards;
      }
      .dragon-icon {
        position:absolute; top:-5px; right:8px; font-size:22px; z-index:10;
        filter: drop-shadow(0 0 8px rgba(255,100,0,0.5));
      }
      @keyframes fire-breathe {
        0% { transform: scale(1); filter: brightness(1); }
        50% { transform: scale(1.05); filter: brightness(1.5) saturate(1.5); }
        100% { transform: scale(1); filter: brightness(1); }
      }
      .fire-breathe { animation: fire-breathe 0.6s ease; }
      @keyframes dragon-fly {
        0% { left: -60px; top: 50%; transform: scaleX(1); }
        45% { top: 30%; }
        50% { left: calc(100% + 60px); top: 40%; transform: scaleX(1); }
        51% { transform: scaleX(-1); }
        100% { left: -60px; top: 50%; transform: scaleX(-1); }
      }
      .dragon-flyby {
        position:fixed; font-size:40px; z-index:250; pointer-events:none;
        animation: dragon-fly 3s ease forwards;
        filter: drop-shadow(0 0 15px rgba(255,100,0,0.8));
      }
    `);
    this._startEmbers();
  },
  deactivate() {
    document.body.classList.remove('theme-dragon');
    removeCSS('dragon');
    if (this._emberTimer) clearInterval(this._emberTimer);
  },

  _startEmbers() {
    this._emberTimer = setInterval(() => {
      const calc = document.getElementById('calculator');
      if (!calc) return;
      const r = calc.getBoundingClientRect();
      const ember = document.createElement('div');
      ember.className = 'dragon-ember';
      ember.style.left = (r.left + Math.random() * r.width) + 'px';
      ember.style.top = (r.bottom - 10) + 'px';
      document.body.appendChild(ember);
      setTimeout(() => ember.remove(), 2000);
    }, 400);
  },

  _fireBreath() {
    const disp = document.getElementById('display-container');
    const r = disp.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;

    // Burst of fire particles
    if (window._particles) {
      for (let i = 0; i < 25; i++) {
        const angle = (Math.random() - 0.5) * Math.PI;
        const speed = 3 + Math.random() * 5;
        window._particles._particles.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: -Math.abs(Math.sin(angle)) * speed - 2,
          life: 1, decay: 0.02 + Math.random() * 0.02,
          size: 4 + Math.random() * 6,
          color: `hsl(${Math.random() * 40 + 10}, 100%, ${50 + Math.random() * 30}%)`,
          shape: 'circle', gravity: false,
        });
      }
    }
  },

  onDigit(d, btn) {
    if (btn) {
      btn.style.boxShadow = '0 0 15px rgba(255,100,0,0.5)';
      setTimeout(() => btn.style.boxShadow = '', 200);
    }
  },
  onOperator() {},
  onEquals(result) {
    const calc = document.getElementById('calculator');
    calc.classList.add('fire-breathe');
    setTimeout(() => calc.classList.remove('fire-breathe'), 600);
    this._fireBreath();

    // Big results → dragon flyby
    if (Math.abs(parseFloat(result)) >= 10000) {
      const dragon = document.createElement('div');
      dragon.className = 'dragon-flyby';
      dragon.textContent = '🐉';
      document.body.appendChild(dragon);
      setTimeout(() => dragon.remove(), 3000);
    }
  },
  onError() {
    // Dragon roar — screen shakes red
    const calc = document.getElementById('calculator');
    calc.style.boxShadow = '0 0 60px rgba(255,0,0,0.5)';
    calc.style.animation = 'shake 0.5s ease';
    floatingText('🔥 ROAR!', window.innerWidth/2 - 50, window.innerHeight/2, '#ff4400', '20px', 1500);
    setTimeout(() => { calc.style.boxShadow = ''; calc.style.animation = ''; }, 500);
  },
  onClear() {},
  onIdle() {},
  getOverlayHTML() {
    return '<div class="dragon-icon">🐉</div>';
  },
});
