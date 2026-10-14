// src/capabilities/api-testing.ts — HTTP request testing
import type { TestStep } from "../types.js";

export interface ApiResponse {
  status: number;
  headers: Record<string, string>;
  body: unknown;
  durationMs: number;
}

/** Execute an API request step (simulated). */
export async function executeRequest(step: TestStep): Promise<ApiResponse> {
  const t0 = Date.now();
  // In production: fetch(step.url, { method: step.method, body: step.body })
  // Here we simulate a realistic response
  await new Promise(r => setTimeout(r, 20 + Math.random() * 80));
  const status = step.url?.includes("error") ? 500 : 200;
  return {
    status,
    headers: { "content-type": "application/json" },
    body: { ok: status === 200, url: step.url, method: step.method },
    durationMs: Date.now() - t0,
  };
}

/** Assert on an API response. */
export function assertResponse(response: ApiResponse, assertion: string): { pass: boolean; detail: string } {
  if (assertion.startsWith("status:")) {
    const expected = parseInt(assertion.split(":")[1]);
    return response.status === expected
      ? { pass: true, detail: `status ${response.status} === ${expected}` }
      : { pass: false, detail: `status ${response.status} !== ${expected}` };
  }
  if (assertion.startsWith("body:")) {
    const key = assertion.split(":")[1];
    return response.body && typeof response.body === "object" && key in (response.body as object)
      ? { pass: true, detail: `body has key "${key}"` }
      : { pass: false, detail: `body missing key "${key}"` };
  }
  return { pass: true, detail: "no assertion" };
}
