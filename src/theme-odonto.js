/**
 * Odontology Theme — dental calculator.
 *
 * An open mouth fills the screen. Upper teeth = numbers,
 * lower teeth = operators. Each tooth is shaped like an actual tooth.
 * Click a tooth to "drill" it — sparks fly, tooth vibrates.
 * Results appear on an X-ray light panel that develops like film.
 * Errors cause cavities (teeth crack and darken).
 */
class OdontoTheme extends PixiTheme {
  constructor(engine) {
    super(engine, 420, 700);
    this._teeth = [];
    this._sparkles = [];
  }

  _buildScene() {
    const { app, W, H } = this;
    const stage = app.stage;

    // ---- Clinical background ----
    const bg = new PIXI.Graphics();
    bg.beginFill(0xe8f4f8);
    bg.drawRect(0, 0, W, H);
    bg.endFill();
    stage.addChild(bg);

    // ---- X-ray display panel ----
    this._buildXrayPanel();

    // ---- Mouth ----
    this._buildMouth();

    // ---- Sparkle layer ----
    this._sparkleContainer = new PIXI.Container();
    stage.addChild(this._sparkleContainer);

    // ---- Ticker ----
    app.ticker.add((delta) => this._tickSparkles(delta));
  }

  _buildXrayPanel() {
    const { app, W } = this;
    const panel = new PIXI.Graphics();
    // X-ray backlight
    panel.beginFill(0x0a1a2a);
    panel.drawRoundedRect(20, 20, W - 40, 120, 12);
    panel.endFill();
    // Blue glow border
    panel.lineStyle(2, 0x3388cc, 0.5);
    panel.drawRoundedRect(20, 20, W - 40, 120, 12);
    // Inner glow
    panel.beginFill(0x112233, 0.5);
    panel.drawRoundedRect(25, 25, W - 50, 110, 10);
    panel.endFill();
    app.stage.addChild(panel);

    // "X-RAY" label
    const label = new PIXI.Text('X-RAY', {
      fontFamily: '"Courier New", monospace',
      fontSize: 10, fill: 0x3388cc, letterSpacing: 4,
    });
    label.x = 32; label.y = 28;
    app.stage.addChild(label);

    // Expression
    this._exprText = new PIXI.Text('', {
      fontFamily: '"Courier New", monospace',
      fontSize: 16, fill: 0x5599bb,
    });
    this._exprText.anchor.set(1, 0);
    this._exprText.x = W - 35; this._exprText.y = 45;
    app.stage.addChild(this._exprText);

    // Result
    this._resultText = new PIXI.Text('0', {
      fontFamily: '"Courier New", monospace',
      fontSize: 36, fill: 0xaaddff, fontWeight: 'bold',
    });
    this._resultText.anchor.set(1, 0);
    this._resultText.x = W - 35; this._resultText.y = 72;
    app.stage.addChild(this._resultText);
  }

  _buildMouth() {
    const { app, W, H } = this;
    const stage = app.stage;

    // ---- Lip outline (upper) ----
    const lips = new PIXI.Graphics();
    lips.beginFill(0xe88888);
    lips.drawEllipse(W / 2, 175, W / 2 - 15, 45);
    lips.endFill();
    // Mouth interior
    lips.beginFill(0x8b2233);
    lips.drawEllipse(W / 2, 172, W / 2 - 35, 32);
    lips.endFill();
    stage.addChild(lips);

    // ---- Gum line (upper) ----
    const gumUpper = new PIXI.Graphics();
    gumUpper.beginFill(0xee9999);
    gumUpper.drawEllipse(W / 2, 210, W / 2 - 30, 20);
    gumUpper.endFill();
    stage.addChild(gumUpper);

    // ---- Lower lip ----
    const lowerLip = new PIXI.Graphics();
    lowerLip.beginFill(0xe88888);
    lowerLip.drawEllipse(W / 2, H - 80, W / 2 - 15, 50);
    lowerLip.endFill();
    lowerLip.beginFill(0x8b2233);
    lowerLip.drawEllipse(W / 2, H - 80, W / 2 - 35, 35);
    lowerLip.endFill();
    stage.addChild(lowerLip);

    // ---- Tongue (behind lower gum) ----
    const tongue = new PIXI.Graphics();
    tongue.beginFill(0xcc6666);
    tongue.drawEllipse(W / 2, H - 150, 60, 30);
    tongue.endFill();
    stage.addChild(tongue);

    // ---- Gum line (lower, on top of tongue) ----
    const gumLower = new PIXI.Graphics();
    gumLower.beginFill(0xee9999);
    gumLower.drawEllipse(W / 2, H - 115, W / 2 - 30, 20);
    gumLower.endFill();
    stage.addChild(gumLower);

    // ---- Build teeth ----
    this._buildUpperTeeth();
    this._buildLowerTeeth();
  }

  _drawTooth(x, y, w, h, label, type, action) {
    const container = new PIXI.Container();
    container.x = x;
    container.y = y;

    // Tooth shape — rounded top, flat bottom (molar-like)
    const tooth = new PIXI.Graphics();
    tooth.beginFill(0xfff8ee);
    tooth.lineStyle(1.5, 0xddccaa);

    if (type === 'incisor') {
      // Tall, narrow
      tooth.drawRoundedRect(0, 0, w, h, 6);
      // Root hint
      tooth.beginFill(0xfff0dd);
      tooth.drawRoundedRect(w * 0.2, h * 0.7, w * 0.6, h * 0.35, 4);
      tooth.endFill();
    } else if (type === 'molar') {
      // Wide with bumps on top
      tooth.moveTo(4, h);
      tooth.lineTo(2, h * 0.3);
      tooth.quadraticCurveTo(w * 0.25, -4, w * 0.4, h * 0.15);
      tooth.quadraticCurveTo(w * 0.5, -2, w * 0.6, h * 0.15);
      tooth.quadraticCurveTo(w * 0.75, -4, w - 2, h * 0.3);
      tooth.lineTo(w - 4, h);
      tooth.closePath();
      tooth.endFill();
    } else {
      // Canine — pointed
      tooth.moveTo(4, h);
      tooth.lineTo(2, h * 0.3);
      tooth.quadraticCurveTo(w * 0.5, -8, w - 2, h * 0.3);
      tooth.lineTo(w - 4, h);
      tooth.closePath();
      tooth.endFill();
    }

    container.addChild(tooth);

    // Label on tooth
    const text = new PIXI.Text(label, {
      fontFamily: 'Arial, sans-serif',
      fontSize: w > 45 ? 18 : 15,
      fill: 0x556677,
      fontWeight: 'bold',
    });
    text.anchor.set(0.5);
    text.x = w / 2;
    text.y = h * 0.45;
    container.addChild(text);

    // Interaction
    container.eventMode = 'static';
    container.cursor = 'pointer';
    container.hitArea = new PIXI.Rectangle(0, 0, w, h);

    container.on('pointerdown', () => {
      this._drillTooth(container, x + w / 2, y + h / 2);
      action();
    });

    container.on('pointerover', () => {
      tooth.tint = 0xeeeeff;
      container.scale.set(1.08);
    });
    container.on('pointerout', () => {
      tooth.tint = 0xffffff;
      container.scale.set(1);
    });

    this.app.stage.addChild(container);
    this._teeth.push({ container, tooth, label });
    return container;
  }

  _buildUpperTeeth() {
    const W = this.W;
    const nums = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0'];
    const y = 220;
    const toothW = 34;
    const gap = 2;
    const totalW = nums.length * toothW + (nums.length - 1) * gap;
    const offsetX = (W - totalW) / 2;

    nums.forEach((label, i) => {
      const type = (i < 2 || i > 7) ? 'molar' : (i === 2 || i === 7) ? 'canine' : 'incisor';
      const h = type === 'molar' ? 65 : type === 'canine' ? 72 : 60;
      this._drawTooth(
        offsetX + i * (toothW + gap), y, toothW, h,
        label, type,
        () => this.digit(label)
      );
    });
  }

  _buildLowerTeeth() {
    const W = this.W;
    const ops = [
      { label: 'AC', action: () => this.clear() },
      { label: '+', action: () => this.op('+') },
      { label: '-', action: () => this.op('-') },
      { label: '\u00d7', action: () => this.op('*') },
      { label: '\u00f7', action: () => this.op('/') },
      { label: '.', action: () => this.dot() },
      { label: '%', action: () => this.percent() },
      { label: '\u232b', action: () => this.backspace() },
      { label: '=', action: () => this.equals() },
    ];

    const toothW = 38;
    const gap = 3;
    const totalW = ops.length * toothW + (ops.length - 1) * gap;
    const offsetX = (W - totalW) / 2;
    const y = this.H - 195;

    ops.forEach((op, i) => {
      const type = (i === 0 || i === ops.length - 1) ? 'molar' : (i === 4) ? 'canine' : 'incisor';
      const h = type === 'molar' ? 60 : type === 'canine' ? 68 : 55;
      const tooth = this._drawTooth(
        offsetX + i * (toothW + gap), y, toothW, h,
        op.label, type, op.action
      );
      // Equals tooth gets a blue tint
      if (op.label === '=') {
        tooth.children[0].tint = 0xddddff;
      }
    });
  }

  // ---- Drill effect ----

  _drillTooth(container, cx, cy) {
    // Vibrate
    const origX = container.x;
    let vibCount = 0;
    const vibrate = setInterval(() => {
      container.x = origX + (Math.random() - 0.5) * 4;
      vibCount++;
      if (vibCount > 8) { clearInterval(vibrate); container.x = origX; }
    }, 30);

    // Sparks
    for (let i = 0; i < 8; i++) {
      const spark = new PIXI.Graphics();
      spark.beginFill(0xffffff);
      spark.drawCircle(0, 0, 1.5 + Math.random() * 2);
      spark.endFill();
      spark.x = cx;
      spark.y = cy;
      spark._vx = (Math.random() - 0.5) * 6;
      spark._vy = -2 - Math.random() * 4;
      spark._life = 1;
      this._sparkleContainer.addChild(spark);
      this._sparkles.push(spark);
    }
  }

  _tickSparkles(delta) {
    for (let i = this._sparkles.length - 1; i >= 0; i--) {
      const s = this._sparkles[i];
      s.x += s._vx * delta;
      s.y += s._vy * delta;
      s._vy += 0.15 * delta; // gravity
      s._life -= 0.03 * delta;
      s.alpha = Math.max(0, s._life);
      if (s._life <= 0) {
        s.parent.removeChild(s);
        s.destroy();
        this._sparkles.splice(i, 1);
      }
    }
  }

  // ---- Display ----

  _updateDisplay(expr, display) {
    this._exprText.text = expr;
    this._resultText.text = display;
  }

  _onResult(result) {
    // X-ray developing effect: flash white then settle
    this._resultText.style.fill = 0xffffff;
    this._resultText.style.fontSize = 40;
    setTimeout(() => {
      this._resultText.style.fill = 0xaaddff;
      this._resultText.style.fontSize = 36;
    }, 500);

    // Sparkle burst around the display
    const cx = this.W / 2, cy = 80;
    for (let i = 0; i < 12; i++) {
      const s = new PIXI.Graphics();
      s.beginFill([0xffffff, 0xaaddff, 0x88ccee][i % 3]);
      s.drawStar?.(0, 0, 4, 3, 1.5) || s.drawCircle(0, 0, 2);
      s.endFill();
      s.x = cx; s.y = cy;
      s._vx = (Math.random() - 0.5) * 8;
      s._vy = (Math.random() - 0.5) * 8;
      s._life = 1;
      this._sparkleContainer.addChild(s);
      this._sparkles.push(s);
    }
  }

  _onError(msg) {
    // Cavity! Darken some teeth
    const toothCount = Math.min(3, this._teeth.length);
    for (let i = 0; i < toothCount; i++) {
      const idx = Math.floor(Math.random() * this._teeth.length);
      const t = this._teeth[idx];
      t.tooth.tint = 0x887766;
      setTimeout(() => { t.tooth.tint = 0xffffff; }, 2000);
    }
    this._resultText.style.fill = 0xff6644;
    setTimeout(() => { this._resultText.style.fill = 0xaaddff; }, 1500);
  }

  _onClear() {
    // Polish sweep — brighten all teeth sequentially
    this._teeth.forEach((t, i) => {
      setTimeout(() => {
        t.tooth.tint = 0xffffff;
        t.container.scale.set(1.05);
        setTimeout(() => t.container.scale.set(1), 100);
      }, i * 40);
    });
  }
}
