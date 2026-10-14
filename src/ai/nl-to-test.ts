// src/ai/nl-to-test.ts — natural language → structured test steps
// Parses "login as admin, click Submit, verify dashboard visible" into TestStep[].

import type { TestStep, TestSpec } from "../types.js";

interface Pattern {
  re: RegExp;
  build: (match: RegExpMatchArray) => TestStep;
}

const PATTERNS: Pattern[] = [
  // navigate: "go to URL", "visit URL"
  { re: /^(?:go to|visit|navigate to)\s+(.+)$/i, build: (m) => ({ kind: "navigate", url: m[1] }) },
  // click: "click Submit", "press Login button"
  { re: /^(?:click|press|tap)\s+(.+)$/i, build: (m) => ({ kind: "click", selector: m[1], text: m[1] }) },
  // type: "type hello into #email", "enter hello in email field"
  { re: /^(?:type|enter|input)\s+(.+?)\s+(?:into|in)\s+(.+)$/i, build: (m) => ({ kind: "type", text: m[1], selector: m[2] }) },
  // assert visible: "verify dashboard visible", "assert #modal visible"
  { re: /^(?:verify|assert|check)\s+(.+?)\s+(?:visible|displayed|shown)$/i, build: (m) => ({ kind: "assert", selector: m[1], assertion: "visible" }) },
  // assert text: "verify 'Hello' in .greeting"
  { re: /^(?:verify|assert|check)\s+['"](.+?)['"]\s+(?:in|on)\s+(.+)$/i, build: (m) => ({ kind: "assert", text: m[1], selector: m[2], assertion: `text:${m[1]}` }) },
  // assert status: "verify status 200"
  { re: /^(?:verify|assert|check)\s+status\s+(\d+)$/i, build: (m) => ({ kind: "assert", assertion: `status:${m[1]}` }) },
  // request: "send GET to /api/users"
  { re: /^(?:send|make)\s+(GET|POST|PUT|DELETE|PATCH)\s+(?:to\s+)?(.+)$/i, build: (m) => ({ kind: "request", method: m[1], url: m[2] }) },
  // wait: "wait 3 seconds", "wait for .toast"
  { re: /^wait\s+(?:for\s+)?(.+)$/i, build: (m) => { const num = m[1].match(/^(\d+)/); return num ? { kind: "wait" as const, timeoutMs: parseInt(num[1]) * 1000 } : { kind: "wait" as const, selector: m[1], timeoutMs: 5000 }; } },
  // screenshot: "take screenshot"
  { re: /^(?:take|capture)\s+screenshot$/i, build: () => ({ kind: "screenshot" }) },
  // login shortcut: "login as admin"
  { re: /^login\s+as\s+(\S+)$/i, build: (m) => ({ kind: "navigate", url: "/login" }) },
];

/** Parse a single natural language step into a TestStep. */
export function parseStep(nl: string): TestStep | null {
  const trimmed = nl.trim().replace(/^(?:then|and|next,?)\s+/i, "");
  for (const p of PATTERNS) {
    const m = trimmed.match(p.re);
    if (m) return p.build(m);
  }
  return null;
}

/** Parse a full natural language test into a TestSpec. */
export function parseTest(name: string, nl: string): TestSpec {
  const lines = nl.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
  const steps: TestStep[] = [];
  for (const line of lines) {
    const step = parseStep(line);
    if (step) steps.push(step);
  }
  return { name, steps, tags: ["ai-generated"] };
}

/** Generate a human-readable description of a test spec. */
export function describeSpec(spec: TestSpec): string {
  return spec.steps.map((s, i) => {
    switch (s.kind) {
      case "navigate": return `${i+1}. Navigate to ${s.url}`;
      case "click": return `${i+1}. Click ${s.selector}`;
      case "type": return `${i+1}. Type "${s.text}" into ${s.selector}`;
      case "assert": return `${i+1}. Assert ${s.assertion || "visible"}${s.selector ? ` on ${s.selector}` : ""}`;
      case "screenshot": return `${i+1}. Take screenshot`;
      case "request": return `${i+1}. ${s.method} ${s.url}`;
      case "wait": return `${i+1}. Wait ${s.timeoutMs}ms`;
      default: return `${i+1}. ${s.kind}`;
    }
  }).join("\n");
}
