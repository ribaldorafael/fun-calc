/**
 * PixiTheme — base class for canvas-rendered calculator themes.
 *
 * Each theme creates its own PIXI.Application and draws everything
 * from scratch. No shared HTML buttons — every theme has its own
 * interaction model, its own visual language.
 *
 * Subclasses must implement:
 *   _buildScene()                  — create all PIXI display objects
 *   _updateDisplay(expr, display)  — re-render expression and result text
 *   _onResult(result)              — animate a successful calculation
 *   _onError(message)              — animate an error
 *   _onClear()                     — animate clear/reset
 */
class PixiTheme {
  constructor(engine, width = 420, height = 700) {
    this.engine = engine;
    this.W = width;
    this.H = height;
    this.app = null;
    this._audio = new AudioManager();
  }

  create(container) {
    this.app = new PIXI.Application({
      width: this.W,
      height: this.H,
      backgroundColor: 0x000000,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });
    this.app.view.style.borderRadius = '16px';
    container.appendChild(this.app.view);
    this._buildScene();
    this._updateDisplay('', '0');
  }

  destroy() {
    if (this.app) {
      this.app.destroy(true, { children: true, texture: true });
      this.app = null;
    }
  }

  // ---- Engine actions (called by theme UI elements) ----

  digit(d) {
    this._audio.click();
    const view = this.engine.inputDigit(d);
    this._updateDisplay(view.expression, view.display);
  }

  dot() {
    this._audio.click();
    const view = this.engine.inputDot();
    this._updateDisplay(view.expression, view.display);
  }

  op(op) {
    this._audio.op();
    const view = this.engine.inputOp(op);
    this._updateDisplay(view.expression, view.display);
  }

  equals() {
    const result = this.engine.evaluate();
    if (result.error) {
      this._audio.error();
      this._updateDisplay(result.expression, result.error);
      this._onError(result.error);
    } else if (result.result != null) {
      this._audio.equals();
      this._updateDisplay(result.expression, result.display);
      this._onResult(result.result);
    }
  }

  clear() {
    this._audio.clear();
    const view = this.engine.clear();
    this._updateDisplay(view.expression, view.display);
    this._onClear();
  }

  percent() {
    this._audio.click();
    const view = this.engine.inputPercent();
    this._updateDisplay(view.expression, view.display);
  }

  toggleSign() {
    this._audio.click();
    const view = this.engine.toggleSign();
    this._updateDisplay(view.expression, view.display);
  }

  backspace() {
    this._audio.click();
    const view = this.engine.backspace();
    this._updateDisplay(view.expression, view.display);
  }

  // ---- Helpers for subclasses ----

  /** Simple tween: animate a numeric property over `ms` milliseconds. */
  tween(obj, prop, from, to, ms, ease = 'linear') {
    const start = performance.now();
    const easeFn = ease === 'bounce'
      ? (t) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2
      : (t) => t; // linear
    const tick = () => {
      const elapsed = performance.now() - start;
      const t = Math.min(1, elapsed / ms);
      obj[prop] = from + (to - from) * easeFn(t);
      if (t < 1) requestAnimationFrame(tick);
    };
    tick();
  }

  /** Animate an object: move + fade. Returns when done. */
  flyTo(obj, toX, toY, ms = 400) {
    const fromX = obj.x, fromY = obj.y;
    const start = performance.now();
    return new Promise(resolve => {
      const tick = () => {
        const t = Math.min(1, (performance.now() - start) / ms);
        const ease = t < 0.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;
        obj.x = fromX + (toX - fromX) * ease;
        obj.y = fromY + (toY - fromY) * ease;
        if (t < 1) requestAnimationFrame(tick);
        else resolve();
      };
      tick();
    });
  }

  // ---- Abstract (override in subclasses) ----
  _buildScene() {}
  _updateDisplay(expr, display) {}
  _onResult(result) {}
  _onError(message) {}
  _onClear() {}
}
