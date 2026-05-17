# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.3.0] - 2026-05-17

### Fixed
- Parentheses bug — `inputParen(')')` followed by `inputOp` would duplicate the operand in the expression
- Repeated equals bug — pressing `=` twice would crash the parser on the `=` character left in the expression

### Added
- 60 new JS unit tests (180 total): tokenizer, parentheses, multi-digit numbers, multiple operators, operator chaining from result, repeated equals, dot after eval, negative numbers, history cap, scientific function history, clear after error, backspace edge cases, evaluate on fresh state
- Added `_parenClosed` flag to engine for correct paren + operator sequencing

### Changed
- Test badge updated to 254 (180 JS + 74 Rust)

## [0.2.0] - 2026-05-17

### Changed
- **Complete theme rewrite** — replaced CSS-skinned HTML button grids with full PixiJS canvas-rendered calculators. Each theme is now its own visual world with a unique interaction model.
- **Matrix theme rebuilt from scratch** — no buttons at all. 16 rain columns, each raining a single character. Click a column to grab its character.

### Added
- PixiJS 7 integration (loaded via CDN)
- `PixiTheme` base class (Strategy + Template Method patterns)
- **Matrix theme** — 16 rain columns (digits green, operators red, = white, C dim). Click a column to input. Hover to highlight. Equals triggers cascade.
- **Odontology theme** — open mouth with tooth-shaped buttons (molars, canines, incisors), drill spark effects, X-ray display panel, cavity errors, polish sweep on clear
- **Dragon theme** — gold coin hoard, rune stone operators, cauldron equals with fire eruption, dragon flyby on big results

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
