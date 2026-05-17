# Contributing to Fun Calc

Thanks for your interest in contributing! Here's how to get started.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/fun-calc.git`
3. Create a branch: `git checkout -b feature/your-feature`
4. Make your changes
5. Run tests: `node tests/engine.test.js`
6. Commit and push
7. Open a Pull Request

## Development Setup

### Browser mode (quick)

```bash
cd src && python3 -m http.server 1420
# Open http://localhost:1420
```

Requires internet for PixiJS CDN on first load.

### Tauri desktop mode

```bash
cd src-tauri && cargo tauri dev
```

## What to Contribute

- **New themes** — each theme is a full PixiJS canvas scene (see below)
- **Bug fixes** — check the Issues tab
- **Scientific functions** — add more math functions to `engine.js` + `engine.rs`
- **Theme improvements** — better animations, particle effects, interactions

## Adding a New Theme

Each theme is a **separate PixiJS application** that renders its own complete UI on canvas — not a CSS reskin.

1. Create `src/theme-yourname.js`
2. Extend `PixiTheme` and implement 5 methods:

```js
class YourTheme extends PixiTheme {
  _buildScene() {
    // Create all PIXI display objects: background, buttons, display area.
    // Set up click handlers that call this.digit(), this.op(), this.equals(), etc.
  }

  _updateDisplay(expr, display) {
    // Render the expression and current number/result on screen.
  }

  _onResult(result) {
    // Animate a successful calculation (fire, explosions, confetti, etc.)
  }

  _onError(message) {
    // Animate an error (shake, flash, crack, etc.)
  }

  _onClear() {
    // Animate a reset (rebuild, polish, fade, etc.)
  }
}
```

3. Add a `<script>` tag in `index.html` (before `app.js`)
4. Register the theme in `app.js` in the `themes` array:

```js
{
  id: 'yourname',
  name: 'Your Theme',
  icon: '🎨',
  description: 'What makes it unique.',
  color: '#ff00ff',
  ThemeClass: YourTheme,
}
```

### Theme Design Guidelines

- **Unique interaction model** — don't just restyle a button grid. Rethink how the user inputs numbers.
- **Meaningful animations** — every action (digit, operator, equals, error, clear) should have a distinct visual response.
- **Usable** — it still needs to work as a calculator. Don't sacrifice usability for aesthetics.
- **Self-contained** — all rendering happens on the PixiJS canvas. No external HTML/CSS needed.

## Code Style

- Vanilla JS, no frameworks, no bundlers
- Pure logic in `engine.js` — no DOM or PixiJS access
- Each theme file is self-contained with its own class
- Run tests before submitting PRs

## Testing

- Engine logic: add tests in `tests/engine.test.js`
- Rust modules: add tests as `#[cfg(test)] mod tests` blocks
- All tests must pass before merging

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). Be kind.
