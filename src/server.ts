import express from "express";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
const startedAt = Date.now();
let tick = 0;
const languages = ["TypeScript", "Python", "Java", "Go", "Rust"];
const features = [
  { name: "Self-healing locators", icon: "🔧", enabled: true },
  { name: "NL → test steps", icon: "💬", enabled: true },
  { name: "Record / replay", icon: "🎥", enabled: true },
  { name: "Visual regression", icon: "👁", enabled: true },
  { name: "API testing", icon: "🔌", enabled: true },
  { name: "Performance", icon: "⚡", enabled: true },
  { name: "Accessibility (axe)", icon: "♿", enabled: true },
  { name: "Multi-language", icon: "🌐", enabled: true },
];
const plugins = [
  { name: "@qa-copilot/playwright", downloads: 48200, stars: 2100 },
  { name: "@qa-copilot/jest", downloads: 31100, stars: 1400 },
  { name: "@qa-copilot/pytest", downloads: 27800, stars: 980 },
  { name: "@qa-copilot/vscode", downloads: 19400, stars: 1650 },
  { name: "@qa-copilot/visual", downloads: 12300, stars: 720 },
];
function sim() {
  tick++;
  const nlExamples = [
    { nl: "login as admin, go to settings, toggle 2FA", generated: "test('2FA toggle', async ({page}) => { await page.goto('/login'); await page.fill('#email','admin@x'); await page.fill('#pass','...'); await page.click('button:has-text(\"Login\")'); await page.click('nav >> text=Settings'); await page.click('[data-testid=2fa-toggle]'); await expect(page.locator('.toast')).toContainText('enabled'); });" },
    { nl: "add 3 items to cart, verify total", generated: "test('cart total', async ({page}) => { for (const i of [1,2,3]) { await page.click(`.product:nth-child(${i}) button:has-text(\"Add\")`); } const total = await page.locator('.cart-total').textContent(); expect(parseFloat(total.replace('$',''))).toBeGreaterThan(0); });" },
  ];
  return { languages, features, plugins, nlExamples, healedToday: 14 + tick, stars: 5400 + tick, downloads: 139000 + tick * 50 };
}
app.get("/api/status", (_q, r) => r.json({ ok: true, uptime: Math.round((Date.now() - startedAt) / 1000), ...sim() }));
app.get("/health", (_q, r) => r.json({ ok: true }));
app.use(express.static(path.join(__dirname, "../public")));
app.get("/", (_q, r) => r.sendFile(path.join(__dirname, "../public/index.html")));
app.listen(Number(process.env.PORT ?? 4304), () => console.log("qa-copilot → http://localhost:4304"));
