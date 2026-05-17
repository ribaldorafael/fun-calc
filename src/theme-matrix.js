/**
 * Matrix Theme — "The Matrix" style calculator.
 *
 * Rain columns of green digits fill the screen. Buttons are embedded
 * in the rain. Click a digit and the column freezes — the character
 * pops out and flies to the display. Operators flash red like a glitch.
 * Equals triggers a full cascade that resolves into the answer.
 */
class MatrixTheme extends PixiTheme {
  constructor(engine) {
    super(engine, 420, 700);
    this._columns = [];
    this._glitchTimer = 0;
  }

  _buildScene() {
    const { app, W, H } = this;
    const stage = app.stage;

    // ---- Rain layer (behind everything) ----
    this._rainContainer = new PIXI.Container();
    stage.addChild(this._rainContainer);
    this._initRain();

    // ---- Display panel ----
    const displayBg = new PIXI.Graphics();
    displayBg.beginFill(0x000000, 0.7);
    displayBg.drawRoundedRect(15, 15, W - 30, 110, 10);
    displayBg.endFill();
    displayBg.lineStyle(1, 0x00ff41, 0.3);
    displayBg.drawRoundedRect(15, 15, W - 30, 110, 10);
    stage.addChild(displayBg);

    this._exprText = new PIXI.Text('', {
      fontFamily: '"Courier New", monospace',
      fontSize: 16, fill: 0x00aa30, align: 'right',
    });
    this._exprText.anchor.set(1, 0);
    this._exprText.x = W - 30; this._exprText.y = 28;
    stage.addChild(this._exprText);

    this._resultText = new PIXI.Text('0', {
      fontFamily: '"Courier New", monospace',
      fontSize: 38, fill: 0x00ff41, fontWeight: 'bold',
    });
    this._resultText.anchor.set(1, 0);
    this._resultText.x = W - 30; this._resultText.y = 60;
    stage.addChild(this._resultText);

    // ---- Button grid ----
    this._buildButtons();

    // ---- Ticker for rain animation ----
    app.ticker.add((delta) => this._tick(delta));
  }

  // ---- Rain system ----

  _initRain() {
    const cols = 25;
    this._columns = [];
    for (let i = 0; i < cols; i++) {
      const col = {
        x: (i / cols) * this.W + 8,
        chars: [],
        speed: 1.5 + Math.random() * 3,
        frozen: false,
        freezeTimer: 0,
      };
      const charCount = 12 + Math.floor(Math.random() * 8);
      for (let j = 0; j < charCount; j++) {
        const ch = this._randomChar();
        const text = new PIXI.Text(ch, {
          fontFamily: '"Courier New", monospace',
          fontSize: 14, fill: 0x00ff41,
        });
        text.x = col.x;
        text.y = -Math.random() * this.H;
        text.alpha = 0.1 + Math.random() * 0.5;
        this._rainContainer.addChild(text);
        col.chars.push(text);
      }
      this._columns.push(col);
    }
  }

  _randomChar() {
    const chars = '0123456789ABCDEFabcdef@#$%&*+=<>{}[]|\\/:;!?~^';
    return chars[Math.floor(Math.random() * chars.length)];
  }

  _tick(delta) {
    for (const col of this._columns) {
      if (col.frozen) {
        col.freezeTimer -= delta;
        if (col.freezeTimer <= 0) col.frozen = false;
        continue;
      }
      for (const ch of col.chars) {
        ch.y += col.speed * delta;
        if (ch.y > this.H + 20) {
          ch.y = -20 - Math.random() * 100;
          ch.text = this._randomChar();
          ch.alpha = 0.1 + Math.random() * 0.5;
        }
        // Head of column is brighter
        if (ch === col.chars[0]) {
          ch.style.fill = 0xccffcc;
          ch.alpha = 0.9;
        }
      }
    }
    // Random character mutations
    this._glitchTimer += delta;
    if (this._glitchTimer > 3) {
      this._glitchTimer = 0;
      const col = this._columns[Math.floor(Math.random() * this._columns.length)];
      for (const ch of col.chars) {
        ch.text = this._randomChar();
      }
    }
  }

  _freezeColumn(x) {
    let nearest = this._columns[0];
    let minDist = Infinity;
    for (const col of this._columns) {
      const dist = Math.abs(col.x - x);
      if (dist < minDist) { minDist = dist; nearest = col; }
    }
    nearest.frozen = true;
    nearest.freezeTimer = 30;
    // Flash the column bright
    for (const ch of nearest.chars) {
      ch.style.fill = 0xffffff;
      ch.alpha = 1;
      setTimeout(() => { ch.style.fill = 0x00ff41; ch.alpha = 0.3; }, 200);
    }
  }

  // ---- Buttons ----

  _buildButtons() {
    const layout = [
      ['AC', '+/-', '%', '\u00f7'],
      ['7',  '8',   '9', '\u00d7'],
      ['4',  '5',   '6', '-'],
      ['1',  '2',   '3', '+'],
      ['0',  '0b',  '.', '='],
    ];

    const padTop = 155;
    const btnW = 85;
    const btnH = 90;
    const gap = 12;
    const padLeft = (this.W - (4 * btnW + 3 * gap)) / 2;

    this._buttonContainer = new PIXI.Container();
    this.app.stage.addChild(this._buttonContainer);

    for (let row = 0; row < layout.length; row++) {
      for (let col = 0; col < layout[row].length; col++) {
        const label = layout[row][col];
        if (label === '0b') continue; // second half of zero

        const isZero = label === '0' && row === 4;
        const w = isZero ? btnW * 2 + gap : btnW;
        const x = padLeft + col * (btnW + gap);
        const y = padTop + row * (btnH + gap);

        const isOp = ['\u00f7', '\u00d7', '-', '+'].includes(label);
        const isEq = label === '=';
        const isFn = ['AC', '+/-', '%'].includes(label);
        const isNum = !isOp && !isEq && !isFn;

        // Button background
        const bg = new PIXI.Graphics();
        bg.beginFill(isEq ? 0x00ff41 : isOp ? 0x331111 : 0x000000, isEq ? 0.15 : 0.5);
        bg.lineStyle(1, isEq ? 0x00ff41 : isOp ? 0xff3333 : 0x00ff41, isEq ? 0.6 : 0.2);
        bg.drawRoundedRect(0, 0, w, btnH, 8);
        bg.endFill();

        // Label
        const color = isEq ? 0x00ff41 : isOp ? 0xff4444 : isFn ? 0x44aa44 : 0x00ff41;
        const text = new PIXI.Text(label, {
          fontFamily: '"Courier New", monospace',
          fontSize: isOp || isEq ? 28 : 24,
          fill: color, fontWeight: 'bold',
        });
        text.anchor.set(0.5);
        text.x = w / 2;
        text.y = btnH / 2;

        const btn = new PIXI.Container();
        btn.addChild(bg);
        btn.addChild(text);
        btn.x = x; btn.y = y;
        btn.eventMode = 'static';
        btn.cursor = 'pointer';

        // Click handler
        btn.on('pointerdown', () => this._onButton(label, btn));

        // Hover glow
        btn.on('pointerover', () => {
          bg.alpha = 1.2;
          text.style.fill = 0xffffff;
        });
        btn.on('pointerout', () => {
          bg.alpha = 1;
          text.style.fill = color;
        });

        this._buttonContainer.addChild(btn);
      }
    }
  }

  _onButton(label, btn) {
    // Freeze nearest rain column for visual effect
    this._freezeColumn(btn.x + 40);

    // Pop animation on the button
    btn.scale.set(0.9);
    this.tween(btn.scale, 'x', 0.9, 1, 150);
    this.tween(btn.scale, 'y', 0.9, 1, 150);

    // Spawn a flying character
    this._spawnFlyingChar(label, btn.x + 40, btn.y + 36);

    const opMap = { '\u00d7': '*', '\u00f7': '/' };
    if ('0123456789'.includes(label)) this.digit(label);
    else if (label === '.') this.dot();
    else if (label === '=') this.equals();
    else if (label === 'AC') this.clear();
    else if (label === '+/-') this.toggleSign();
    else if (label === '%') this.percent();
    else if (opMap[label]) this.op(opMap[label]);
    else if (['+', '-'].includes(label)) this.op(label);
  }

  _spawnFlyingChar(char, fromX, fromY) {
    const color = ['+', '-', '\u00d7', '\u00f7', '='].includes(char) ? 0xff4444 : 0x00ff41;
    const fly = new PIXI.Text(char, {
      fontFamily: '"Courier New", monospace',
      fontSize: 30, fill: color, fontWeight: 'bold',
    });
    fly.anchor.set(0.5);
    fly.x = fromX;
    fly.y = fromY;
    this.app.stage.addChild(fly);

    // Fly toward the display
    this.flyTo(fly, this.W - 60, 80, 350).then(() => {
      // Fade out
      this.tween(fly, 'alpha', 1, 0, 200);
      this.tween(fly.scale, 'x', 1, 2, 200);
      this.tween(fly.scale, 'y', 1, 2, 200);
      setTimeout(() => {
        if (fly.parent) fly.parent.removeChild(fly);
        fly.destroy();
      }, 250);
    });
  }

  // ---- Display ----

  _updateDisplay(expr, display) {
    this._exprText.text = expr;
    // Typing effect on result
    this._typeResult(display);
  }

  _typeResult(text) {
    if (this._typeTimer) clearInterval(this._typeTimer);
    let i = 0;
    this._resultText.text = '';
    this._typeTimer = setInterval(() => {
      if (i >= text.length) {
        clearInterval(this._typeTimer);
        this._typeTimer = null;
        return;
      }
      this._resultText.text += text[i];
      i++;
    }, 30);
  }

  // ---- Animations ----

  _onResult(result) {
    // Cascade: all rain accelerates then freezes
    for (const col of this._columns) {
      col.speed *= 4;
    }
    setTimeout(() => {
      for (const col of this._columns) {
        col.speed /= 4;
        col.frozen = true;
        col.freezeTimer = 40;
        // Flash all chars white
        for (const ch of col.chars) {
          ch.style.fill = 0xffffff;
          ch.alpha = 1;
        }
      }
      // After freeze, slowly resume and turn green again
      setTimeout(() => {
        for (const col of this._columns) {
          for (const ch of col.chars) {
            ch.style.fill = 0x00ff41;
            ch.alpha = 0.2 + Math.random() * 0.3;
          }
        }
      }, 600);
    }, 300);

    // Result glow
    this._resultText.style.fill = 0xffffff;
    this._resultText.style.fontSize = 42;
    setTimeout(() => {
      this._resultText.style.fill = 0x00ff41;
      this._resultText.style.fontSize = 38;
    }, 800);
  }

  _onError(msg) {
    // Red glitch across all columns
    for (const col of this._columns) {
      for (const ch of col.chars) {
        ch.style.fill = 0xff0000;
        ch.text = this._randomChar();
      }
    }
    this._resultText.style.fill = 0xff4444;
    setTimeout(() => {
      for (const col of this._columns) {
        for (const ch of col.chars) { ch.style.fill = 0x00ff41; }
      }
      this._resultText.style.fill = 0x00ff41;
    }, 800);
  }

  _onClear() {
    // Brief whiteout then reset
    this._resultText.style.fill = 0xccffcc;
    setTimeout(() => { this._resultText.style.fill = 0x00ff41; }, 200);
  }

  destroy() {
    if (this._typeTimer) clearInterval(this._typeTimer);
    super.destroy();
  }
}
