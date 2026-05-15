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
```

### Tauri desktop mode

```bash
cd src-tauri && cargo tauri dev
```

## What to Contribute

- **New themes** — Create a new calculator theme in `themes.js`
- **Easter eggs** — Add fun surprises in `easter-eggs.js`
- **Bug fixes** — Check the Issues tab
- **Scientific functions** — Add more math functions to the engine
- **Animations** — Make existing themes more expressive

## Adding a New Theme

1. Add your theme class in `src/themes.js`
2. Register it with `ThemeRegistry.register('your-id', { ... })`
3. Implement the theme interface: `activate`, `deactivate`, `onDigit`, `onOperator`, `onEquals`, `onError`, `onClear`, `onIdle`, `getOverlayHTML`
4. Add CSS via `injectCSS()` inside `activate()`

## Code Style

- Vanilla JS only — no frameworks, no bundlers
- Keep functions small and focused
- Pure logic in `engine.js` — no DOM access
- Side effects (DOM, audio, canvas) in `app.js` and theme files
- Run tests before submitting PRs

## Testing

- Add unit tests for any new engine logic in `tests/engine.test.js`
- Add Rust tests as `#[cfg(test)] mod tests` in the relevant module
- All tests must pass before merging

## Commit Messages

Use clear, descriptive commit messages:

```
Add dragon theme with fire-breath animation
Fix trailing operator bug in expression evaluator
Add factorial tests for edge cases
```

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). Be kind.
