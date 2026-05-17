/**
 * CalculatorEngine — pure logic, no DOM, no side effects.
 *
 * Design pattern: State Machine.
 * The calculator has two phases that alternate:
 *   INPUT   – user is typing a number
 *   RESULT  – a result was just computed (display shows result)
 *
 * All public methods return an `UpdateView` object:
 *   { expression: string, display: string }
 * The UI layer reads this to update the DOM — engine never touches the DOM.
 */

// ---- Expression evaluator (browser fallback) ----

const TOKEN = Object.freeze({
  NUMBER: 'NUMBER',
  PLUS: 'PLUS',
  MINUS: 'MINUS',
  MULTIPLY: 'MULTIPLY',
  DIVIDE: 'DIVIDE',
  POWER: 'POWER',
  MODULO: 'MODULO',
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
});

function tokenize(expr) {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (ch === ' ') { i++; continue; }
    if (ch === '+') { tokens.push({ type: TOKEN.PLUS }); i++; continue; }
    if (ch === '-') { tokens.push({ type: TOKEN.MINUS }); i++; continue; }
    if (ch === '*') { tokens.push({ type: TOKEN.MULTIPLY }); i++; continue; }
    if (ch === '/') { tokens.push({ type: TOKEN.DIVIDE }); i++; continue; }
    if (ch === '^') { tokens.push({ type: TOKEN.POWER }); i++; continue; }
    if (ch === '%') { tokens.push({ type: TOKEN.MODULO }); i++; continue; }
    if (ch === '(') { tokens.push({ type: TOKEN.LPAREN }); i++; continue; }
    if (ch === ')') { tokens.push({ type: TOKEN.RPAREN }); i++; continue; }
    if (/[0-9.]/.test(ch)) {
      let num = '';
      while (i < expr.length && /[0-9.]/.test(expr[i])) { num += expr[i]; i++; }
      const val = parseFloat(num);
      if (isNaN(val)) throw new Error(`Invalid number: ${num}`);
      tokens.push({ type: TOKEN.NUMBER, value: val });
      continue;
    }
    throw new Error(`Unexpected character: ${ch}`);
  }
  return tokens;
}

function parseExpression(tokens) {
  let pos = 0;

  function parseAddition() {
    let left = parseMultiplication();
    while (pos < tokens.length) {
      if (tokens[pos].type === TOKEN.PLUS) { pos++; left += parseMultiplication(); }
      else if (tokens[pos].type === TOKEN.MINUS) { pos++; left -= parseMultiplication(); }
      else break;
    }
    return left;
  }

  function parseMultiplication() {
    let left = parsePower();
    while (pos < tokens.length) {
      if (tokens[pos].type === TOKEN.MULTIPLY) { pos++; left *= parsePower(); }
      else if (tokens[pos].type === TOKEN.DIVIDE) {
        pos++;
        const right = parsePower();
        if (right === 0) throw new Error('Division by zero');
        left /= right;
      } else if (tokens[pos].type === TOKEN.MODULO) {
        pos++;
        const right = parsePower();
        if (right === 0) throw new Error('Modulo by zero');
        left %= right;
      } else break;
    }
    return left;
  }

  function parsePower() {
    const base = parseUnary();
    if (pos < tokens.length && tokens[pos].type === TOKEN.POWER) {
      pos++;
      const exp = parseUnary();
      return Math.pow(base, exp);
    }
    return base;
  }

  function parseUnary() {
    if (pos >= tokens.length) throw new Error('Unexpected end of expression');
    if (tokens[pos].type === TOKEN.MINUS) { pos++; return -parsePrimary(); }
    if (tokens[pos].type === TOKEN.PLUS) { pos++; return parsePrimary(); }
    return parsePrimary();
  }

  function parsePrimary() {
    if (pos >= tokens.length) throw new Error('Unexpected end of expression');
    if (tokens[pos].type === TOKEN.NUMBER) { return tokens[pos++].value; }
    if (tokens[pos].type === TOKEN.LPAREN) {
      pos++;
      const val = parseAddition();
      if (pos >= tokens.length || tokens[pos].type !== TOKEN.RPAREN) {
        throw new Error('Missing closing parenthesis');
      }
      pos++;
      return val;
    }
    throw new Error(`Unexpected token: ${tokens[pos].type}`);
  }

  const result = parseAddition();
  if (pos < tokens.length) throw new Error(`Unexpected token: ${tokens[pos].type}`);
  return result;
}

function evaluateExpression(expr) {
  const cleaned = expr.replace(/\u00d7/g, '*').replace(/\u00f7/g, '/');
  const tokens = tokenize(cleaned);
  if (tokens.length === 0) throw new Error('Empty expression');
  return parseExpression(tokens);
}

function formatNumber(n) {
  if (isNaN(n)) return 'NaN';
  if (!isFinite(n)) return n > 0 ? 'Infinity' : '-Infinity';
  if (n === Math.floor(n) && Math.abs(n) < 1e15) return String(n);
  return parseFloat(n.toFixed(10)).toString();
}

// ---- Scientific functions ----

const SCIENTIFIC_FNS = {
  sin:       (v) => Math.sin(v * Math.PI / 180),
  cos:       (v) => Math.cos(v * Math.PI / 180),
  tan:       (v) => Math.tan(v * Math.PI / 180),
  asin:      (v) => { if (v < -1 || v > 1) throw new Error('Domain error'); return Math.asin(v) * 180 / Math.PI; },
  acos:      (v) => { if (v < -1 || v > 1) throw new Error('Domain error'); return Math.acos(v) * 180 / Math.PI; },
  atan:      (v) => Math.atan(v) * 180 / Math.PI,
  sqrt:      (v) => { if (v < 0) throw new Error('Cannot sqrt negative'); return Math.sqrt(v); },
  cbrt:      (v) => Math.cbrt(v),
  ln:        (v) => { if (v <= 0) throw new Error('ln requires positive input'); return Math.log(v); },
  log10:     (v) => { if (v <= 0) throw new Error('log10 requires positive input'); return Math.log10(v); },
  log2:      (v) => { if (v <= 0) throw new Error('log2 requires positive input'); return Math.log2(v); },
  abs:       (v) => Math.abs(v),
  exp:       (v) => Math.exp(v),
  inv:       (v) => { if (v === 0) throw new Error('Cannot divide by zero'); return 1 / v; },
  square:    (v) => v * v,
  cube:      (v) => v * v * v,
  percent:   (v) => v / 100,
  negate:    (v) => -v,
  factorial: (v) => {
    if (v < 0 || v !== Math.floor(v) || v > 170) throw new Error('Factorial requires integer 0-170');
    let r = 1; for (let i = 2; i <= v; i++) r *= i; return r;
  },
};

const CONSTANTS = {
  pi:    Math.PI,
  e:     Math.E,
  tau:   Math.PI * 2,
  phi:   1.618033988749895,
  sqrt2: Math.SQRT2,
};

// ---- Operator display symbols ----

const OP_SYMBOLS = { '*': '\u00d7', '/': '\u00f7' };
function opSymbol(op) { return OP_SYMBOLS[op] || op; }

// ---- Calculator Engine (State Machine) ----

class CalculatorEngine {
  constructor() {
    this.reset();
    this.history = [];
    this.maxHistory = 50;
  }

  reset() {
    this.expression = '';    // accumulated expression string (display form)
    this.display = '0';      // current number being typed / result
    this.lastResult = null;  // result of last evaluation (string)
    this.newInput = true;    // true = next digit replaces display
    this.justEvaluated = false; // true = equals was just pressed
    this._parenClosed = false;  // true = closing paren was just typed
  }

  _view() {
    return { expression: this.expression, display: this.display };
  }

  inputDigit(d) {
    if (this.justEvaluated) {
      // Starting fresh after an evaluation
      this.expression = '';
      this.justEvaluated = false;
    }
    if (this.newInput) {
      this.display = d;
      this.newInput = false;
    } else {
      this.display = (this.display === '0' && d !== '.') ? d : this.display + d;
    }
    return this._view();
  }

  inputDot() {
    if (this.justEvaluated) {
      this.expression = '';
      this.justEvaluated = false;
    }
    if (this.newInput) {
      this.display = '0.';
      this.newInput = false;
    } else if (!this.display.includes('.')) {
      this.display += '.';
    }
    return this._view();
  }

  inputOp(op) {
    this.justEvaluated = false;
    if (this.lastResult !== null && this.newInput) {
      // Chain from previous result: "8 + "
      this.expression = this.lastResult + ' ' + opSymbol(op) + ' ';
    } else if (this._parenClosed) {
      // After closing paren, expression already has the operand
      this.expression += ' ' + opSymbol(op) + ' ';
    } else {
      this.expression += this.display + ' ' + opSymbol(op) + ' ';
    }
    this.newInput = true;
    this.lastResult = null;
    this._parenClosed = false;
    return this._view();
  }

  inputParen(p) {
    if (this.justEvaluated) {
      this.expression = '';
      this.justEvaluated = false;
    }
    if (this.newInput && p === '(') {
      this.expression += p;
      this.display = '0';
      this.newInput = true;
    } else if (p === '(') {
      this.expression += this.display + ' \u00d7 ' + p;
      this.display = '0';
      this.newInput = true;
    } else {
      // Closing paren: append current display + ')'
      // Then mark that expression already has the operand
      this.expression += this.display + ')';
      this.newInput = true;
      this._parenClosed = true; // flag so inputOp doesn't re-append display
    }
    return this._view();
  }

  toggleSign() {
    if (this.display === '0') return this._view();
    this.display = this.display.startsWith('-')
      ? this.display.slice(1)
      : '-' + this.display;
    return this._view();
  }

  inputPercent() {
    const val = parseFloat(this.display);
    this.display = formatNumber(val / 100);
    return this._view();
  }

  backspace() {
    this.display = this.display.length > 1 ? this.display.slice(0, -1) : '0';
    return this._view();
  }

  clear() {
    this.reset();
    return this._view();
  }

  /**
   * Evaluate the current expression.
   * Returns { expression, display, result, error? }
   */
  evaluate() {
    // If we just evaluated and user pressed = again, return last result
    if (this.justEvaluated && this.lastResult !== null) {
      return { ...this._view(), result: this.lastResult };
    }

    // Build the raw expression from what's on screen
    const hadPendingOp = this.newInput && this.expression.trim().length > 0;
    const userExpr = hadPendingOp
      ? this.expression.trim()               // e.g. "5 +"
      : this.expression + this.display;       // e.g. "5 + 3"

    // Clean for evaluation
    let evalExpr = userExpr.replace(/\u00d7/g, '*').replace(/\u00f7/g, '/').trim();
    evalExpr = evalExpr.replace(/[+\-*/^%=]\s*$/, '').trim(); // strip trailing op or =

    if (!evalExpr) return { ...this._view(), result: null };

    try {
      const numResult = evaluateExpression(evalExpr);
      const result = formatNumber(numResult);

      // Display expression: show what the user typed + " ="
      const displayExpr = userExpr.replace(/[+\-*/\u00d7\u00f7^%]\s*$/, '').trim() + ' =';
      this.expression = displayExpr;
      this.display = result;
      this.lastResult = result;
      this.newInput = true;
      this.justEvaluated = true;

      this._addHistory(displayExpr, result);

      return { ...this._view(), result };
    } catch (err) {
      return { ...this._view(), error: err.message || 'Error' };
    }
  }

  /**
   * Apply a scientific function to the current display value.
   * Returns { expression, display, result, error? }
   */
  scientificFn(funcName) {
    const fn = SCIENTIFIC_FNS[funcName];
    if (!fn) return { ...this._view(), error: `Unknown function: ${funcName}` };

    const value = parseFloat(this.display);
    if (isNaN(value)) return { ...this._view(), error: 'Invalid input' };

    try {
      const numResult = fn(value);
      const result = formatNumber(numResult);
      const displayExpr = funcName + '(' + this.display + ') =';

      this.expression = displayExpr;
      this.display = result;
      this.lastResult = result;
      this.newInput = true;
      this.justEvaluated = true;

      this._addHistory(displayExpr, result);

      return { ...this._view(), result };
    } catch (err) {
      return { ...this._view(), error: err.message || 'Error' };
    }
  }

  insertConstant(name) {
    const val = CONSTANTS[name];
    if (val === undefined) return { ...this._view(), error: `Unknown constant: ${name}` };
    if (this.justEvaluated) {
      this.expression = '';
      this.justEvaluated = false;
    }
    this.display = formatNumber(val);
    this.newInput = false;
    return this._view();
  }

  _addHistory(expression, result) {
    this.history.push({ expression, result });
    if (this.history.length > this.maxHistory) this.history.shift();
  }

  getHistory() {
    return [...this.history];
  }

  clearHistory() {
    this.history = [];
  }
}

// ---- Exports (works in both Node.js and browser) ----

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CalculatorEngine,
    evaluateExpression,
    formatNumber,
    tokenize,
    parseExpression,
    SCIENTIFIC_FNS,
    CONSTANTS,
    opSymbol,
  };
}
