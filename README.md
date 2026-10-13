# QA Copilot — Open-Source Next-Gen Testing Framework

<div align="center">**Don't just use Playwright — build the next AI-native testing framework. Multi-language, self-healing, natural-language steps, plugins, cloud runner.**</div>

## What it does
- **AI-native**: self-healing locators, test generation from natural language, NL test steps.
- **Multi-language**: TypeScript, Python, Java, Go, Rust.
- **Record / replay**: chromium recorder generates the spec.
- **Built-in**: visual regression, API testing, performance, accessibility (axe-core).
- **Plugin ecosystem**: `@qa-copilot/playwright`, `/jest`, `/pytest`, `/vscode`, `/visual`.
- **CI/CD integrations** + cloud runner (parallel + sharded).

## Architecture
| Layer | Tech |
|-------|------|
| Core | TypeScript + Rust (fast execution layer) |
| AI | LLM APIs (NL→test, self-heal, generation) |
| Visual | OpenCV (pixel diff) |
| Browser | Playwright core |
| Packaging | npm + pip + Maven + Docker |

## Run
```bash
npm install && npm run dev   # → http://localhost:4304
```
## Why it's OG
If it gets 5k+ GitHub stars, you're not a candidate — you're a maintainer. Recruiters chase maintainers.
## License
MIT
