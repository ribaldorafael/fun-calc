# Fun Calc 🎮

A wildly unconventional calculator built with **Rust + Tauri** and vanilla JS. Eight themed calculators — each with unique animations, physics, and personality.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Rust](https://img.shields.io/badge/Rust-1.70%2B-orange.svg)](https://www.rust-lang.org/)
[![Tauri](https://img.shields.io/badge/Tauri-2.0-24C8D8.svg)](https://tauri.app/)
[![Tests](https://img.shields.io/badge/tests-194%20passing-brightgreen.svg)](#testing)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey.svg)](#getting-started)
[![JS](https://img.shields.io/badge/JS-Vanilla%20ES6-F7DF1E.svg)](src/)

---

## Screenshots

<!-- Add your screenshots here -->
<p align="center">
  <img src="docs/screenshots/menu.png" alt="Theme Select Menu" width="400" />
</p>

<details>
<summary><strong>View all themes</strong></summary>

| Theme | Preview |
|---|---|
| Retro Arcade | <img src="docs/screenshots/retro.png" width="300" /> |
| Destruction | <img src="docs/screenshots/destruction.png" width="300" /> |
| Living Creature | <img src="docs/screenshots/living.png" width="300" /> |
| Rube Goldberg | <img src="docs/screenshots/rube.png" width="300" /> |
| Gravity | <img src="docs/screenshots/gravity.png" width="300" /> |
| RPG Battle | <img src="docs/screenshots/rpg.png" width="300" /> |
| Odontology | <img src="docs/screenshots/odonto.png" width="300" /> |
| Dragon | <img src="docs/screenshots/dragon.png" width="300" /> |

</details>

---

## Themes

| # | Theme | What Makes It Special |
|---|---|---|
| 1 | **Retro Arcade** 👾 | CRT scanlines, pixel fonts, 8-bit sounds, confetti on big numbers |
| 2 | **Destruction** 💥 | Buttons shatter and explode when used. AC rebuilds them |
| 3 | **Living Creature** 🐸 | Eyes follow clicks, mouth chews numbers, bounces on results, turns sick on errors |
| 4 | **Rube Goldberg** ⚙️ | Numbers fall through gears and funnels before the result pops out |
| 5 | **Gravity** 🌍 | Digits fall with physics, = causes shockwave collision |
| 6 | **RPG Battle** ⚔️ | Operators are attacks, earn XP, level up, slash animations |
| 7 | **Odontology** 🦷 | Clean clinical theme, drill animations, sparkles on results, "CAVITY!" on errors |
| 8 | **Dragon** 🐉 | Fire particles, ember glow, fire-breath on =, dragon flyby on big results |

All themes share the same full-featured calculator engine (basic + scientific + history).

---

## Getting Started

### Browser Mode (no Rust needed)

```bash
cd src
python3 -m http.server 1420
# Open http://localhost:1420
```

### Desktop App (Rust + Tauri)

```bash
# Prerequisites: Rust 1.70+, Node.js
cd src-tauri
cargo tauri dev
```

### Build for Production

```bash
cd src-tauri
cargo tauri build
# Output: src-tauri/target/release/bundle/
```

---

## Architecture

```
src/
  index.html         Single-page app with menu + calculator
  engine.js          Calculator engine (pure logic, no DOM) — State Machine pattern
  audio.js           Web Audio API sound effects — Encapsulation
  particles.js       Canvas particle system — Observer pattern
  easter-eggs.js     Fun effect triggers — Strategy pattern
  themes.js          8 theme definitions — Strategy pattern (ThemeRegistry)
  app.js             Thin UI layer wiring everything — Mediator pattern
  style.css          Base styles + menu + theme overrides

src-tauri/
  src/
    main.rs          Tauri app bootstrap
    engine.rs        Math formatting, scientific functions, constants
    parser.rs        Tokenizer + recursive-descent expression evaluator
    commands.rs      Tauri command handlers (thin wrappers)
  Cargo.toml         Rust dependencies
  tauri.conf.json    Tauri window/app configuration

tests/
  engine.test.js     120 JS unit tests for the calculator engine
```

### Design Patterns Used

- **State Machine** — Calculator engine alternates between INPUT and RESULT phases
- **Strategy** — Each theme implements the same interface with different behavior
- **Mediator** — `app.js` coordinates engine, audio, particles, themes, and DOM
- **Observer** — Particle system reacts to events from the UI
- **Registry** — `ThemeRegistry` stores and retrieves themes by ID

---

## Testing

### JavaScript (120 tests)

```bash
node tests/engine.test.js
```

Covers: expression evaluator, number formatting, scientific functions, constants, calculator state machine (chaining, trailing operators, sign toggle, history, etc.)

### Rust (74 tests)

```bash
cd src-tauri
cargo test

# Or run modules standalone:
rustc --edition 2021 src/parser.rs --test -o /tmp/parser_test && /tmp/parser_test
rustc --edition 2021 src/engine.rs --test -o /tmp/engine_test && /tmp/engine_test
```

Covers: tokenizer, recursive-descent parser, operator precedence, parentheses, scientific functions, domain errors, formatting edge cases.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Security

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities.

## Code of Conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE) — do whatever you want with it.
