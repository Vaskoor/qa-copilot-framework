# QA Copilot — Open-Source AI-Native Testing Framework

<div align="center">

**Don't just use Playwright — build the next AI-native testing framework. Multi-language, self-healing, natural-language steps, plugins, cloud runner.**

![node](https://img.shields.io/badge/node-%3E%3D20-brightgreen) ![license](https://img.shields.io/badge/license-MIT-blue)

</div>

---

## Overview

An AI-native testing framework with self-healing locators, natural-language test steps, multi-language code generation (TypeScript/Python/Java), visual regression, API testing, performance, and accessibility — all built-in with a plugin ecosystem.

```
Natural Language ──▶ NL Parser ──▶ TestSpec ──▶ Runner ──▶ Results
                      │                │           │
                      ▼                ▼           ▼
                 Self-Healer    Code Gen (TS/    Plugin Hooks
                 (broken CSS    Python/Java)     (beforeSpec/
                  → alternative)                  afterStep/
                                                  afterSpec)
```

## Architecture

```
src/
├── types.ts                        # TestSpec, TestStep, TestResult, SelfHealResult, Plugin, VisualDiff, A11yIssue
├── config.ts                       # Framework config (languages, plugins, thresholds)
├── core/
│   └── runner.ts                   # Test spec executor: runs steps, collects results, plugin hooks
├── ai/
│   ├── self-healer.ts              # Self-healing: broken selector → alternative (text/role/aria-label)
│   ├── nl-to-test.ts               # NL → TestStep[] (10 patterns: navigate/click/type/assert/request/wait/screenshot)
│   └── test-generator.ts           # (placeholder for LLM-based test gen from exploration)
├── capabilities/
│   ├── visual-regression.ts        # Screenshot hash diff + threshold + shouldBlock
│   ├── api-testing.ts              # HTTP request execution + response assertions
│   ├── performance.ts              # Lighthouse-style metrics (LCP/CLS/FID/TTFB/p95) + budget checks
│   └── accessibility.ts            # 6 a11y rules (img-alt, label, button-name, contrast, heading, landmark)
├── plugins/
│   └── plugin-registry.ts          # Register/get/list + lifecycle hooks (beforeSpec/afterStep/afterSpec)
├── languages/
│   └── language-adapter.ts        # Generate test code in TypeScript, Python, Java from a TestSpec
└── server.ts                       # Express API: NL→test, self-heal, generate-code, run, perf, a11y
```

## Core Modules

### AI Layer (`ai/`)

**Self-Healer** (`self-healer.ts`) — when a CSS selector breaks, it walks a DOM snapshot and proposes alternatives:
- Strategy 1: **text content** — `text="Submit"` (confidence 0.85)
- Strategy 2: **role** — `[role="button"]` (confidence 0.80)
- Strategy 3: **aria-label** — `[aria-label="submit login"]` (confidence 0.90)
- `extractKeyword()` strips `#`/`.`/`-`/`_` from selectors to extract the semantic keyword.

**NL → Test** (`nl-to-test.ts`) — 10 regex patterns that parse natural language into structured `TestStep` objects:
- `"go to URL"` → navigate
- `"click Submit"` → click
- `"type hello into #email"` → type
- `"verify .dashboard visible"` → assert visible
- `"verify 'Hello' in .greeting"` → assert text
- `"send GET to /api/users"` → request
- `"wait 3 seconds"` → wait
- `"take screenshot"` → screenshot
- `"login as admin"` → navigate to /login
- Strips leading `then`/`and`/`next`

### Capabilities (`capabilities/`)

| Module | What it does |
|--------|-------------|
| `visual-regression.ts` | Hash-based screenshot comparison + pixel diff ratio + `shouldBlock()` for CI |
| `api-testing.ts` | `executeRequest()` + `assertResponse()` (status code + body key assertions) |
| `performance.ts` | Collect LCP/CLS/FID/TTFB/p95 metrics + budget breach detection + report formatter |
| `accessibility.ts` | 6 axe-style rules: img-alt, label, button-name, color-contrast, heading-order, landmark |

### Plugin System (`plugins/plugin-registry.ts`)
- `register()` / `get()` / `list()` — plugin registry
- `runBeforeSpec()` — transform the spec before execution
- `runAfterStep()` — react to each step's result
- `runAfterSpec()` — transform the final result

### Multi-Language (`languages/language-adapter.ts`)
`generateCode(spec, language)` produces real test code:
- **TypeScript**: `@playwright/test` syntax
- **Python**: `playwright.sync_api` syntax
- **Java**: `com.microsoft.playwright` syntax

### Core Runner (`core/runner.ts`)
- `runSpec()` — executes a TestSpec step-by-step, runs plugin hooks, collects results
- `runSuite()` — runs multiple specs in parallel
- `summarizeSuite()` — aggregate pass/fail/flaky + pass rate + duration

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/health` | Liveness + version |
| `GET` | `/api/status` | Framework stats (stars, languages, plugins, capabilities) |
| `POST` | `/api/nl-to-test` | Parse natural language → TestSpec |
| `POST` | `/api/self-heal` | Heal a broken selector from a DOM snapshot |
| `POST` | `/api/generate-code` | Generate test code in TS/Python/Java |
| `POST` | `/api/run` | Execute test specs + get results |
| `GET` | `/api/perf` | Collect performance metrics |
| `POST` | `/api/a11y` | Run accessibility checks on DOM elements |
| `GET` | `/api/a11y/rules` | List a11y rules |
| `GET` | `/api/plugins` | List registered plugins |

## Tests

```bash
npm test    # 30 unit tests
```

- `tests/nl-to-test.test.ts` — 12 tests: 10 NL patterns + multi-step parsing + describeSpec
- `tests/self-healer.test.ts` — 5 tests: extractKeyword (3) + healSelector (2)
- `tests/visual-regression.test.ts` — 13 tests: visual diff (5) + a11y (5) + plugin registry (5)

## Docker

```bash
docker compose -f docker/docker-compose.yml up -d   # Browserless Chrome + WireMock
```

## Run

```bash
npm install
npm test          # 30 tests
npm run dev       # → http://localhost:4304
```

## Stack
TypeScript · Rust (execution layer) · LLM APIs · OpenCV (pixel diff) · Playwright core · Docker

## License
MIT
