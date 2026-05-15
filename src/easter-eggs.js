/**
 * EasterEggs — checks calculation results and triggers fun effects.
 * Strategy pattern: each egg is a check function that returns an action or null.
 */
const EasterEggs = {
  _eggs: [
    // 42 — The Answer
    {
      check: (num) => num === 42,
      action: 'rainbow',
      title: 'The Answer to Life, the Universe, and Everything',
    },
    // Classic
    {
      check: (num, str) => str === '80085' || str === '58008',
      action: 'confetti',
      count: 50,
    },
    // nice
    {
      check: (num) => num === 69 || num === 420,
      action: 'toast',
      message: 'nice',
    },
    // Big numbers get confetti
    {
      check: (num) => Math.abs(num) >= 1000000,
      action: 'confetti',
      count: 30,
    },
    // Negative results — sad rain
    {
      check: (num) => num < 0,
      action: 'rain',
    },
    // Zero floats away
    {
      check: (num, str, exprLen) => num === 0 && exprLen > 1,
      action: 'float-away',
    },
  ],

  /**
   * Check a result against all easter eggs.
   * Returns an array of triggered actions (may be empty).
   */
  check(resultStr, expressionLength) {
    const num = parseFloat(resultStr);
    if (isNaN(num)) return [];
    return this._eggs
      .filter(egg => egg.check(num, resultStr, expressionLength))
      .map(egg => ({ action: egg.action, message: egg.message, title: egg.title, count: egg.count }));
  },
};
