import { test, expect } from '../../../src/fixtures/test.ts';
import { newUser } from '../../../src/data/users.ts';
import { apiErrorSchema } from '../../../src/schemas/auth.ts';
import { userSchema } from '../../../src/schemas/users.ts';

const story = { type: 'story', description: 'SCRUM-16' };
const securityErrorSchema = apiErrorSchema.omit({ requestId: true });

test.describe(
  'Gestão de usuários › exclusão',
  { tag: ['@api', '@critical'], annotation: story },
  () => {
    test(
      'deve remover o registro quando o ADMIN exclui um usuário',
      // Exclusão física: decisão do responsável em 2026-11-27 (a SCRUM-16 ainda diz "lógica").
      // Para tirar o acesso sem apagar, o caminho é editar o status para Inativo.
      { tag: '@regression' },
      async ({ api, users }) => {
        const target = await users.seed(newUser());

        const response = await api.deleteUser(users.adminToken, target.id);

        expect(response.status()).toBe(204);
        const reread = await api.getUserById(users.adminToken, target.id);
        expect(reread.status()).toBe(404);
        expect(apiErrorSchema.parse(await reread.json()).code).toBe('RESOURCE_NOT_FOUND');
        expect(await users.countMatching(target.usuario)).toBe(0);
      },
    );

    test(
      'deve recusar sem excluir quando o ADMIN tenta excluir a si mesmo',
      { tag: '@regression' },
      async ({ api, users }) => {
        // ADMIN temporário: uma falha aqui nunca remove o ADMIN do ambiente.
        const data = newUser({ role: 'ADMIN' });
        const self = await users.seed(data);
        const selfToken = await api.getToken(data.usuario, data.senha);

        const response = await api.deleteUser(selfToken, self.id);

        expect(response.status()).toBe(400);
        const error = apiErrorSchema.parse(await response.json());
        expect(error.code).toBe('BAD_REQUEST');
        expect(error.message).toMatch(/pr[óo]prio usu[áa]rio/i);
        const reread = await api.getUserById(users.adminToken, self.id);
        expect(reread.status()).toBe(200);
        expect(userSchema.parse(await reread.json()).ativo).toBe(true);
      },
    );

    test(
      'deve retornar 404 quando o usuário excluído não existe',
      { tag: '@regression' },
      async ({ api, users }) => {
        const response = await api.deleteUser(users.adminToken, 999_999_999);

        expect(response.status()).toBe(404);
        expect(apiErrorSchema.parse(await response.json()).code).toBe('RESOURCE_NOT_FOUND');
      },
    );
  },
);

test.describe(
  'Gestão de usuários › acesso à exclusão',
  { tag: ['@api', '@regression', '@critical', '@security'], annotation: story },
  () => {
    const callers = [
      {
        condition: 'o USER tenta excluir',
        status: 403,
        code: 'AUTH_FORBIDDEN',
        token: (u: { userToken: string }) => u.userToken,
      },
      {
        condition: 'não há token',
        status: 401,
        code: 'AUTH_UNAUTHORIZED',
        token: () => null,
      },
    ];
    for (const { condition, status, code, token: tokenOf } of callers) {
      test(`deve recusar com ${status} sem excluir quando ${condition}`, async ({ api, users }) => {
        const target = await users.seed(newUser());
        const token = tokenOf(users);

        const response = await api.deleteUser(token, target.id);

        expect(response.status()).toBe(status);
        expect(securityErrorSchema.parse(await response.json()).code).toBe(code);
        const reread = await api.getUserById(users.adminToken, target.id);
        expect(reread.status()).toBe(200);
        expect(userSchema.parse(await reread.json()).ativo).toBe(true);
      });
    }
  },
);
