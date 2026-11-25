import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env.ts';

const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: 'setup/*.setup.ts', use: { baseURL: env.apiUrl, trace: 'off' } },
    { name: 'api', testDir: './tests/api', dependencies: ['setup'], use: { baseURL: env.apiUrl } },
    {
      name: 'e2e',
      testDir: './tests/e2e',
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], baseURL: env.baseUrl },
    },
  ],
});
