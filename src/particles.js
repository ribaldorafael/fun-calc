/**
 * ParticleSystem — canvas-based particle effects.
 * Observer pattern: UI triggers events, particle system reacts.
 */
class ParticleSystem {
  constructor(canvas) {
    this._canvas = canvas;
    this._ctx = canvas.getContext('2d');
    this._particles = [];
    this._running = false;
    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  _resize() {
    this._canvas.width = window.innerWidth;
    this._canvas.height = window.innerHeight;
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._loop();
  }

  _loop() {
    if (!this._running) return;
    const ctx = this._ctx;
    ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    this._particles = this._particles.filter(p => p.life > 0);
    for (const p of this._particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.gravity) p.vy += 0.05;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      if (p.shape === 'rect') {
        ctx.fillRect(p.x, p.y, p.w, p.h);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(() => this._loop());
  }

  burstAt(cx, cy, count = 8) {
    for (let i = 0; i < count; i++) {
      this._particles.push({
        x: cx, y: cy,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 1, decay: 0.02 + Math.random() * 0.02,
        size: 2 + Math.random() * 3,
        color: `hsl(${150 + Math.random() * 40}, 100%, 60%)`,
        shape: 'circle',
      });
    }
  }

  confetti(count = 40) {
    for (let i = 0; i < count; i++) {
      this._particles.push({
        x: Math.random() * this._canvas.width, y: -10,
        vx: (Math.random() - 0.5) * 4,
        vy: 2 + Math.random() * 4,
        life: 1, decay: 0.005 + Math.random() * 0.005,
        color: `hsl(${Math.random() * 360}, 90%, 60%)`,
        shape: 'rect', w: 4 + Math.random() * 4, h: 3 + Math.random() * 2,
        gravity: true,
      });
    }
  }

  rain(count = 20) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        this._particles.push({
          x: Math.random() * this._canvas.width, y: -5,
          vx: -0.5, vy: 4 + Math.random() * 3,
          life: 1, decay: 0.008,
          color: '#4488ff',
          shape: 'rect', w: 1.5, h: 8,
        });
      }, i * 50);
    }
  }
}
