// src/capabilities/performance.ts — performance budget checks
import type { PerfMetric } from "../types.js";

/** Collect performance metrics (simulated Lighthouse-style). */
export function collectMetrics(): PerfMetric[] {
  const lcp = 1500 + Math.floor(Math.random() * 2000);
  const cls = Math.random() * 0.3;
  const fid = Math.floor(Math.random() * 300);
  return [
    { name: "LCP", value: lcp, unit: "ms", budget: 2500, breached: lcp > 2500 },
    { name: "CLS", value: parseFloat(cls.toFixed(3)), unit: "", budget: 0.1, breached: cls > 0.1 },
    { name: "FID", value: fid, unit: "ms", budget: 100, breached: fid > 100 },
    { name: "TTFB", value: 100 + Math.floor(Math.random() * 400), unit: "ms", budget: 600, breached: false },
    { name: "p95_latency", value: 200 + Math.floor(Math.random() * 600), unit: "ms", budget: 800, breached: false },
  ];
}

/** Check if any metrics breached their budget. */
export function findBreaches(metrics: PerfMetric[]): PerfMetric[] {
  return metrics.filter(m => m.breached);
}

/** Format a performance report. */
export function formatPerfReport(metrics: PerfMetric[]): string {
  return metrics.map(m => `${m.name}: ${m.value}${m.unit} ${m.breached ? "❌ (budget: " + m.budget + m.unit + ")" : "✓"}`).join("\n");
}
