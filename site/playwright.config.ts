import { defineConfig } from '@playwright/test'

// Two projects:
//  - dev:  every spec except *.prod.spec.ts, against the Vite dev server.
//  - prod: only *.prod.spec.ts, against `vite preview` serving dist/ (the built,
//          prerendered site). dist/ must exist: run `npm run build` first.
export default defineConfig({
  testDir: './e2e',
  projects: [
    {
      name: 'dev',
      testIgnore: /\.prod\.spec\.ts$/,
      use: { baseURL: 'http://localhost:5173' },
    },
    {
      name: 'prod',
      testMatch: /\.prod\.spec\.ts$/,
      use: { baseURL: 'http://localhost:4173' },
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npx vite preview --port 4173 --strictPort',
      url: 'http://localhost:4173',
      reuseExistingServer: !process.env.CI,
    },
  ],
})
