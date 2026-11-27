import { test, expect } from '../../../src/fixtures/test.ts';
import { getUser, newUser } from '../../../src/data/users.ts';
import { apiErrorSchema } from '../../../src/schemas/auth.ts';
import { userListSchema } from '../../../src/schemas/users.ts';

const listStory = { type: 'story', description: 'SCRUM-14' };
const searchStory = { type: 'story', description: 'SCRUM-16' };
// 401 e 403 de /users vêm do filtro de segurança, sem requestId (observação no checklist).
const securityErrorSchema = apiErrorSchema.omit({ requestId: true });

test.describe(
  'Gestão de usuários › listagem',
  { tag: ['@api', '@critical'], annotation: listStory },
  () => {
    test(
      'deve listar administradores, colaboradores, ativos e inativos sem expor a senha quando o ADMIN consulta',
      { tag: '@smoke' },
      async ({ api, users }) => {
        const response = await api.listUsers(users.adminToken);

        expect(response.status()).toBe(200);
        // strictObject: qualquer campo de senha em qualquer item reprova o schema.
        const list = userListSchema.parse(await response.json());
        const byEmail = (key: 'admin' | 'user' | 'inactive') =>
          list.find((u) => u.usuario === getUser(key).usuario);
        expect(byEmail('admin')).toMatchObject({ role: 'ADMIN', ativo: true });
        expect(byEmail('user')).toMatchObject({ role: 'USER', ativo: true });
        expect(byEmail('inactive')).toMatchObject({ role: 'USER', ativo: false });
      },
    );
  },
);

test.describe(
  'Gestão de usuários › pesquisa',
  { tag: ['@api', '@regression'], annotation: searchStory },
  () => {
    const id = () => crypto.randomUUID().replaceAll('-', '').slice(0, 10);
    const terms = [
      { condition: 'parte do nome', term: (code: string) => `usca ${code.slice(0, 7)}` },
      { condition: 'parte do e-mail', term: (code: string) => `busca${code}@clin` },
      {
        condition: 'o nome em maiúsculas',
        term: (code: string) => `QA BUSCA ${code.toUpperCase()}`,
      },
    ];
    for (const { condition, term } of terms) {
      test(`deve encontrar somente o usuário correspondente quando a busca usa ${condition}`, async ({
        api,
        users,
      }) => {
        const code = id();
        const target = await users.seed(
          newUser({ nome: `QA Busca ${code}`, usuario: `qa.busca${code}@clinix.com` }),
        );

        const response = await api.listUsers(users.adminToken, term(code));

        expect(response.status()).toBe(200);
        const ids = userListSchema.parse(await response.json()).map((u) => u.id);
        expect(ids).toEqual([target.id]);
      });
    }
  },
);

test.describe(
  'Gestão de usuários › busca sem resultado',
  { tag: ['@api', '@regression'], annotation: listStory },
  () => {
    test('deve retornar 200 e lista vazia quando nenhum usuário corresponde à busca', async ({
      api,
      users,
    }) => {
      const response = await api.listUsers(
        users.adminToken,
        `qa-inexistente-${crypto.randomUUID()}`,
      );

      expect(response.status()).toBe(200);
      expect(userListSchema.parse(await response.json())).toEqual([]);
    });
  },
);

test.describe(
  'Gestão de usuários › acesso à listagem',
  { tag: ['@api', '@regression', '@critical', '@security'], annotation: listStory },
  () => {
    test('deve recusar com 403 quando o USER consulta a lista de usuários', async ({
      api,
      users,
    }) => {
      const response = await api.listUsers(users.userToken);

      expect(response.status()).toBe(403);
      expect(securityErrorSchema.parse(await response.json()).code).toBe('AUTH_FORBIDDEN');
    });

    test('deve recusar com 401 quando a lista de usuários é consultada sem token', async ({
      api,
    }) => {
      const response = await api.listUsers(null);

      expect(response.status()).toBe(401);
      expect(securityErrorSchema.parse(await response.json()).code).toBe('AUTH_UNAUTHORIZED');
    });
  },
);
