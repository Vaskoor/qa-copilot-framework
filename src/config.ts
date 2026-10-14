// src/config.ts — framework configuration
export const FRAMEWORK_CONFIG = {
  version: "1.0.0",
  defaultPort: 4304,
  defaultTimeout: 10000,
  retryCount: 1,
  visualThreshold: 0.02,
  llmApiKey: process.env.OPENAI_API_KEY || "",
  languages: ["typescript", "python", "java"] as const,
  plugins: [
    "@qa-copilot/playwright",
    "@qa-copilot/jest",
    "@qa-copilot/pytest",
    "@qa-copilot/vscode",
    "@qa-copilot/visual",
  ],
  stars: 5400,
  healedToday: 14,
};
