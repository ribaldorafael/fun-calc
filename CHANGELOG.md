# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.0] - 2026-05-17

### Added
- Theme selection menu
- **Matrix theme** — no buttons; 16 rain columns (digits green, operators red, = white, C dim). Click a column to grab its character. Hover to highlight. Equals triggers cascade.
- **Odontology theme** — open mouth with tooth-shaped buttons (molars, canines, incisors), drill spark effects, X-ray display panel, cavity errors, polish sweep on clear
- **Dragon theme** — gold coin hoard, rune stone operators, cauldron equals with fire eruption, dragon flyby on big results
- PixiJS 7 integration — each theme is a full canvas application with its own interaction model
- `PixiTheme` base class (Strategy + Template Method patterns)
- Calculator engine (State Machine) with basic and scientific modes
- Recursive-descent expression parser (no eval, safe by design)
- Calculation history and keyboard support
- Sound effects (Web Audio API)
- Rust + Tauri 2 backend (math engine, parser, scientific functions)
- 254 unit tests (180 JS + 74 Rust)
- Community standards: README, LICENSE (MIT), CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, issue/PR templates
