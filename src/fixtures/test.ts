import { test as base, type APIResponse } from '@playwright/test';
import { ClinixApi } from '../api/clinix-api.ts';
import { env } from '../config/env.ts';
import { getUser, type UserKey } from '../data/users.ts';
import { LoginPage } from '../pages/login-page.ts';
import { MedicationsPage } from '../pages/medications-page.ts';

type Medications = {
  adminToken: string;
  userToken: string;
  /** POST cru; o ID de todo cadastro com 201 é removido ao final do teste. */
  create: (token: string | null, data: unknown) => Promise<APIResponse>;
  /** Quantos cadastros existem com este nome exato (leitura como ADMIN). */
  countByName: (name: string) => Promise<number>;
  /** Para cadastros feitos pela tela: ao final, remove todos com este nome exato. */
  cleanupByName: (name: string) => void;
};

type Fixtures = {
  api: ClinixApi;
  loginPage: LoginPage;
  medications: Medications;
  medicationsPage: MedicationsPage;
  /** Sessão obtida pela API e gravada no localStorage antes da navegação (login pela UI só nos testes de login). */
  signInAs: (key: UserKey) => Promise<void>;
};

export const test = base.extend<Fixtures>({
  api: async ({ playwright }, use) => {
    const request = await playwright.request.newContext({ baseURL: env.apiUrl });
    await use(new ClinixApi(request));
    await request.dispose();
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  medicationsPage: async ({ page }, use) => {
    await use(new MedicationsPage(page));
  },
  signInAs: async ({ api, page }, use) => {
    await use(async (key) => {
      const user = getUser(key);
      const token = await api.getToken(user.usuario, user.senha);
      await page.addInitScript((value) => localStorage.setItem('token', value), token);
    });
  },
  medications: async ({ api }, use) => {
    const admin = getUser('admin');
    const user = getUser('user');
    const adminToken = await api.getToken(admin.usuario, admin.senha);
    const userToken = await api.getToken(user.usuario, user.senha);
    const created: number[] = [];
    const names: string[] = [];

    const findIds = async (name: string) => {
      const response = await api.listMedications(adminToken, name);
      if (!response.ok()) throw new Error(`Listagem falhou: HTTP ${response.status()}`);
      const page = (await response.json()) as {
        content: { id: number; medicationName: string }[];
      };
      return page.content.filter((m) => m.medicationName === name).map((m) => m.id);
    };

    await use({
      adminToken,
      userToken,
      create: async (token, data) => {
        const response = await api.createMedication(token, data);
        if (response.status() === 201) created.push(((await response.json()) as { id: number }).id);
        return response;
      },
      countByName: async (name) => (await findIds(name)).length,
      cleanupByName: (name) => {
        names.push(name);
      },
    });

    for (const name of names) created.push(...(await findIds(name)));
    for (const id of new Set(created)) await api.deleteMedication(adminToken, id);
  },
});

export { expect } from '@playwright/test';
