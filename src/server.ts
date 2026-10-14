// src/server.ts — QA Copilot Framework: full API + dashboard
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { FRAMEWORK_CONFIG } from "./config.js";
import { parseTest, describeSpec } from "./ai/nl-to-test.js";
import { healSelector } from "./ai/self-healer.js";
import type { DomElement } from "./ai/self-healer.js";
import { generateCode } from "./languages/language-adapter.js";
import { runSpec, summarizeSuite } from "./core/runner.js";
import type { TestSpec } from "./types.js";
import { list, register, clear } from "./plugins/plugin-registry.js";
import { collectMetrics, formatPerfReport } from "./capabilities/performance.js";
import { runA11yChecks, getRules } from "./capabilities/accessibility.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: "2mb" }));
const startedAt = Date.now();

// Register some demo plugins
register({ name: "@qa-copilot/playwright", version: "1.0.0", capabilities: ["ui", "visual", "a11y"] });
register({ name: "@qa-copilot/api", version: "1.0.0", capabilities: ["api"] });
register({ name: "@qa-copilot/perf", version: "1.0.0", capabilities: ["performance"] });

app.get("/health", (_q,r) => r.json({ ok: true, version: FRAMEWORK_CONFIG.version, uptime: Math.round((Date.now()-startedAt)/1000) }));

app.get("/api/status", (_q,r) => {
  r.json({
    ok: true,
    stars: FRAMEWORK_CONFIG.stars,
    healedToday: FRAMEWORK_CONFIG.healedToday,
    languages: FRAMEWORK_CONFIG.languages,
    plugins: list().map(p => ({ name: p.name, version: p.version, capabilities: p.capabilities })),
    capabilities: ["self-heal", "nl-steps", "record-replay", "visual", "api", "perf", "a11y", "multi-lang"],
  });
});

app.post("/api/nl-to-test", (req,r) => {
  const { name = "AI Test", steps } = req.body || {};
  if (!steps) return r.status(400).json({ error: "steps required" });
  const spec = parseTest(name, steps);
  r.json({ spec, description: describeSpec(spec) });
});

app.post("/api/self-heal", (req,r) => {
  const { selector, dom } = req.body || {};
  if (!selector || !Array.isArray(dom)) return r.status(400).json({ error: "selector + dom array required" });
  const result = healSelector(selector, dom as DomElement[]);
  r.json({ result });
});

app.post("/api/generate-code", (req,r) => {
  const { spec, language = "typescript" } = req.body || {};
  if (!spec) return r.status(400).json({ error: "spec required" });
  const code = generateCode(spec as TestSpec, language);
  r.json({ code, language });
});

app.post("/api/run", async (req,r) => {
  const { specs } = req.body || {};
  if (!Array.isArray(specs)) return r.status(400).json({ error: "specs array required" });
  const results = await Promise.all(specs.map((s: TestSpec) => runSpec(s)));
  r.json({ results, summary: summarizeSuite(results) });
});

app.get("/api/perf", (_q,r) => {
  const metrics = collectMetrics();
  r.json({ metrics, report: formatPerfReport(metrics) });
});

app.post("/api/a11y", (req,r) => {
  const { elements = [] } = req.body || {};
  const result = runA11yChecks(elements);
  r.json(result);
});

app.get("/api/a11y/rules", (_q,r) => r.json({ rules: getRules() }));
app.get("/api/plugins", (_q,r) => r.json({ plugins: list() }));

app.use(express.static(path.join(__dirname, "../public")));
app.get("/", (_q,r) => r.sendFile(path.join(__dirname, "../public/index.html")));

app.listen(Number(process.env.PORT ?? FRAMEWORK_CONFIG.defaultPort), () =>
  console.log(`qa-copilot-framework → http://localhost:${FRAMEWORK_CONFIG.defaultPort}`));
