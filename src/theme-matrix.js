/**
 * Matrix Theme — the rain IS the calculator.
 *
 * No buttons. 16 columns of falling characters fill the screen.
 * Each column rains a single character: digits 0-9 (green),
 * operators +, -, x, / (red), = (white), C (dim).
 * Click a column to grab its character — the column freezes,
 * the character flies to the display. Press = to cascade.
 */
class MatrixTheme extends PixiTheme {
  constructor(engine) {
    super(engine, 420, 700);
    this._columns = [];
  }

  _buildScene() {
    const { app, W, H } = this;

    // ---- Display panel (translucent, top) ----
    const displayBg = new PIXI.Graphics();
    displayBg.beginFill(0x000000, 0.75);
    displayBg.drawRoundedRect(10, 10, W - 20, 100, 8);
    displayBg.endFill();
    displayBg.lineStyle(1, 0x00ff41, 0.25);
    displayBg.drawRoundedRect(10, 10, W - 20, 100, 8);
    app.stage.addChild(displayBg);

    this._exprText = new PIXI.Text('', {
      fontFamily: '"Courier New", monospace',
      fontSize: 15, fill: 0x009922,
    });
    this._exprText.anchor.set(1, 0);
    this._exprText.x = W - 22;
    this._exprText.y = 20;
    app.stage.addChild(this._exprText);

    this._resultText = new PIXI.Text('0', {
      fontFamily: '"Courier New", monospace',
      fontSize: 36, fill: 0x00ff41, fontWeight: 'bold',
    });
    this._resultText.anchor.set(1, 0);
    this._resultText.x = W - 22;
    this._resultText.y = 52;
    app.stage.addChild(this._resultText);

    // ---- Build the 16 rain columns ----
    this._rainContainer = new PIXI.Container();
    app.stage.addChildAt(this._rainContainer, 0); // behind display

    this._buildRainColumns();

    // ---- Ticker ----
    app.ticker.add((delta) => this._tick(delta));
  }

  // ---- Column definitions ----

  _getColumnDefs() {
    //  char,  action,            type
    return [
      { ch: '1', action: () => this.digit('1'), type: 'digit' },
      { ch: '2', action: () => this.digit('2'), type: 'digit' },
      { ch: '3', action: () => this.digit('3'), type: 'digit' },
      { ch: '4', action: () => this.digit('4'), type: 'digit' },
      { ch: '5', action: () => this.digit('5'), type: 'digit' },
      { ch: '6', action: () => this.digit('6'), type: 'digit' },
      { ch: '7', action: () => this.digit('7'), type: 'digit' },
      { ch: '8', action: () => this.digit('8'), type: 'digit' },
      { ch: '9', action: () => this.digit('9'), type: 'digit' },
      { ch: '0', action: () => this.digit('0'), type: 'digit' },
      { ch: '+', action: () => this.op('+'),    type: 'op' },
      { ch: '-', action: () => this.op('-'),    type: 'op' },
      { ch: '\u00d7', action: () => this.op('*'), type: 'op' },
      { ch: '\u00f7', action: () => this.op('/'), type: 'op' },
      { ch: '=', action: () => this.equals(),   type: 'eq' },
      { ch: 'C', action: () => this.clear(),    type: 'fn' },
    ];
  }

  // ---- Build rain columns ----

  _buildRainColumns() {
    const defs = this._getColumnDefs();
    const count = defs.length;
    const colW = this.W / count; // ~26px per column

    this._columns = defs.map((def, i) => {
      const cx = colW * i + colW / 2; // center x of column
      const color = { digit: 0x00ff41, op: 0xff3333, eq: 0xffffff, fn: 0x337733 }[def.type];
      const speed = 1.2 + Math.random() * 1.5;

      // Create falling characters for this column
      const chars = [];
      const charCount = 18 + Math.floor(Math.random() * 8);
      for (let j = 0; j < charCount; j++) {
        const text = new PIXI.Text(def.ch, {
          fontFamily: '"Courier New", monospace',
          fontSize: 16,
          fill: color,
        });
        text.anchor.set(0.5);
        text.x = cx;
        text.y = -(Math.random() * this.H * 1.5); // stagger start
        text.alpha = 0.05 + Math.random() * 0.35;
        this._rainContainer.addChild(text);
        chars.push(text);
      }

      // Bottom label (always visible, brighter)
      const label = new PIXI.Text(def.ch, {
        fontFamily: '"Courier New", monospace',
        fontSize: 20,
        fill: color,
        fontWeight: 'bold',
      });
      label.anchor.set(0.5);
      label.x = cx;
      label.y = this.H - 18;
      label.alpha = 0.6;
      this.app.stage.addChild(label);

      // Click zone (full column height)
      const zone = new PIXI.Graphics();
      zone.beginFill(0x000000, 0.001); // nearly invisible
      zone.drawRect(colW * i, 0, colW, this.H);
      zone.endFill();
      zone.eventMode = 'static';
      zone.cursor = 'pointer';

      zone.on('pointerdown', () => this._onColumnClick(i));
      zone.on('pointerover', () => {
        label.alpha = 1;
        label.scale.set(1.3);
        // Brighten entire column
        chars.forEach(c => { c.alpha = Math.min(1, c.alpha + 0.3); });
      });
      zone.on('pointerout', () => {
        label.alpha = 0.6;
        label.scale.set(1);
        chars.forEach(c => { c.alpha = Math.max(0.05, c.alpha - 0.3); });
      });
      this.app.stage.addChild(zone);

      return {
        def, cx, color, speed, chars, label, zone,
        frozen: false, freezeTimer: 0,
        baseSpeed: speed,
      };
    });
  }

  // ---- Column click ----

  _onColumnClick(colIdx) {
    const col = this._columns[colIdx];

    // Freeze the column
    col.frozen = true;
    col.freezeTimer = 50;

    // Flash all chars white then back
    col.chars.forEach(c => {
      c.style.fill = 0xffffff;
      c.alpha = 0.9;
    });
    col.label.style.fill = 0xffffff;
    col.label.alpha = 1;
    setTimeout(() => {
      col.chars.forEach(c => {
        c.style.fill = col.color;
        c.alpha = 0.1 + Math.random() * 0.3;
      });
      col.label.style.fill = col.color;
      col.label.alpha = 0.6;
    }, 300);

    // Spawn flying character toward display
    this._spawnFlyer(col.def.ch, col.cx, this.H / 2, col.color);

    // Fire the action
    col.def.action();
  }

  _spawnFlyer(char, fromX, fromY, color) {
    const fly = new PIXI.Text(char, {
      fontFamily: '"Courier New", monospace',
      fontSize: 32, fill: color, fontWeight: 'bold',
    });
    fly.anchor.set(0.5);
    fly.x = fromX;
    fly.y = fromY;
    this.app.stage.addChild(fly);

    this.flyTo(fly, this.W - 50, 70, 400).then(() => {
      this.tween(fly, 'alpha', 1, 0, 200);
      this.tween(fly.scale, 'x', 1, 2.5, 200);
      this.tween(fly.scale, 'y', 1, 2.5, 200);
      setTimeout(() => {
        if (fly.parent) fly.parent.removeChild(fly);
        fly.destroy();
      }, 250);
    });
  }

  // ---- Rain animation ----

  _tick(delta) {
    for (const col of this._columns) {
      if (col.frozen) {
        col.freezeTimer -= delta;
        if (col.freezeTimer <= 0) col.frozen = false;
        continue;
      }
      for (let j = 0; j < col.chars.length; j++) {
        const ch = col.chars[j];
        ch.y += col.speed * delta;
        if (ch.y > this.H + 20) {
          ch.y = -20 - Math.random() * 200;
          ch.alpha = 0.05 + Math.random() * 0.35;
        }
        // Lead character in column is brighter
        if (j === 0) {
          ch.alpha = Math.min(1, ch.alpha + 0.4);
          ch.style.fill = 0xccffcc;
        }
      }
    }
  }

  // ---- Display ----

  _updateDisplay(expr, display) {
    this._exprText.text = expr;
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

  // ---- Result / Error / Clear ----

  _onResult(result) {
    // All columns accelerate wildly
    this._columns.forEach(c => { c.speed = c.baseSpeed * 5; });

    setTimeout(() => {
      // Freeze everything, flash white
      this._columns.forEach(c => {
        c.speed = c.baseSpeed;
        c.frozen = true;
        c.freezeTimer = 60;
        c.chars.forEach(ch => { ch.style.fill = 0xffffff; ch.alpha = 1; });
        c.label.style.fill = 0xffffff;
      });

      // Fade back to green
      setTimeout(() => {
        this._columns.forEach(c => {
          c.chars.forEach(ch => {
            ch.style.fill = c.color;
            ch.alpha = 0.1 + Math.random() * 0.3;
          });
          c.label.style.fill = c.color;
        });
      }, 700);
    }, 400);

    // Result glow
    this._resultText.style.fill = 0xffffff;
    setTimeout(() => { this._resultText.style.fill = 0x00ff41; }, 900);
  }

  _onError() {
    // All columns go red
    this._columns.forEach(c => {
      c.chars.forEach(ch => { ch.style.fill = 0xff0000; ch.alpha = 0.6; });
      c.label.style.fill = 0xff0000;
    });
    this._resultText.style.fill = 0xff4444;

    setTimeout(() => {
      this._columns.forEach(c => {
        c.chars.forEach(ch => { ch.style.fill = c.color; ch.alpha = 0.1 + Math.random() * 0.3; });
        c.label.style.fill = c.color;
      });
      this._resultText.style.fill = 0x00ff41;
    }, 800);
  }

  _onClear() {
    this._resultText.style.fill = 0xccffcc;
    setTimeout(() => { this._resultText.style.fill = 0x00ff41; }, 200);
  }

  destroy() {
    if (this._typeTimer) clearInterval(this._typeTimer);
    super.destroy();
  }
}
