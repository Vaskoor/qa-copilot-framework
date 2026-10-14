// src/capabilities/accessibility.ts — axe-style accessibility checks
import type { A11yResult, A11yIssue } from "../types.js";

const RULES = [
  { rule: "img-alt", severity: "critical" as const, check: (el: { tag: string; alt?: string }) => el.tag === "img" && !el.alt, desc: "Images must have alt text" },
  { rule: "label", severity: "critical" as const, check: (el: { tag: string; label?: string }) => el.tag === "input" && !el.label, desc: "Form inputs must have labels" },
  { rule: "button-name", severity: "serious" as const, check: (el: { tag: string; text: string; ariaLabel?: string }) => el.tag === "button" && !el.text && !el.ariaLabel, desc: "Buttons must have accessible names" },
  { rule: "color-contrast", severity: "serious" as const, check: (el: { contrast?: number }) => el.contrast !== undefined && el.contrast < 4.5, desc: "Color contrast must be ≥ 4.5:1" },
  { rule: "heading-order", severity: "moderate" as const, check: (el: { tag: string; level?: number; prevLevel?: number }) => el.tag === "h2" && el.prevLevel === 1 && el.level !== undefined && el.level > 2, desc: "Headings should be in order" },
  { rule: "landmark", severity: "moderate" as const, check: (el: { tag: string; role?: string }) => el.tag === "main" && !el.role, desc: "Page should have a main landmark" },
];

/** Run accessibility checks on a DOM-like structure. */
export function runA11yChecks(elements: Record<string, unknown>[]): A11yResult {
  const issues: A11yIssue[] = [];
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    for (const rule of RULES) {
      if (rule.check(el as any)) {
        issues.push({
          rule: rule.rule,
          severity: rule.severity,
          element: `<${el.tag || "unknown"}> #${i}`,
          description: rule.desc,
        });
      }
    }
  }
  return {
    issues,
    passCount: elements.length * RULES.length - issues.length,
    failCount: issues.length,
  };
}

/** Get the list of rules. */
export function getRules() {
  return RULES.map(r => ({ rule: r.rule, severity: r.severity, description: r.desc }));
}
