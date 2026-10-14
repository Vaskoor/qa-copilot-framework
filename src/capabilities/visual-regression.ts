// src/capabilities/visual-regression.ts — screenshot diff (pixel comparison)
import type { VisualDiff } from "../types.js";
import crypto from "crypto";

/** Hash a screenshot buffer (simulates perceptual hashing). */
export function hashScreenshot(data: Buffer): string {
  return crypto.createHash("sha256").update(data).digest("hex").slice(0, 16);
}

/** Compare two screenshots by hash + simulated pixel diff. */
export function compareScreenshots(
  baseline: Buffer,
  actual: Buffer,
  threshold = 0.02,
): VisualDiff {
  const baseHash = hashScreenshot(baseline);
  const actHash = hashScreenshot(actual);
  const match = baseHash === actHash;
  // Simulate a pixel diff ratio — if hashes match, 0%; if not, random 1-15%
  const diffPct = match ? 0 : 1 + Math.floor(Math.random() * 15);
  const breached = diffPct / 100 > threshold;
  return { baselineHash: baseHash, actualHash: actHash, match, diffPct, threshold };
}

/** Check if a visual diff should block CI. */
export function shouldBlock(diff: VisualDiff): boolean {
  return !diff.match && diff.diffPct / 100 > diff.threshold;
}
