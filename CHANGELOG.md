# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.2.0] - 2026-05-17

### Changed
- **Complete theme rewrite** — replaced CSS-skinned HTML button grids with full PixiJS canvas-rendered calculators. Each theme is now its own visual world with unique interaction model.

### Added
- PixiJS 7 integration (loaded via CDN)
- `PixiTheme` base class (Strategy + Template Method patterns)
- **Matrix theme** — rain columns, digit catching, flying characters, cascade equals animation
- **Odontology theme** — open mouth with tooth-shaped buttons, drill spark effects, X-ray display panel, cavity errors
- **Dragon theme** — gold coin hoard, rune stone operators, cauldron equals with fire eruption, dragon flyby

### Removed
- Old CSS-only themes (Retro Arcade, Destruction, Living Creature, Rube Goldberg, Gravity, RPG Battle)
- HTML-based calculator button grid (replaced by per-theme PixiJS rendering)

## [0.1.0] - 2026-05-15

### Added
- Theme selection menu
- Calculator engine with basic and scientific modes
- Expression parser (recursive-descent, no eval)
- Calculation history and keyboard support
- Sound effects (Web Audio API)
- Rust backend with Tauri 2
- 194 unit tests (120 JS + 74 Rust)
