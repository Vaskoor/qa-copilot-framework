// src/plugins/plugin-registry.ts — plugin system with lifecycle hooks
import type { Plugin, TestSpec, TestResult, TestStep, TestStatus } from "../types.js";

const registry = new Map<string, Plugin>();

/** Register a plugin. */
export function register(plugin: Plugin): void {
  registry.set(plugin.name, plugin);
}

/** Get a plugin by name. */
export function get(name: string): Plugin | undefined {
  return registry.get(name);
}

/** List all registered plugins. */
export function list(): Plugin[] {
  return [...registry.values()];
}

/** Run beforeSpec hooks for all plugins. */
export function runBeforeSpec(spec: TestSpec): TestSpec {
  let result = spec;
  for (const plugin of registry.values()) {
    if (plugin.hooks?.beforeSpec) {
      result = plugin.hooks.beforeSpec(result);
    }
  }
  return result;
}

/** Run afterStep hooks for all plugins. */
export function runAfterStep(step: TestStep, result: { status: TestStatus; error?: string }): void {
  for (const plugin of registry.values()) {
    if (plugin.hooks?.afterStep) {
      plugin.hooks.afterStep(step, result);
    }
  }
}

/** Run afterSpec hooks for all plugins. */
export function runAfterSpec(result: TestResult): TestResult {
  let r = result;
  for (const plugin of registry.values()) {
    if (plugin.hooks?.afterSpec) {
      r = plugin.hooks.afterSpec(r);
    }
  }
  return r;
}

/** Clear all plugins. */
export function clear(): void {
  registry.clear();
}
