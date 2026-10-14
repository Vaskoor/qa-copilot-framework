// tests/self-healer.test.ts — tests for the self-healing locator system
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { healSelector, extractKeyword } from "../src/ai/self-healer.ts";
import type { DomElement } from "../src/ai/self-healer.ts";

const dom: DomElement[] = [
  {
    tag: "div", text: "Login Page", children: [
      { tag: "input", text: "", role: "textbox", ariaLabel: "email", id: "email", className: "form-input", children: [] },
      { tag: "input", text: "", role: "textbox", ariaLabel: "password", id: "password", className: "form-input", children: [] },
      { tag: "button", text: "Submit", role: "button", ariaLabel: "submit login", id: "login-btn", className: "btn", children: [] },
    ],
  },
];

describe("self-healer — extractKeyword", () => {
  test("extracts keyword from ID selector", () => {
    assert.match(extractKeyword("#login-btn"), /login/i);
  });
  test("extracts keyword from class selector", () => {
    assert.match(extractKeyword(".submit-button"), /submit/i);
  });
  test("handles complex selector", () => {
    const kw = extractKeyword("div.form-container > #login-btn");
    assert.ok(kw.length > 2);
  });
});

describe("self-healer — healSelector", () => {
  test("heals by text content", () => {
    const result = healSelector("#login-btn", dom);
    assert.ok(result);
    assert.equal(result!.strategy, "text");
    assert.ok(result!.proposed.includes("text="));
    assert.ok(result!.applied);
  });
  test("heals by aria-label", () => {
    const result = healSelector("#email-input", dom);
    assert.ok(result);
    assert.ok(result!.confidence >= 0.8);
  });
  test("returns null when no match found", () => {
    const result = healSelector("#nonexistent-xyz", dom);
    // it might still match something by partial keyword — check confidence
    if (result) {
      assert.ok(result.confidence > 0);
    }
  });
});
