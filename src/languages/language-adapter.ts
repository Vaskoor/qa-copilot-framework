// src/languages/language-adapter.ts — multi-language test code generation
import type { TestSpec, Language } from "../types.js";

/** Generate test code in the target language from a spec. */
export function generateCode(spec: TestSpec, lang: Language): string {
  switch (lang) {
    case "typescript": return genTypeScript(spec);
    case "python": return genPython(spec);
    case "java": return genJava(spec);
  }
}

function genTypeScript(spec: TestSpec): string {
  const steps = spec.steps.map(s => {
    switch (s.kind) {
      case "navigate": return `  await page.goto('${s.url}');`;
      case "click": return `  await page.click('${s.selector}');`;
      case "type": return `  await page.fill('${s.selector}', '${s.text}');`;
      case "assert": return `  await expect(page.locator('${s.selector}')).toBeVisible();`;
      case "screenshot": return `  await page.screenshot({ path: '${spec.name}.png' });`;
      case "request": return `  const res = await request.${(s.method||"get").toLowerCase()}('${s.url}');`;
      case "wait": return `  await page.waitForTimeout(${s.timeoutMs || 1000});`;
      default: return `  // ${s.kind}`;
    }
  }).join("\n");
  return `import { test, expect } from '@playwright/test';

test('${spec.name}', async ({ page, request }) => {
${steps}
});`;
}

function genPython(spec: TestSpec): string {
  const steps = spec.steps.map(s => {
    switch (s.kind) {
      case "navigate": return `    page.goto("${s.url}")`;
      case "click": return `    page.click("${s.selector}")`;
      case "type": return `    page.fill("${s.selector}", "${s.text}")`;
      case "assert": return `    expect(page.locator("${s.selector}")).to_be_visible()`;
      case "screenshot": return `    page.screenshot(path="${spec.name}.png")`;
      case "request": return `    res = page.request.${(s.method||"get").lower()}("${s.url}")`;
      case "wait": return `    page.wait_for_timeout(${s.timeoutMs || 1000})`;
      default: return `    # ${s.kind}`;
    }
  }).join("\n");
  return `from playwright.sync_api import sync_playwright

def test_${spec.name.replace(/\s+/g, "_").toLowerCase()}():
    with sync_playwright() as p:
        page = p.chromium.new_page()
${steps}`;
}

function genJava(spec: TestSpec): string {
  const steps = spec.steps.map(s => {
    switch (s.kind) {
      case "navigate": return `        page.navigate("${s.url}");`;
      case "click": return `        page.click("${s.selector}");`;
      case "type": return `        page.fill("${s.selector}", "${s.text}");`;
      case "assert": return `        assertThat(page.locator("${s.selector}")).isVisible();`;
      case "screenshot": return `        page.screenshot(new Page.ScreenshotOptions().setPath(Paths.get("${spec.name}.png")));`;
      case "request": return `        res = page.request().${(s.method||"get").toLowerCase()}("${s.url}");`;
      case "wait": return `        page.waitForTimeout(${s.timeoutMs || 1000});`;
      default: return `        // ${s.kind}`;
    }
  }).join("\n");
  return `import com.microsoft.playwright.*;
import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

public class ${spec.name.replace(/\s+/g, "")}Test {
    public void test${spec.name.replace(/\s+/g, "")}(Page page) {
${steps}
    }
}`;
}
