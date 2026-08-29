import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  webServer: [
    {
      command: "pnpm --filter @ethannet/backend dev",
      url: "http://localhost:4001/api/hello",
      reuseExistingServer: !process.env.CI,
      cwd: "../..",
    },
    {
      command: "pnpm --filter @ethannet/frontend dev",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
      cwd: "../..",
    },
  ],
  use: { baseURL: "http://localhost:3000" },
});
