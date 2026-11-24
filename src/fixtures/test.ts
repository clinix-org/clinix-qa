import { test as base } from '@playwright/test';
import { ClinixApi } from '../api/clinix-api.ts';
import { env } from '../config/env.ts';

export const test = base.extend<{ api: ClinixApi }>({
  api: async ({ playwright }, use) => {
    const request = await playwright.request.newContext({ baseURL: env.apiUrl });
    await use(new ClinixApi(request));
    await request.dispose();
  },
});

export { expect } from '@playwright/test';
