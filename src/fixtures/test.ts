import { test as base, type APIResponse } from '@playwright/test';
import { ClinixApi } from '../api/clinix-api.ts';
import { env } from '../config/env.ts';
import type { MedicationPayload } from '../data/medications.ts';
import { getUser, type NewUserPayload, type UserKey } from '../data/users.ts';
import { LoginPage } from '../pages/login-page.ts';
import { MedicationsPage } from '../pages/medications-page.ts';
import { UsersPage } from '../pages/users-page.ts';
import { userListSchema, userSchema, type UserRecord } from '../schemas/users.ts';

type Medications = {
  adminToken: string;
  userToken: string;
  /** POST cru; o ID de todo cadastro com 201 é removido ao final do teste. */
  create: (token: string | null, data: unknown) => Promise<APIResponse>;
  /** Cadastra em sequência (a ordem de criação fica previsível) e devolve os IDs na mesma ordem. */
  seed: (payloads: MedicationPayload[]) => Promise<number[]>;
  /** Quantos cadastros existem com este nome exato (leitura como ADMIN). */
  countByName: (name: string) => Promise<number>;
  /** Para cadastros feitos pela tela: ao final, remove todos com este nome exato. */
  cleanupByName: (name: string) => void;
};

type Users = {
  adminToken: string;
  userToken: string;
  /** POST cru; o ID de todo cadastro com 201 é removido ao final do teste. */
  create: (token: string | null, data: unknown) => Promise<APIResponse>;
  /** Cadastra como ADMIN (massa de preparação) e devolve o registro criado. */
  seed: (payload: NewUserPayload) => Promise<UserRecord>;
  /** Registro com este e-mail exato, lido como ADMIN; `undefined` se não existe. */
  findByEmail: (email: string) => Promise<UserRecord | undefined>;
  /** Quantos cadastros têm este nome ou e-mail exato (leitura como ADMIN). */
  countMatching: (term: string) => Promise<number>;
  /** Para cadastros feitos pela tela: ao final, remove o usuário com este e-mail. */
  cleanupByEmail: (email: string) => void;
};

type Fixtures = {
  api: ClinixApi;
  loginPage: LoginPage;
  medications: Medications;
  medicationsPage: MedicationsPage;
  users: Users;
  usersPage: UsersPage;
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
  usersPage: async ({ page }, use) => {
    await use(new UsersPage(page));
  },
  signInAs: async ({ api, page }, use) => {
    await use(async (key) => {
      const user = getUser(key);
      const token = await api.getToken(user.usuario, user.senha);
      await page.addInitScript((value) => localStorage.setItem('token', value), token);
    });
  },
  users: async ({ api }, use) => {
    const admin = getUser('admin');
    const user = getUser('user');
    const adminToken = await api.getToken(admin.usuario, admin.senha);
    const userToken = await api.getToken(user.usuario, user.senha);
    const created: number[] = [];
    const emails: string[] = [];

    const search = async (term: string) => {
      const response = await api.listUsers(adminToken, term);
      if (!response.ok()) throw new Error(`Busca de usuários falhou: HTTP ${response.status()}`);
      return userListSchema.parse(await response.json());
    };
    const findByEmail = async (email: string) =>
      (await search(email)).find((u) => u.usuario === email.toLowerCase());

    const create = async (token: string | null, data: unknown) => {
      const response = await api.createUser(token, data);
      if (response.status() === 201) created.push(((await response.json()) as { id: number }).id);
      return response;
    };

    await use({
      adminToken,
      userToken,
      create,
      seed: async (payload) => {
        const response = await create(adminToken, payload);
        if (response.status() !== 201) {
          throw new Error(`Massa de usuário falhou: HTTP ${response.status()}`);
        }
        return userSchema.parse(await response.json());
      },
      findByEmail,
      countMatching: async (term) =>
        (await search(term)).filter((u) => u.nome === term || u.usuario === term.toLowerCase())
          .length,
      cleanupByEmail: (email) => {
        emails.push(email);
      },
    });

    for (const email of emails) {
      const found = await findByEmail(email);
      if (found) created.push(found.id);
    }
    // O DELETE remove o registro (exclusão física); 404 = o próprio teste já excluiu.
    for (const id of new Set(created)) {
      const response = await api.deleteUser(adminToken, id);
      if (![204, 404].includes(response.status())) {
        throw new Error(`Limpeza do usuário ${id} falhou: HTTP ${response.status()}`);
      }
    }
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

    const create = async (token: string | null, data: unknown) => {
      const response = await api.createMedication(token, data);
      if (response.status() === 201) created.push(((await response.json()) as { id: number }).id);
      return response;
    };

    await use({
      adminToken,
      userToken,
      create,
      seed: async (payloads) => {
        const ids: number[] = [];
        for (const payload of payloads) {
          const response = await create(adminToken, payload);
          if (response.status() !== 201) {
            throw new Error(`Massa de medicamentos falhou: HTTP ${response.status()}`);
          }
          ids.push(((await response.json()) as { id: number }).id);
        }
        return ids;
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
