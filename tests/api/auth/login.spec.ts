import { test, expect } from '../../../src/fixtures/test.ts';
import { getUser } from '../../../src/data/users.ts';
import { apiErrorSchema, loginResponseSchema } from '../../../src/schemas/auth.ts';

const story = { type: 'story', description: 'SCRUM-1' };
// Nunca é a senha de um usuário: a massa é gerada a partir de 100000.
const WRONG_PASSWORD = '000000';

test.describe(
  'Login › credenciais válidas',
  { tag: ['@api', '@smoke', '@critical'], annotation: story },
  () => {
    test('deve retornar token aceito em /auth/me quando as credenciais são válidas', async ({
      api,
      request,
    }) => {
      const user = getUser('user');

      const response = await api.login(user.usuario, user.senha);

      expect(response.status()).toBe(200);
      const { token } = loginResponseSchema.parse(await response.json());
      const me = await request.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      expect(me.status()).toBe(200);
      expect(await me.json()).toMatchObject({ email: user.usuario, accountStatus: 'ACTIVE' });
    });
  },
);

test.describe(
  'Login › credenciais inválidas',
  { tag: ['@api', '@regression', '@critical'], annotation: story },
  () => {
    const invalidCredentials = [
      { condition: 'a senha está incorreta', email: 'qa.user@clinix.com' },
      { condition: 'o e-mail não está cadastrado', email: 'qa.naocadastrado@clinix.com' },
    ];
    for (const { condition, email } of invalidCredentials) {
      test(`deve recusar com a mesma mensagem quando ${condition}`, async ({ api }) => {
        const response = await api.login(email, WRONG_PASSWORD);

        expect(response.status()).toBe(401);
        const error = apiErrorSchema.parse(await response.json());
        expect(error.code).toBe('AUTH_UNAUTHORIZED');
        expect(error.message).toBe('E-mail ou senha incorretos.');
      });
    }

    for (const size of [5, 7]) {
      test(`deve recusar o acesso quando a senha tem ${size} dígitos`, async ({ api }) => {
        const user = getUser('user');
        const password = `${user.senha}0`.slice(0, size);

        const response = await api.login(user.usuario, password);

        expect(response.status()).toBe(401);
        expect(apiErrorSchema.parse(await response.json()).code).toBe('AUTH_UNAUTHORIZED');
      });
    }
  },
);

test.describe(
  'Login › campos obrigatórios',
  { tag: ['@api', '@regression'], annotation: story },
  () => {
    const missingFields = [
      { label: 'o e-mail', field: 'username', email: '', password: '123456' },
      { label: 'a senha', field: 'password', email: 'qa.user@clinix.com', password: '' },
    ];
    for (const { label, field, email, password } of missingFields) {
      test(`deve indicar o campo obrigatório quando falta ${label}`, async ({ api }) => {
        const response = await api.login(email, password);

        expect(response.status()).toBe(400);
        const error = apiErrorSchema.parse(await response.json());
        expect(error.code).toBe('VALIDATION_ERROR');
        expect(Object.keys(error.fields ?? {})).toEqual([field]);
      });
    }
  },
);

test.describe(
  'Login › usuário inativo',
  { tag: ['@api', '@regression', '@critical'], annotation: story },
  () => {
    test(
      'deve recusar com conta inativa e sem token quando o usuário está inativo',
      // Defeito aberto: o cartão do README mostra a falha como conhecida. Remover ao corrigir.
      { annotation: { type: 'defect', description: 'Qase CLINIX-1' } },
      async ({ api }) => {
        const inactive = getUser('inactive');

        const response = await api.login(inactive.usuario, inactive.senha);

        expect(response.status(), 'conta inativa não é erro interno do servidor').toBe(423);
        const body: unknown = await response.json();
        expect(apiErrorSchema.parse(body).code).toBe('ACCOUNT_LOCKED');
        expect(body).not.toHaveProperty('token');
      },
    );
  },
);
