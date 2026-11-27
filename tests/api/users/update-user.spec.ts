import { test, expect } from '../../../src/fixtures/test.ts';
import { getUser, newUser } from '../../../src/data/users.ts';
import { apiErrorSchema } from '../../../src/schemas/auth.ts';
import { serverInstant, userSchema, type UserRecord } from '../../../src/schemas/users.ts';

const story = { type: 'story', description: 'SCRUM-16' };
const CLOCK_TOLERANCE_MS = 2_000;
const securityErrorSchema = apiErrorSchema.omit({ requestId: true });

/** Corpo do PUT a partir do registro atual, com as alterações do teste. */
const edit = (user: UserRecord, changes: Partial<UserRecord> = {}) => ({
  nome: user.nome,
  usuario: user.usuario,
  role: user.role,
  ativo: user.ativo,
  ...changes,
});

test.describe(
  'Gestão de usuários › edição',
  { tag: ['@api', '@critical'], annotation: story },
  () => {
    test(
      'deve gravar nome, perfil e status com responsável e data/hora quando o ADMIN edita o usuário',
      { tag: '@smoke' },
      async ({ api, users }) => {
        const target = await users.seed(newUser({ role: 'USER' }));
        const changes = { nome: `${target.nome} Editado`, role: 'ADMIN' as const, ativo: false };
        const startedAt = Date.now();

        const response = await api.updateUser(users.adminToken, target.id, edit(target, changes));

        expect(response.status()).toBe(200);
        const reread = await api.getUserById(users.adminToken, target.id);
        const persisted = userSchema.parse(await reread.json());
        expect(persisted).toMatchObject({ ...changes, usuario: target.usuario });
        expect(persisted.updatedBy, 'RN: usuário que realizou a ação').toBe(
          getUser('admin').usuario,
        );
        const updatedAt = serverInstant(persisted.updatedAt);
        expect(updatedAt, 'RN: data e hora da alteração').toBeGreaterThanOrEqual(
          startedAt - CLOCK_TOLERANCE_MS,
        );
        expect(updatedAt).toBeLessThanOrEqual(Date.now() + CLOCK_TOLERANCE_MS);
      },
    );

    test(
      'deve recusar com 409 sem alterar quando o novo e-mail pertence a outro usuário',
      { tag: '@regression' },
      async ({ api, users }) => {
        const target = await users.seed(newUser());
        const other = await users.seed(newUser());

        const response = await api.updateUser(
          users.adminToken,
          target.id,
          edit(target, { usuario: other.usuario }),
        );

        expect(response.status()).toBe(409);
        const error = apiErrorSchema.parse(await response.json());
        expect(error.code).toBe('RESOURCE_CONFLICT');
        expect(error.message).toMatch(/e-mail/i);
        const reread = userSchema.parse(
          await (await api.getUserById(users.adminToken, target.id)).json(),
        );
        expect(reread.usuario).toBe(target.usuario);
      },
    );

    test(
      'deve retornar 404 quando o usuário editado não existe',
      { tag: '@regression' },
      async ({ api, users }) => {
        const response = await api.updateUser(users.adminToken, 999_999_999, {
          nome: 'QA Inexistente',
          usuario: 'qa.inexistente@clinix.com',
          role: 'USER',
          ativo: true,
        });

        expect(response.status()).toBe(404);
        expect(apiErrorSchema.parse(await response.json()).code).toBe('RESOURCE_NOT_FOUND');
      },
    );
  },
);

test.describe(
  'Gestão de usuários › usuário inativo',
  { tag: ['@api', '@regression', '@critical', '@security'], annotation: story },
  () => {
    test('deve recusar com 401 o token já emitido quando o ADMIN torna o usuário inativo', async ({
      api,
      users,
    }) => {
      const data = newUser();
      const target = await users.seed(data);
      const token = await api.getToken(data.usuario, data.senha);

      const response = await api.updateUser(
        users.adminToken,
        target.id,
        edit(target, { ativo: false }),
      );

      expect(response.status()).toBe(200);
      const afterInactivation = await api.listMedicationPage(token);
      expect(afterInactivation.status(), 'usuário inativo não acessa o sistema').toBe(401);
    });

    test('deve recusar sem alterar quando o ADMIN tenta tornar a si mesmo inativo', async ({
      api,
      users,
    }) => {
      // ADMIN temporário: uma falha aqui nunca bloqueia o ADMIN do ambiente.
      const data = newUser({ role: 'ADMIN' });
      const self = await users.seed(data);
      const selfToken = await api.getToken(data.usuario, data.senha);

      const response = await api.updateUser(selfToken, self.id, edit(self, { ativo: false }));

      expect(response.status()).toBe(400);
      const error = apiErrorSchema.parse(await response.json());
      expect(error.code).toBe('BAD_REQUEST');
      expect(error.message).toMatch(/pr[óo]prio usu[áa]rio/i);
      const reread = userSchema.parse(
        await (await api.getUserById(users.adminToken, self.id)).json(),
      );
      expect(reread.ativo).toBe(true);
    });
  },
);

test.describe(
  'Gestão de usuários › acesso à edição',
  { tag: ['@api', '@regression', '@critical', '@security'], annotation: story },
  () => {
    const callers = [
      {
        condition: 'o USER tenta editar',
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
      test(`deve recusar com ${status} sem alterar quando ${condition}`, async ({ api, users }) => {
        const target = await users.seed(newUser());
        const token = tokenOf(users);

        const response = await api.updateUser(
          token,
          target.id,
          edit(target, { nome: 'QA Invasor' }),
        );

        expect(response.status()).toBe(status);
        expect(securityErrorSchema.parse(await response.json()).code).toBe(code);
        const reread = userSchema.parse(
          await (await api.getUserById(users.adminToken, target.id)).json(),
        );
        expect(reread.nome).toBe(target.nome);
      });
    }
  },
);
