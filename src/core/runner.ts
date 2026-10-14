// src/core/runner.ts — test spec executor
import type { TestSpec, TestResult, TestStatus } from "../types.js";
import { executeRequest, assertResponse } from "../capabilities/api-testing.js";
import { compareScreenshots } from "../capabilities/visual-regression.js";
import { runBeforeSpec, runAfterStep, runAfterSpec } from "../plugins/plugin-registry.js";

/** Execute a test spec and collect results. */
export async function runSpec(spec: TestSpec): Promise<TestResult> {
  const processed = runBeforeSpec(spec);
  const t0 = Date.now();
  const stepResults: TestResult["steps"] = [];
  let overallStatus: TestStatus = "passed";

  for (const step of processed.steps) {
    const stepStart = Date.now();
    let status: TestStatus = "passed";
    let error: string | undefined;
    let healed = false;

    try {
      switch (step.kind) {
        case "request": {
          const res = await executeRequest(step);
          if (step.assertion) {
            const a = assertResponse(res, step.assertion);
            if (!a.pass) { status = "failed"; error = a.detail; }
          }
          break;
        }
        case "screenshot": {
          // In production: take a screenshot + compare against baseline
          // Here we simulate a match
          const diff = compareScreenshots(Buffer.from("base"), Buffer.from("base"));
          if (!diff.match) { status = "failed"; error = `Visual diff: ${diff.diffPct}%`; }
          break;
        }
        case "navigate":
        case "click":
        case "type":
        case "assert":
        case "wait":
          // Simulated — in production these drive Playwright
          await new Promise(r => setTimeout(r, 10 + Math.random() * 40));
          break;
      }
    } catch (e) {
      status = "failed";
      error = (e as Error).message;
    }

    runAfterStep(step, { status, error });
    stepResults.push({ step, status, error, healed });

    if (status === "failed") {
      overallStatus = "failed";
      break; // stop on first failure (configurable)
    }
  }

  const result: TestResult = {
    specName: spec.name,
    status: overallStatus,
    durationMs: Date.now() - t0,
    steps: stepResults,
    retries: 0,
  };
  return runAfterSpec(result);
}

/** Run multiple specs + aggregate results. */
export async function runSuite(specs: TestSpec[]): Promise<TestResult[]> {
  return Promise.all(specs.map(runSpec));
}

/** Summarize a suite run. */
export function summarizeSuite(results: TestResult[]): {
  total: number; passed: number; failed: number; flaky: number;
  passRate: number; durationMs: number;
} {
  const passed = results.filter(r => r.status === "passed").length;
  const failed = results.filter(r => r.status === "failed").length;
  const flaky = results.filter(r => r.status === "flaky").length;
  return {
    total: results.length,
    passed, failed, flaky,
    passRate: results.length > 0 ? passed / results.length : 0,
    durationMs: results.reduce((s, r) => s + r.durationMs, 0),
  };
}
