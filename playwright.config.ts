import { defineConfig } from '@playwright/test';

// Port is overridable via E2E_PORT so the suite can run on a free port when a
// dev server is already occupying the default 8080.
const port = process.env.E2E_PORT ? Number(process.env.E2E_PORT) : 8080;
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: 'e2e',
  use: { baseURL },
  webServer: {
    command: `npm run build -w app && NODE_ENV=production PORT=${port} npx tsx server/src/index.ts`,
    url: `${baseURL}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
