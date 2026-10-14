// src/ai/self-healer.ts — self-healing locators
// When a CSS selector breaks, propose alternative selectors from a DOM snapshot.

import type { SelfHealResult } from "../types.js";

export interface DomElement {
  tag: string;
  text: string;
  role?: string;
  ariaLabel?: string;
  id?: string;
  className?: string;
  href?: string;
  type?: string;
  children: DomElement[];
}

/** Try to heal a broken selector by finding the same element via alternative strategies. */
export function healSelector(original: string, dom: DomElement[]): SelfHealResult | null {
  // Strategy 1: match by text content
  const textMatch = findByText(dom, original);
  if (textMatch) {
    return {
      original,
      proposed: textMatch,
      strategy: "text",
      confidence: 0.85,
      applied: true,
    };
  }
  // Strategy 2: match by role
  const roleMatch = findByRole(dom, original);
  if (roleMatch) {
    return {
      original,
      proposed: roleMatch,
      strategy: "role",
      confidence: 0.80,
      applied: true,
    };
  }
  // Strategy 3: match by aria-label
  const ariaMatch = findByAriaLabel(dom, original);
  if (ariaMatch) {
    return {
      original,
      proposed: ariaMatch,
      strategy: "aria-label",
      confidence: 0.90,
      applied: true,
    };
  }
  return null;
}

/** Extract the keyword from a broken selector (e.g., "#login-btn" → "login"). */
export function extractKeyword(selector: string): string {
  return selector
    .replace(/[#.]/g, " ")
    .replace(/[-_]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2)
    .sort((a, b) => b.length - a.length)[0] || selector;
}

function findByText(dom: DomElement[], selector: string): string | null {
  const keyword = extractKeyword(selector).toLowerCase();
  for (const el of dom) {
    if (el.text.toLowerCase().includes(keyword)) {
      return `text=${el.text}`;
    }
    const child = findByText(el.children, selector);
    if (child) return child;
  }
  return null;
}

function findByRole(dom: DomElement[], selector: string): string | null {
  const keyword = extractKeyword(selector).toLowerCase();
  for (const el of dom) {
    if (el.role && el.role.toLowerCase().includes(keyword)) {
      return `[role="${el.role}"]`;
    }
    const child = findByRole(el.children, selector);
    if (child) return child;
  }
  return null;
}

function findByAriaLabel(dom: DomElement[], selector: string): string | null {
  const keyword = extractKeyword(selector).toLowerCase();
  for (const el of dom) {
    if (el.ariaLabel && el.ariaLabel.toLowerCase().includes(keyword)) {
      return `[aria-label="${el.ariaLabel}"]`;
    }
    const child = findByAriaLabel(el.children, selector);
    if (child) return child;
  }
  return null;
}
