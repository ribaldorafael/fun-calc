# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | Yes       |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do not** open a public issue
2. Email the maintainer or use GitHub's private vulnerability reporting feature
3. Include a description of the vulnerability and steps to reproduce

You can expect an initial response within 48 hours.

## Scope

This is a client-side calculator application. The primary security concerns are:

- Expression evaluation (injection via the parser)
- Tauri IPC command surface
- Dependencies (Rust crates, if network-fetched)

The browser fallback mode uses a custom recursive-descent parser (not `eval`) to prevent code injection.
