// tests/nl-to-test.test.ts — tests for the natural language → test parser
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { parseStep, parseTest, describeSpec } from "../src/ai/nl-to-test.ts";

describe("nl-to-test — parseStep", () => {
  test("parses navigate", () => {
    const s = parseStep("go to https://example.com");
    assert.equal(s?.kind, "navigate");
    assert.equal(s?.url, "https://example.com");
  });
  test("parses click", () => {
    const s = parseStep("click Submit");
    assert.equal(s?.kind, "click");
    assert.equal(s?.text, "Submit");
  });
  test("parses type", () => {
    const s = parseStep("type hello into #email");
    assert.equal(s?.kind, "type");
    assert.equal(s?.text, "hello");
    assert.equal(s?.selector, "#email");
  });
  test("parses assert visible", () => {
    const s = parseStep("verify .dashboard visible");
    assert.equal(s?.kind, "assert");
    assert.equal(s?.assertion, "visible");
  });
  test("parses assert text", () => {
    const s = parseStep("verify 'Hello' in .greeting");
    assert.equal(s?.kind, "assert");
    assert.equal(s?.text, "Hello");
    assert.match(s?.assertion || "", /text:Hello/);
  });
  test("parses request", () => {
    const s = parseStep("send GET to /api/users");
    assert.equal(s?.kind, "request");
    assert.equal(s?.method, "GET");
    assert.equal(s?.url, "/api/users");
  });
  test("parses wait seconds", () => {
    const s = parseStep("wait 3 seconds");
    assert.equal(s?.kind, "wait");
    assert.equal(s?.timeoutMs, 3000);
  });
  test("parses screenshot", () => {
    const s = parseStep("take screenshot");
    assert.equal(s?.kind, "screenshot");
  });
  test("returns null for unknown", () => {
    const s = parseStep("blah blah blah");
    assert.equal(s, null);
  });
  test("strips leading 'then'/'and'", () => {
    const s = parseStep("and click Login");
    assert.equal(s?.kind, "click");
  });
});

describe("nl-to-test — parseTest", () => {
  test("parses multi-step test", () => {
    const spec = parseTest("Login test", "go to /login, type admin into #email, click Submit, verify .dashboard visible");
    assert.equal(spec.name, "Login test");
    assert.ok(spec.steps.length >= 3);
    assert.equal(spec.steps[0].kind, "navigate");
    assert.equal(spec.steps[1].kind, "type");
    assert.equal(spec.steps[2].kind, "click");
  });
  test("handles newline-separated steps", () => {
    const spec = parseTest("Multi", "go to /page\nclick Submit\nverify .result visible");
    assert.ok(spec.steps.length >= 2);
  });
});

describe("nl-to-test — describeSpec", () => {
  test("produces numbered steps", () => {
    const spec = parseTest("T", "go to /home, click About");
    const desc = describeSpec(spec);
    assert.ok(desc.includes("1."));
    assert.ok(desc.includes("2."));
  });
});
