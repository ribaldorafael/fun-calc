/**
 * Unit tests for CalculatorEngine (pure logic — no DOM, no browser).
 * Runs with Node.js: node tests/engine.test.js
 */

const {
  CalculatorEngine,
  evaluateExpression,
  formatNumber,
  tokenize,
  SCIENTIFIC_FNS,
  CONSTANTS,
  opSymbol,
} = require('../src/engine.js');

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, msg) {
  if (condition) {
    passed++;
  } else {
    failed++;
    failures.push(msg);
    console.error(`  FAIL: ${msg}`);
  }
}

function assertEq(actual, expected, msg) {
  const ok = actual === expected;
  if (!ok) msg += ` (got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)})`;
  assert(ok, msg);
}

function assertClose(actual, expected, msg, tolerance = 1e-10) {
  const ok = Math.abs(actual - expected) < tolerance;
  if (!ok) msg += ` (got ${actual}, expected ~${expected})`;
  assert(ok, msg);
}

function assertThrows(fn, msg) {
  try { fn(); assert(false, msg + ' (did not throw)'); }
  catch (_) { passed++; }
}

function section(name) { console.log(`\n--- ${name} ---`); }

// ========================================
// Expression evaluator
// ========================================
section('evaluateExpression');

assertEq(evaluateExpression('42'), 42, 'single number');
assertEq(evaluateExpression('2 + 3'), 5, 'addition');
assertEq(evaluateExpression('10 - 3'), 7, 'subtraction');
assertEq(evaluateExpression('4 * 5'), 20, 'multiplication');
assertEq(evaluateExpression('15 / 3'), 5, 'division');
assertEq(evaluateExpression('2 + 3 * 4'), 14, 'precedence: * over +');
assertEq(evaluateExpression('(2 + 3) * 4'), 20, 'parentheses');
assertEq(evaluateExpression('((2 + 3) * (4 - 1))'), 15, 'nested parens');
assertEq(evaluateExpression('2 ^ 10'), 1024, 'power');
assertEq(evaluateExpression('17 % 5'), 2, 'modulo');
assertEq(evaluateExpression('-5'), -5, 'unary minus');
assertEq(evaluateExpression('+5'), 5, 'unary plus');
assertEq(evaluateExpression('3 + -2'), 1, 'negative in expr');
assertEq(evaluateExpression('5 * -3'), -15, 'multiply by negative');
assertClose(evaluateExpression('0.1 + 0.2'), 0.3, 'decimal precision');
assertEq(evaluateExpression('(10 + 5) * 2 - 3 ^ 2'), 21, 'complex expr');
assertEq(evaluateExpression('100 / 4 / 5'), 5, 'left-to-right division');
assertEq(evaluateExpression('2 + 3 + 4'), 9, 'chained addition');
assertThrows(() => evaluateExpression('5 / 0'), 'division by zero throws');
assertThrows(() => evaluateExpression(''), 'empty expr throws');
assertThrows(() => evaluateExpression('5 +'), 'trailing operator throws');
assertThrows(() => evaluateExpression('(2 + 3'), 'missing paren throws');
assertThrows(() => evaluateExpression('abc'), 'invalid chars throw');

// Unicode operators
assertEq(evaluateExpression('6 \u00d7 3'), 18, 'unicode multiply');
assertEq(evaluateExpression('6 \u00f7 3'), 2, 'unicode divide');

// ========================================
// formatNumber
// ========================================
section('formatNumber');

assertEq(formatNumber(42), '42', 'integer');
assertEq(formatNumber(-7), '-7', 'negative integer');
assertEq(formatNumber(0), '0', 'zero');
assertEq(formatNumber(3.14), '3.14', 'decimal');
assertEq(formatNumber(2.5), '2.5', 'strips trailing zeros');
assertEq(formatNumber(NaN), 'NaN', 'NaN');
assertEq(formatNumber(Infinity), 'Infinity', 'positive inf');
assertEq(formatNumber(-Infinity), '-Infinity', 'negative inf');
assertEq(formatNumber(1000000), '1000000', 'large int');

// ========================================
// Scientific functions
// ========================================
section('SCIENTIFIC_FNS');

assertClose(SCIENTIFIC_FNS.sin(0), 0, 'sin(0)');
assertClose(SCIENTIFIC_FNS.sin(90), 1, 'sin(90)');
assertClose(SCIENTIFIC_FNS.cos(0), 1, 'cos(0)');
assertClose(SCIENTIFIC_FNS.cos(90), 0, 'cos(90)');
assertClose(SCIENTIFIC_FNS.tan(45), 1, 'tan(45)');
assertEq(SCIENTIFIC_FNS.sqrt(25), 5, 'sqrt(25)');
assertThrows(() => SCIENTIFIC_FNS.sqrt(-4), 'sqrt(-4) throws');
assertClose(SCIENTIFIC_FNS.cbrt(27), 3, 'cbrt(27)');
assertClose(SCIENTIFIC_FNS.ln(Math.E), 1, 'ln(e)');
assertThrows(() => SCIENTIFIC_FNS.ln(-1), 'ln(-1) throws');
assertEq(SCIENTIFIC_FNS.log10(100), 2, 'log10(100)');
assertEq(SCIENTIFIC_FNS.log2(8), 3, 'log2(8)');
assertEq(SCIENTIFIC_FNS.square(7), 49, 'square(7)');
assertEq(SCIENTIFIC_FNS.cube(3), 27, 'cube(3)');
assertEq(SCIENTIFIC_FNS.inv(4), 0.25, 'inv(4)');
assertThrows(() => SCIENTIFIC_FNS.inv(0), 'inv(0) throws');
assertEq(SCIENTIFIC_FNS.factorial(5), 120, 'factorial(5)');
assertEq(SCIENTIFIC_FNS.factorial(0), 1, 'factorial(0)');
assertThrows(() => SCIENTIFIC_FNS.factorial(-1), 'factorial(-1) throws');
assertThrows(() => SCIENTIFIC_FNS.factorial(3.5), 'factorial(3.5) throws');
assertClose(SCIENTIFIC_FNS.exp(1), Math.E, 'exp(1)');
assertEq(SCIENTIFIC_FNS.abs(-42), 42, 'abs(-42)');
assertEq(SCIENTIFIC_FNS.percent(50), 0.5, 'percent(50)');
assertEq(SCIENTIFIC_FNS.negate(5), -5, 'negate(5)');
assertClose(SCIENTIFIC_FNS.asin(1), 90, 'asin(1)');
assertThrows(() => SCIENTIFIC_FNS.asin(2), 'asin(2) throws');
assertClose(SCIENTIFIC_FNS.acos(0), 90, 'acos(0)');
assertClose(SCIENTIFIC_FNS.atan(1), 45, 'atan(1)');

// ========================================
// Constants
// ========================================
section('CONSTANTS');

assertClose(CONSTANTS.pi, Math.PI, 'pi');
assertClose(CONSTANTS.e, Math.E, 'e');
assertClose(CONSTANTS.tau, Math.PI * 2, 'tau');
assertClose(CONSTANTS.phi, 1.618033988749895, 'phi');
assertClose(CONSTANTS.sqrt2, Math.SQRT2, 'sqrt2');

// ========================================
// opSymbol
// ========================================
section('opSymbol');

assertEq(opSymbol('*'), '\u00d7', '* → ×');
assertEq(opSymbol('/'), '\u00f7', '/ → ÷');
assertEq(opSymbol('+'), '+', '+ unchanged');
assertEq(opSymbol('-'), '-', '- unchanged');
assertEq(opSymbol('^'), '^', '^ unchanged');

// ========================================
// CalculatorEngine — state machine
// ========================================
section('CalculatorEngine — basic operations');

{
  const calc = new CalculatorEngine();

  // Fresh state
  let v = calc._view();
  assertEq(v.display, '0', 'initial display');
  assertEq(v.expression, '', 'initial expression');

  // Type "5"
  v = calc.inputDigit('5');
  assertEq(v.display, '5', 'after typing 5');

  // Press "+"
  v = calc.inputOp('+');
  assertEq(v.expression, '5 + ', 'expression after +');

  // Type "3"
  v = calc.inputDigit('3');
  assertEq(v.display, '3', 'after typing 3');

  // Press "="
  const result = calc.evaluate();
  assertEq(result.result, '8', '5+3=8');
  assertEq(result.display, '8', 'display shows 8');
  assert(!result.error, '5+3 no error');
}

section('CalculatorEngine — chained calculations (THE BUG FIX)');

{
  const calc = new CalculatorEngine();

  // 5 + 3 = 8
  calc.inputDigit('5');
  calc.inputOp('+');
  calc.inputDigit('3');
  let r = calc.evaluate();
  assertEq(r.result, '8', 'first eval: 5+3=8');

  // Now type 2 + 4 = 6 (should start fresh, NOT carry "5 + 3 =")
  calc.inputDigit('2');
  let v = calc._view();
  assertEq(v.expression, '', 'expression cleared after new input post-eval');
  assertEq(v.display, '2', 'display shows 2');

  calc.inputOp('+');
  v = calc._view();
  assertEq(v.expression, '2 + ', 'new expression is "2 + "');

  calc.inputDigit('4');
  r = calc.evaluate();
  assertEq(r.result, '6', 'second eval: 2+4=6');
  assert(!r.error, 'no error on chained calc');
}

section('CalculatorEngine — chain from result');

{
  const calc = new CalculatorEngine();

  // 10 + 5 = 15, then + 3 = 18
  calc.inputDigit('1');
  calc.inputDigit('0');
  calc.inputOp('+');
  calc.inputDigit('5');
  let r = calc.evaluate();
  assertEq(r.result, '15', '10+5=15');

  // Press + immediately (chaining from result)
  calc.inputOp('+');
  let v = calc._view();
  assertEq(v.expression, '15 + ', 'chains from result: "15 + "');

  calc.inputDigit('3');
  r = calc.evaluate();
  assertEq(r.result, '18', '15+3=18');
}

section('CalculatorEngine — trailing operator');

{
  const calc = new CalculatorEngine();
  calc.inputDigit('5');
  calc.inputOp('+');
  // Press = without second operand — should evaluate "5"
  const r = calc.evaluate();
  assertEq(r.result, '5', 'trailing op stripped: 5+ → 5');
  assert(!r.error, 'no error for trailing op');
}

section('CalculatorEngine — clear');

{
  const calc = new CalculatorEngine();
  calc.inputDigit('9');
  calc.inputOp('*');
  calc.inputDigit('3');
  calc.clear();
  const v = calc._view();
  assertEq(v.display, '0', 'clear resets display');
  assertEq(v.expression, '', 'clear resets expression');
}

section('CalculatorEngine — toggle sign');

{
  const calc = new CalculatorEngine();
  calc.inputDigit('5');
  let v = calc.toggleSign();
  assertEq(v.display, '-5', 'negate 5');
  v = calc.toggleSign();
  assertEq(v.display, '5', 'negate back');
  // toggling 0 does nothing
  calc.clear();
  v = calc.toggleSign();
  assertEq(v.display, '0', 'toggle 0 stays 0');
}

section('CalculatorEngine — decimal input');

{
  const calc = new CalculatorEngine();
  calc.inputDigit('3');
  calc.inputDot();
  calc.inputDigit('1');
  calc.inputDigit('4');
  assertEq(calc._view().display, '3.14', 'decimal input');

  // Second dot ignored
  calc.inputDot();
  assertEq(calc._view().display, '3.14', 'second dot ignored');
}

section('CalculatorEngine — backspace');

{
  const calc = new CalculatorEngine();
  calc.inputDigit('1');
  calc.inputDigit('2');
  calc.inputDigit('3');
  calc.backspace();
  assertEq(calc._view().display, '12', 'backspace removes last');
  calc.backspace();
  assertEq(calc._view().display, '1', 'backspace again');
  calc.backspace();
  assertEq(calc._view().display, '0', 'backspace to zero');
}

section('CalculatorEngine — percent');

{
  const calc = new CalculatorEngine();
  calc.inputDigit('5');
  calc.inputDigit('0');
  calc.inputPercent();
  assertEq(calc._view().display, '0.5', '50% = 0.5');
}

section('CalculatorEngine — scientific functions');

{
  const calc = new CalculatorEngine();
  calc.inputDigit('9');
  const r = calc.scientificFn('sqrt');
  assertEq(r.result, '3', 'sqrt(9)=3');
  assert(!r.error, 'no error');
}

{
  const calc = new CalculatorEngine();
  calc.inputDigit('5');
  const r = calc.scientificFn('square');
  assertEq(r.result, '25', 'square(5)=25');
}

{
  const calc = new CalculatorEngine();
  const r = calc.scientificFn('sqrt'); // sqrt(0)
  assertEq(r.result, '0', 'sqrt(0)=0');
}

{
  const calc = new CalculatorEngine();
  calc.inputDigit('5');
  calc.toggleSign();
  const r = calc.scientificFn('sqrt');
  assert(r.error, 'sqrt(-5) returns error');
}

{
  const calc = new CalculatorEngine();
  const r = calc.scientificFn('nonexistent');
  assert(r.error, 'unknown function returns error');
}

section('CalculatorEngine — constants');

{
  const calc = new CalculatorEngine();
  const v = calc.insertConstant('pi');
  assert(v.display.startsWith('3.14159'), 'pi constant');
}

{
  const calc = new CalculatorEngine();
  const v = calc.insertConstant('unknown');
  assert(v.error, 'unknown constant returns error');
}

section('CalculatorEngine — history');

{
  const calc = new CalculatorEngine();
  assertEq(calc.getHistory().length, 0, 'history starts empty');

  calc.inputDigit('2');
  calc.inputOp('+');
  calc.inputDigit('3');
  calc.evaluate();
  assertEq(calc.getHistory().length, 1, 'history has 1 entry');
  assertEq(calc.getHistory()[0].result, '5', 'history result is 5');

  calc.clearHistory();
  assertEq(calc.getHistory().length, 0, 'history cleared');
}

section('CalculatorEngine — division by zero');

{
  const calc = new CalculatorEngine();
  calc.inputDigit('5');
  calc.inputOp('/');
  calc.inputDigit('0');
  const r = calc.evaluate();
  assert(r.error, 'division by zero shows error');
}

section('CalculatorEngine — leading zero replacement');

{
  const calc = new CalculatorEngine();
  calc.inputDigit('0');
  calc.inputDigit('5');
  assertEq(calc._view().display, '5', 'leading zero replaced');
}

section('CalculatorEngine — dot on fresh input');

{
  const calc = new CalculatorEngine();
  calc.inputDot();
  assertEq(calc._view().display, '0.', 'dot on fresh = 0.');
  calc.inputDigit('5');
  assertEq(calc._view().display, '0.5', 'then 5 = 0.5');
}

section('CalculatorEngine — evaluate after sci fn then new calc');

{
  const calc = new CalculatorEngine();
  calc.inputDigit('9');
  calc.scientificFn('sqrt'); // = 3

  // Now type 4 + 5 =
  calc.inputDigit('4');
  assertEq(calc._view().expression, '', 'expression cleared after sci fn + new digit');
  calc.inputOp('+');
  calc.inputDigit('5');
  const r = calc.evaluate();
  assertEq(r.result, '9', '4+5=9 after sci fn');
}

// ========================================
// Tokenizer
// ========================================
section('tokenize');

{
  const t = tokenize('42');
  assertEq(t.length, 1, 'single number: 1 token');
  assertEq(t[0].type, 'NUMBER', 'token type is NUMBER');
  assertEq(t[0].value, 42, 'token value is 42');
}
{
  const t = tokenize('2 + 3 * 4');
  assertEq(t.length, 5, '2+3*4: 5 tokens');
  assertEq(t[1].type, 'PLUS', 'second token is PLUS');
  assertEq(t[3].type, 'MULTIPLY', 'fourth token is MULTIPLY');
}
{
  const t = tokenize('(1.5)');
  assertEq(t.length, 3, '(1.5): 3 tokens');
  assertEq(t[0].type, 'LPAREN', 'first is LPAREN');
  assertEq(t[1].value, 1.5, 'number is 1.5');
  assertEq(t[2].type, 'RPAREN', 'last is RPAREN');
}
assertThrows(() => tokenize('2 & 3'), 'invalid char throws');
{
  const t = tokenize('');
  assertEq(t.length, 0, 'empty string: 0 tokens');
}
{
  const t = tokenize('10 % 3');
  assertEq(t[1].type, 'MODULO', 'modulo token');
}
{
  const t = tokenize('2 ^ 8');
  assertEq(t[1].type, 'POWER', 'power token');
}

// ========================================
// Expression evaluator — additional edge cases
// ========================================
section('evaluateExpression — edge cases');

assertEq(evaluateExpression('0'), 0, 'zero');
assertEq(evaluateExpression('0.5'), 0.5, 'bare decimal');
assertEq(evaluateExpression('((((1))))'), 1, 'deeply nested parens');
assertEq(evaluateExpression('2 * (3 + 4) * (5 - 1)'), 56, 'multiple paren groups');
assertEq(evaluateExpression('10 - 3 - 2'), 5, 'left-to-right subtraction');
assertEq(evaluateExpression('1000000'), 1000000, 'large number');
assertEq(evaluateExpression('-(-5)'), 5, 'double negative');
assertThrows(() => evaluateExpression('10 % 0'), 'modulo by zero throws');
assertThrows(() => evaluateExpression(')'), 'lone rparen throws');
assertThrows(() => evaluateExpression('* 5'), 'leading operator throws');
assertClose(evaluateExpression('2.5 * 4.2'), 10.5, 'decimal multiply');
assertEq(evaluateExpression('2 ^ 0'), 1, 'power of zero');
assertEq(evaluateExpression('0 ^ 5'), 0, 'zero to power');
assertEq(evaluateExpression('1 + 2 + 3 + 4 + 5'), 15, 'many additions');

// ========================================
// formatNumber — additional edge cases
// ========================================
section('formatNumber — edge cases');

assertEq(formatNumber(-0), '0', 'negative zero');
assertEq(formatNumber(0.1), '0.1', 'small decimal');
assertEq(formatNumber(0.000001), '0.000001', 'very small');
assertEq(formatNumber(999999999999999), '999999999999999', 'max safe-ish integer');
assertEq(formatNumber(-3.14), '-3.14', 'negative decimal');
assertEq(formatNumber(100.0), '100', 'whole number with .0');

// ========================================
// CalculatorEngine — parentheses
// ========================================
section('CalculatorEngine — parentheses');

{
  const calc = new CalculatorEngine();
  // (2 + 3) * 4 = 20
  calc.inputParen('(');
  calc.inputDigit('2');
  calc.inputOp('+');
  calc.inputDigit('3');
  calc.inputParen(')');
  calc.inputOp('*');
  calc.inputDigit('4');
  const r = calc.evaluate();
  assertEq(r.result, '20', '(2+3)*4=20 via parens');
}

// ========================================
// CalculatorEngine — multi-digit numbers
// ========================================
section('CalculatorEngine — multi-digit');

{
  const calc = new CalculatorEngine();
  calc.inputDigit('1');
  calc.inputDigit('2');
  calc.inputDigit('3');
  calc.inputOp('+');
  calc.inputDigit('4');
  calc.inputDigit('5');
  calc.inputDigit('6');
  const r = calc.evaluate();
  assertEq(r.result, '579', '123+456=579');
}

// ========================================
// CalculatorEngine — multiple operators
// ========================================
section('CalculatorEngine — multiple operators');

{
  const calc = new CalculatorEngine();
  calc.inputDigit('5');
  calc.inputOp('+');
  calc.inputDigit('3');
  calc.inputOp('-');
  calc.inputDigit('2');
  const r = calc.evaluate();
  assertEq(r.result, '6', '5+3-2=6');
}

{
  const calc = new CalculatorEngine();
  calc.inputDigit('2');
  calc.inputOp('*');
  calc.inputDigit('3');
  calc.inputOp('+');
  calc.inputDigit('4');
  const r = calc.evaluate();
  assertEq(r.result, '10', '2*3+4=10 (precedence)');
}

// ========================================
// CalculatorEngine — operator right after result
// ========================================
section('CalculatorEngine — op after result');

{
  const calc = new CalculatorEngine();
  calc.inputDigit('8');
  calc.evaluate(); // = 8

  // Now press * 2 = (should be 8 * 2 = 16)
  calc.inputOp('*');
  const v = calc._view();
  assertEq(v.expression, '8 \u00d7 ', 'op chains from result');
  calc.inputDigit('2');
  const r = calc.evaluate();
  assertEq(r.result, '16', '8*2=16 after chain');
}

// ========================================
// CalculatorEngine — repeated equals
// ========================================
section('CalculatorEngine — repeated equals');

{
  const calc = new CalculatorEngine();
  calc.inputDigit('5');
  const r1 = calc.evaluate();
  assertEq(r1.result, '5', 'first = on bare number');
  const r2 = calc.evaluate();
  assertEq(r2.result, '5', 'second = still 5');
  assert(!r2.error, 'no error on repeated =');
}

// ========================================
// CalculatorEngine — dot after eval
// ========================================
section('CalculatorEngine — dot after eval');

{
  const calc = new CalculatorEngine();
  calc.inputDigit('5');
  calc.evaluate();

  // Type .5 (should start fresh)
  calc.inputDot();
  assertEq(calc._view().display, '0.', 'dot after eval starts 0.');
  assertEq(calc._view().expression, '', 'expression cleared');
  calc.inputDigit('5');
  assertEq(calc._view().display, '0.5', 'display shows 0.5');
}

// ========================================
// CalculatorEngine — negative number in expression
// ========================================
section('CalculatorEngine — negative numbers');

{
  const calc = new CalculatorEngine();
  calc.inputDigit('5');
  calc.toggleSign(); // -5
  calc.inputOp('+');
  calc.inputDigit('3');
  const r = calc.evaluate();
  assertEq(r.result, '-2', '-5+3=-2');
}

// ========================================
// CalculatorEngine — history max cap
// ========================================
section('CalculatorEngine — history cap');

{
  const calc = new CalculatorEngine();
  for (let i = 0; i < 55; i++) {
    calc.inputDigit(String(i % 10));
    calc.evaluate();
  }
  assertEq(calc.getHistory().length, 50, 'history capped at 50');
  // First entries should have been evicted
  assertEq(calc.getHistory()[0].result, '5', 'oldest entry is 5th calculation');
}

// ========================================
// CalculatorEngine — scientificFn saves history
// ========================================
section('CalculatorEngine — sci fn history');

{
  const calc = new CalculatorEngine();
  calc.clearHistory();
  calc.inputDigit('4');
  calc.scientificFn('square');
  assertEq(calc.getHistory().length, 1, 'sci fn adds to history');
  assertEq(calc.getHistory()[0].result, '16', 'sci fn result in history');
  assert(calc.getHistory()[0].expression.includes('square'), 'sci fn name in expression');
}

// ========================================
// CalculatorEngine — clear after error
// ========================================
section('CalculatorEngine — clear after error');

{
  const calc = new CalculatorEngine();
  calc.inputDigit('5');
  calc.inputOp('/');
  calc.inputDigit('0');
  const r = calc.evaluate();
  assert(r.error, 'got error');

  // Clear should fully reset
  const v = calc.clear();
  assertEq(v.display, '0', 'display reset after error+clear');
  assertEq(v.expression, '', 'expression reset after error+clear');

  // Should be able to calculate again
  calc.inputDigit('3');
  calc.inputOp('+');
  calc.inputDigit('2');
  const r2 = calc.evaluate();
  assertEq(r2.result, '5', 'works after error+clear');
}

// ========================================
// CalculatorEngine — backspace edge cases
// ========================================
section('CalculatorEngine — backspace edge cases');

{
  const calc = new CalculatorEngine();
  // Backspace on initial '0' stays '0'
  calc.backspace();
  assertEq(calc._view().display, '0', 'backspace on 0 stays 0');
}

{
  const calc = new CalculatorEngine();
  calc.inputDigit('5');
  calc.inputDot();
  calc.backspace(); // removes dot
  assertEq(calc._view().display, '5', 'backspace removes dot');
}

// ========================================
// CalculatorEngine — evaluate empty
// ========================================
section('CalculatorEngine — evaluate empty/zero');

{
  const calc = new CalculatorEngine();
  // Fresh calc, press = (display is '0', expression is '')
  const r = calc.evaluate();
  assertEq(r.result, '0', 'eval on fresh state returns 0');
  assert(!r.error, 'no error');
}

// ========================================
// Summary
// ========================================
console.log(`\n========================================`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failures.length > 0) {
  console.log(`\nFailures:`);
  failures.forEach(f => console.log(`  - ${f}`));
}
console.log(`========================================\n`);

process.exit(failed > 0 ? 1 : 0);
