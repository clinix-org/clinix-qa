import { test as base } from '@playwright/test';
import { ClinixApi } from '../api/clinix-api.ts';
import { env } from '../config/env.ts';
import { LoginPage } from '../pages/login-page.ts';

export const test = base.extend<{ api: ClinixApi; loginPage: LoginPage }>({
  api: async ({ playwright }, use) => {
    const request = await playwright.request.newContext({ baseURL: env.apiUrl });
    await use(new ClinixApi(request));
    await request.dispose();
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

export { expect } from '@playwright/test';
