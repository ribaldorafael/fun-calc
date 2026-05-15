/**
 * AudioManager — encapsulates Web Audio API for retro sound effects.
 * Lazy-initializes AudioContext on first interaction (browser autoplay policy).
 */
class AudioManager {
  constructor() {
    this._ctx = null;
  }

  _getCtx() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this._ctx;
  }

  _tone(freq, duration = 0.06, type = 'square', volume = 0.08) {
    try {
      const ctx = this._getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = volume;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (_) { /* audio not available */ }
  }

  click()  { this._tone(800, 0.04); }
  op()     { this._tone(600, 0.06, 'triangle'); }
  equals() { this._tone(1200, 0.1, 'sine', 0.1); setTimeout(() => this._tone(1600, 0.1, 'sine', 0.08), 100); }
  error()  { this._tone(200, 0.2, 'sawtooth', 0.1); }
  clear()  { this._tone(400, 0.05); setTimeout(() => this._tone(300, 0.05), 60); }
}
