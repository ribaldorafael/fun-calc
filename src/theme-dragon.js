/**
 * Dragon Theme — treasure hoard calculator.
 *
 * A dark cave with a dragon's gold hoard. Coins have numbers on them.
 * Glowing rune stones serve as operators. A cauldron in the center
 * is the equals button — coins swirl in, fire erupts, result rises
 * from the flames. Big results trigger a dragon flyby.
 */
class DragonTheme extends PixiTheme {
  constructor(engine) {
    super(engine, 420, 700);
    this._embers = [];
    this._fireParticles = [];
  }

  _buildScene() {
    const { app, W, H } = this;

    // ---- Cave background ----
    const bg = new PIXI.Graphics();
    // Dark cave gradient (simulated)
    bg.beginFill(0x0a0500);
    bg.drawRect(0, 0, W, H);
    bg.endFill();
    // Warm glow at bottom (gold hoard)
    const glow = new PIXI.Graphics();
    glow.beginFill(0x332200, 0.4);
    glow.drawEllipse(W / 2, H - 100, W, 200);
    glow.endFill();
    app.stage.addChild(bg);
    app.stage.addChild(glow);

    // ---- Display (ancient scroll) ----
    this._buildDisplay();

    // ---- Cauldron (equals) ----
    this._buildCauldron();

    // ---- Coins (numbers) ----
    this._buildCoins();

    // ---- Runes (operators) ----
    this._buildRunes();

    // ---- Function stones ----
    this._buildFnStones();

    // ---- Ember/fire layer ----
    this._emberContainer = new PIXI.Container();
    app.stage.addChild(this._emberContainer);

    // ---- Dragon silhouette ----
    this._buildDragon();

    // ---- Ticker ----
    app.ticker.add((delta) => this._tick(delta));
  }

  _buildDisplay() {
    const { app, W } = this;

    // Scroll/parchment background
    const scroll = new PIXI.Graphics();
    scroll.beginFill(0x1a1008, 0.85);
    scroll.lineStyle(2, 0x665522, 0.6);
    scroll.drawRoundedRect(20, 15, W - 40, 110, 8);
    scroll.endFill();
    // Inner decorative border
    scroll.lineStyle(1, 0x443311, 0.3);
    scroll.drawRoundedRect(26, 21, W - 52, 98, 6);
    app.stage.addChild(scroll);

    this._exprText = new PIXI.Text('', {
      fontFamily: 'Georgia, serif',
      fontSize: 15, fill: 0x997744, fontStyle: 'italic',
    });
    this._exprText.anchor.set(1, 0);
    this._exprText.x = W - 35; this._exprText.y = 30;
    app.stage.addChild(this._exprText);

    this._resultText = new PIXI.Text('0', {
      fontFamily: 'Georgia, serif',
      fontSize: 36, fill: 0xffcc44, fontWeight: 'bold',
    });
    this._resultText.anchor.set(1, 0);
    this._resultText.x = W - 35; this._resultText.y = 62;
    app.stage.addChild(this._resultText);
  }

  _buildCauldron() {
    const { app, W } = this;
    const cx = W / 2, cy = 330;

    const cauldron = new PIXI.Container();

    // Pot body
    const pot = new PIXI.Graphics();
    pot.beginFill(0x2a2a2a);
    pot.drawEllipse(0, 0, 55, 35);
    pot.endFill();
    // Rim
    pot.beginFill(0x444444);
    pot.drawEllipse(0, -25, 55, 10);
    pot.endFill();
    pot.lineStyle(2, 0x555555);
    pot.drawEllipse(0, -25, 55, 10);
    // Legs
    pot.lineStyle(3, 0x333333);
    pot.moveTo(-35, 25); pot.lineTo(-40, 45);
    pot.moveTo(35, 25); pot.lineTo(40, 45);

    cauldron.addChild(pot);

    // Bubbling liquid
    const liquid = new PIXI.Graphics();
    liquid.beginFill(0x44aa22, 0.6);
    liquid.drawEllipse(0, -20, 42, 8);
    liquid.endFill();
    cauldron.addChild(liquid);
    this._cauldronLiquid = liquid;

    // "= BREW" label
    const label = new PIXI.Text('= BREW', {
      fontFamily: 'Georgia, serif',
      fontSize: 12, fill: 0x88ff44, fontWeight: 'bold',
    });
    label.anchor.set(0.5);
    label.y = 10;
    cauldron.addChild(label);

    cauldron.x = cx; cauldron.y = cy;
    cauldron.eventMode = 'static';
    cauldron.cursor = 'pointer';
    cauldron.hitArea = new PIXI.Rectangle(-55, -35, 110, 80);

    cauldron.on('pointerdown', () => {
      this.equals();
      cauldron.scale.set(0.92);
      this.tween(cauldron.scale, 'x', 0.92, 1, 200);
      this.tween(cauldron.scale, 'y', 0.92, 1, 200);
    });
    cauldron.on('pointerover', () => { liquid.tint = 0xaaffaa; });
    cauldron.on('pointerout', () => { liquid.tint = 0xffffff; });

    app.stage.addChild(cauldron);
    this._cauldron = cauldron;
  }

  _makeGoldCoin(x, y, label, size, action) {
    const coin = new PIXI.Container();

    // Coin body (gold gradient simulated)
    const body = new PIXI.Graphics();
    body.beginFill(0xddaa33);
    body.drawCircle(0, 0, size);
    body.endFill();
    // Inner ring
    body.lineStyle(1.5, 0xffcc44, 0.6);
    body.drawCircle(0, 0, size - 4);
    // Highlight
    body.beginFill(0xffdd66, 0.3);
    body.drawEllipse(-size * 0.2, -size * 0.2, size * 0.4, size * 0.3);
    body.endFill();
    coin.addChild(body);

    // Number embossed on coin
    const text = new PIXI.Text(label, {
      fontFamily: 'Georgia, serif',
      fontSize: size * 0.8,
      fill: 0x886622, fontWeight: 'bold',
    });
    text.anchor.set(0.5);
    coin.addChild(text);

    coin.x = x; coin.y = y;
    coin.eventMode = 'static';
    coin.cursor = 'pointer';

    coin.on('pointerdown', () => {
      action();
      // Flip animation
      coin.scale.x = 0.3;
      this.tween(coin.scale, 'x', 0.3, 1, 250);
      // Fly a ghost coin to display
      this._flyGhostCoin(label, x, y);
    });
    coin.on('pointerover', () => { body.tint = 0xffffaa; coin.scale.set(1.1); });
    coin.on('pointerout', () => { body.tint = 0xffffff; coin.scale.set(1); });

    this.app.stage.addChild(coin);
    return coin;
  }

  _buildCoins() {
    const W = this.W;
    // Arrange coins in a scattered hoard pattern (3 rows)
    const digits = [
      { d: '7', x: 45,  y: 420 }, { d: '8', x: 115, y: 415 }, { d: '9', x: 185, y: 420 },
      { d: '4', x: 70,  y: 490 }, { d: '5', x: 140, y: 485 }, { d: '6', x: 210, y: 490 },
      { d: '1', x: 50,  y: 560 }, { d: '2', x: 120, y: 555 }, { d: '3', x: 190, y: 560 },
      { d: '0', x: 90,  y: 625 }, { d: '.', x: 165, y: 630 },
    ];

    // Add slight random offset for natural feel
    digits.forEach(({ d, x, y }) => {
      const rx = x + (Math.random() - 0.5) * 10;
      const ry = y + (Math.random() - 0.5) * 8;
      const size = d === '0' ? 26 : 22;
      this._makeGoldCoin(rx, ry, d, size, () => {
        if (d === '.') this.dot();
        else this.digit(d);
      });
    });
  }

  _buildRunes() {
    const ops = [
      { label: '+', op: '+', x: 310, y: 420 },
      { label: '-', op: '-', x: 330, y: 490 },
      { label: '\u00d7', op: '*', x: 310, y: 560 },
      { label: '\u00f7', op: '/', x: 330, y: 625 },
    ];

    ops.forEach(({ label, op, x, y }) => {
      const rune = new PIXI.Container();

      // Stone shape
      const stone = new PIXI.Graphics();
      stone.beginFill(0x334455);
      stone.lineStyle(1, 0x6688aa, 0.4);
      // Irregular hexagon-ish shape
      stone.moveTo(0, -22);
      stone.lineTo(20, -12);
      stone.lineTo(22, 12);
      stone.lineTo(5, 24);
      stone.lineTo(-18, 15);
      stone.lineTo(-20, -10);
      stone.closePath();
      stone.endFill();
      rune.addChild(stone);

      // Glowing rune symbol
      const text = new PIXI.Text(label, {
        fontFamily: 'Georgia, serif',
        fontSize: 22, fill: 0x44ccff, fontWeight: 'bold',
      });
      text.anchor.set(0.5);
      text.y = 2;
      rune.addChild(text);

      rune.x = x; rune.y = y;
      rune.eventMode = 'static';
      rune.cursor = 'pointer';
      rune.hitArea = new PIXI.Rectangle(-22, -24, 44, 48);

      rune.on('pointerdown', () => {
        this.op(op);
        // Pulse glow
        text.style.fill = 0xffffff;
        setTimeout(() => { text.style.fill = 0x44ccff; }, 200);
        rune.scale.set(0.85);
        this.tween(rune.scale, 'x', 0.85, 1, 200);
        this.tween(rune.scale, 'y', 0.85, 1, 200);
      });
      rune.on('pointerover', () => { text.style.fill = 0xaaeeff; rune.scale.set(1.1); });
      rune.on('pointerout', () => { text.style.fill = 0x44ccff; rune.scale.set(1); });

      this.app.stage.addChild(rune);
    });
  }

  _buildFnStones() {
    const fns = [
      { label: 'AC', action: () => this.clear(), x: 370, y: 330 },
      { label: '\u232b', action: () => this.backspace(), x: 260, y: 635 },
    ];

    fns.forEach(({ label, action, x, y }) => {
      const stone = new PIXI.Container();
      const bg = new PIXI.Graphics();
      bg.beginFill(0x553322);
      bg.drawRoundedRect(-20, -14, 40, 28, 6);
      bg.endFill();
      stone.addChild(bg);

      const text = new PIXI.Text(label, {
        fontFamily: 'Georgia, serif',
        fontSize: 13, fill: 0xcc9966,
      });
      text.anchor.set(0.5);
      stone.addChild(text);

      stone.x = x; stone.y = y;
      stone.eventMode = 'static';
      stone.cursor = 'pointer';

      stone.on('pointerdown', () => {
        action();
        stone.scale.set(0.9);
        this.tween(stone.scale, 'x', 0.9, 1, 150);
        this.tween(stone.scale, 'y', 0.9, 1, 150);
      });

      this.app.stage.addChild(stone);
    });
  }

  _buildDragon() {
    // Dragon silhouette in the upper background
    this._dragonText = new PIXI.Text('\u{1F409}', { fontSize: 50 });
    this._dragonText.anchor.set(0.5);
    this._dragonText.x = 60;
    this._dragonText.y = 195;
    this._dragonText.alpha = 0.3;
    this.app.stage.addChildAt(this._dragonText, 2); // behind coins
    this._dragonBreathTimer = 0;
  }

  _flyGhostCoin(label, fromX, fromY) {
    const ghost = new PIXI.Graphics();
    ghost.beginFill(0xffdd44, 0.7);
    ghost.drawCircle(0, 0, 12);
    ghost.endFill();
    const text = new PIXI.Text(label, {
      fontFamily: 'Georgia, serif', fontSize: 14, fill: 0x886622,
    });
    text.anchor.set(0.5);
    ghost.addChild(text);
    ghost.x = fromX;
    ghost.y = fromY;
    this.app.stage.addChild(ghost);

    this.flyTo(ghost, this.W - 60, 80, 350).then(() => {
      this.tween(ghost, 'alpha', 0.7, 0, 150);
      setTimeout(() => {
        if (ghost.parent) ghost.parent.removeChild(ghost);
        ghost.destroy();
      }, 200);
    });
  }

  // ---- Fire/ember system ----

  _spawnFire(cx, cy, count = 15) {
    for (let i = 0; i < count; i++) {
      const p = new PIXI.Graphics();
      const hue = Math.random() * 40 + 10; // orange-red
      p.beginFill(
        PIXI.utils.rgb2hex([
          1,
          0.3 + Math.random() * 0.5,
          Math.random() * 0.2,
        ])
      );
      p.drawCircle(0, 0, 2 + Math.random() * 4);
      p.endFill();
      p.x = cx + (Math.random() - 0.5) * 30;
      p.y = cy;
      p._vx = (Math.random() - 0.5) * 3;
      p._vy = -2 - Math.random() * 5;
      p._life = 1;
      this._emberContainer.addChild(p);
      this._embers.push(p);
    }
  }

  _tick(delta) {
    // Embers
    for (let i = this._embers.length - 1; i >= 0; i--) {
      const e = this._embers[i];
      e.x += e._vx * delta;
      e.y += e._vy * delta;
      e._vy += 0.05 * delta;
      e._life -= 0.02 * delta;
      e.alpha = Math.max(0, e._life);
      e.scale.set(e._life);
      if (e._life <= 0) {
        e.parent.removeChild(e);
        e.destroy();
        this._embers.splice(i, 1);
      }
    }

    // Cauldron bubble
    if (this._cauldronLiquid) {
      this._cauldronLiquid.y = -20 + Math.sin(Date.now() / 300) * 2;
    }

    // Dragon idle breathing
    this._dragonBreathTimer += delta;
    if (this._dragonBreathTimer > 180) {
      this._dragonBreathTimer = 0;
      this._dragonText.alpha = 0.5;
      this._spawnFire(80, 190, 5);
      setTimeout(() => { this._dragonText.alpha = 0.3; }, 500);
    }
  }

  // ---- Display ----

  _updateDisplay(expr, display) {
    this._exprText.text = expr;
    this._resultText.text = display;
  }

  _onResult(result) {
    const cx = this._cauldron.x, cy = this._cauldron.y;

    // Fire eruption from cauldron
    this._spawnFire(cx, cy - 20, 30);

    // Cauldron shake
    const origX = this._cauldron.x;
    let count = 0;
    const shake = setInterval(() => {
      this._cauldron.x = origX + (Math.random() - 0.5) * 6;
      count++;
      if (count > 10) { clearInterval(shake); this._cauldron.x = origX; }
    }, 30);

    // Result glow
    this._resultText.style.fill = 0xffffff;
    this._resultText.style.fontSize = 42;
    setTimeout(() => {
      this._resultText.style.fill = 0xffcc44;
      this._resultText.style.fontSize = 36;
    }, 800);

    // Big result → dragon flyby
    const num = Math.abs(parseFloat(result));
    if (num >= 1000) {
      this._dragonFlyby();
    }
  }

  _dragonFlyby() {
    const dragon = new PIXI.Text('\u{1F409}', { fontSize: 60 });
    dragon.anchor.set(0.5);
    dragon.x = -60;
    dragon.y = this.H * 0.35;
    dragon.alpha = 0.9;
    this.app.stage.addChild(dragon);

    // Fly across screen
    const startX = -60, endX = this.W + 60;
    const start = performance.now();
    const tick = () => {
      const t = Math.min(1, (performance.now() - start) / 2500);
      dragon.x = startX + (endX - startX) * t;
      dragon.y = this.H * 0.35 + Math.sin(t * Math.PI * 2) * 40;
      // Leave fire trail
      if (Math.random() > 0.5) {
        this._spawnFire(dragon.x - 20, dragon.y + 10, 2);
      }
      if (t < 1) requestAnimationFrame(tick);
      else {
        dragon.parent.removeChild(dragon);
        dragon.destroy();
      }
    };
    tick();
  }

  _onError(msg) {
    // Dragon roar — screen tints red briefly
    this._resultText.style.fill = 0xff4444;
    this._dragonText.alpha = 0.7;
    this._dragonText.scale.set(1.3);
    this._spawnFire(this._dragonText.x, this._dragonText.y + 20, 15);
    setTimeout(() => {
      this._resultText.style.fill = 0xffcc44;
      this._dragonText.alpha = 0.3;
      this._dragonText.scale.set(1);
    }, 1000);
  }

  _onClear() {
    // Coins settle — small bounce on the cauldron
    this._cauldronLiquid.tint = 0x88ff88;
    setTimeout(() => { this._cauldronLiquid.tint = 0xffffff; }, 300);
  }
}
