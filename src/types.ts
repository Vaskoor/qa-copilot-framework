// src/types.ts — shared types for the QA Copilot Framework

export type StepKind = "navigate" | "click" | "type" | "assert" | "screenshot" | "request" | "wait";
export type TestStatus = "passed" | "failed" | "flaky" | "skipped";
export type Language = "typescript" | "python" | "java";

export interface TestStep {
  kind: StepKind;
  selector?: string;        // CSS/XPath for click/type/assert
  text?: string;            // text to type or text to assert visible
  url?: string;             // for navigate/request
  method?: string;          // for request (GET/POST/...)
  body?: unknown;           // for request
  assertion?: string;       // what to assert (e.g., "visible", "text:Hello", "status:200")
  timeoutMs?: number;
}

export interface TestSpec {
  name: string;
  steps: TestStep[];
  tags?: string[];
  framework?: string;
}

export interface TestResult {
  specName: string;
  status: TestStatus;
  durationMs: number;
  steps: { step: TestStep; status: TestStatus; error?: string; healed?: boolean }[];
  screenshot?: string;
  retries: number;
}

export interface SelfHealResult {
  original: string;
  proposed: string;
  strategy: "text" | "role" | "aria-label" | "near" | "nth-child";
  confidence: number;
  applied: boolean;
}

export interface Plugin {
  name: string;
  version: string;
  hooks?: {
    beforeSpec?: (spec: TestSpec) => TestSpec;
    afterStep?: (step: TestStep, result: { status: TestStatus; error?: string }) => void;
    afterSpec?: (result: TestResult) => TestResult;
  };
  capabilities?: string[];
}

export interface VisualDiff {
  baselineHash: string;
  actualHash: string;
  match: boolean;
  diffPct: number;
  threshold: number;
}

export interface A11yIssue {
  rule: string;
  severity: "critical" | "serious" | "moderate" | "minor";
  element: string;
  description: string;
}

export interface A11yResult {
  issues: A11yIssue[];
  passCount: number;
  failCount: number;
}

export interface PerfMetric {
  name: string;
  value: number;
  unit: string;
  budget?: number;
  breached: boolean;
}
