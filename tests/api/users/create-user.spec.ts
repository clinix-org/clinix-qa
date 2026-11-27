import { test, expect } from '../../../src/fixtures/test.ts';
import { getUser, newUser } from '../../../src/data/users.ts';
import { apiErrorSchema } from '../../../src/schemas/auth.ts';
import { serverInstant, userSchema } from '../../../src/schemas/users.ts';

const story = { type: 'story', description: 'SCRUM-15' };
// Relógio do container e do runner podem divergir alguns ms; 2 s não esconde data errada.
const CLOCK_TOLERANCE_MS = 2_000;
const PASSWORD_MESSAGE = 'A senha deve conter exatamente 6 dígitos numéricos.';

test.describe(
  'Cadastro de usuários › cadastro válido',
  { tag: ['@api', '@smoke', '@critical'], annotation: story },
  () => {
    const profiles = [
      { label: 'Colaborador', role: 'USER' as const },
      { label: 'Administrador', role: 'ADMIN' as const },
    ];
    for (const { label, role } of profiles) {
      test(`deve retornar 201 sem senha, ativo, com responsável e data/hora quando o ADMIN cadastra um ${label}`, async ({
        api,
        users,
      }) => {
        const data = newUser({ role });
        const startedAt = Date.now();

        const response = await users.create(users.adminToken, data);

        expect(response.status()).toBe(201);
        // strictObject: qualquer campo de senha na resposta reprova o schema.
        const created = userSchema.parse(await response.json());
        expect(response.headers()['location']).toBe(`/users/${created.id}`);
        expect(created).toMatchObject({
          nome: data.nome,
          usuario: data.usuario,
          role,
          ativo: true,
        });
        expect(created.createdBy, 'RN: responsável é o ADMIN autenticado').toBe(
          getUser('admin').usuario,
        );
        const createdAt = serverInstant(created.createdAt);
        expect(createdAt, 'RN: dia, mês, ano e horário da criação').toBeGreaterThanOrEqual(
          startedAt - CLOCK_TOLERANCE_MS,
        );
        expect(createdAt).toBeLessThanOrEqual(Date.now() + CLOCK_TOLERANCE_MS);

        const reread = await api.getUserById(users.adminToken, created.id);
        expect(reread.status()).toBe(200);
        expect(userSchema.parse(await reread.json())).toMatchObject({
          usuario: data.usuario,
          role,
          ativo: true,
          createdBy: created.createdBy,
        });
      });
    }

    test('deve autenticar com a senha cadastrada quando o usuário acabou de ser criado', async ({
      api,
      users,
    }) => {
      const data = newUser({ senha: '135790' });
      await users.seed(data);

      const response = await api.login(data.usuario, '135790');

      expect(response.status()).toBe(200);
      expect(((await response.json()) as { token: string }).token).toBeTruthy();
    });
  },
);

test.describe(
  'Cadastro de usuários › campos obrigatórios',
  { tag: ['@api', '@regression'], annotation: story },
  () => {
    // Campo ausente: só a regra de obrigatório dispara, e a mensagem fica previsível.
    const missing = [
      { field: 'nome', label: 'o nome', message: 'O nome é obrigatório.', lookup: 'usuario' },
      { field: 'usuario', label: 'o e-mail', message: 'O e-mail é obrigatório.', lookup: 'nome' },
      { field: 'senha', label: 'a senha', message: 'A senha é obrigatória.', lookup: 'usuario' },
      {
        field: 'role',
        label: 'o perfil',
        message: 'A permissão é obrigatória.',
        lookup: 'usuario',
      },
    ] as const;
    for (const { field, label, message, lookup } of missing) {
      test(`deve recusar e indicar o campo quando falta ${label}`, async ({ users }) => {
        const data = newUser();
        const payload = Object.fromEntries(Object.entries(data).filter(([key]) => key !== field));

        const response = await users.create(users.adminToken, payload);

        expect(response.status()).toBe(400);
        const error = apiErrorSchema.parse(await response.json());
        expect(error.code).toBe('VALIDATION_ERROR');
        expect(error.fields).toEqual({ [field]: message });
        expect(await users.countMatching(data[lookup])).toBe(0);
      });
    }
  },
);

test.describe(
  'Cadastro de usuários › e-mail corporativo',
  { tag: ['@api', '@regression'], annotation: story },
  () => {
    test('deve recusar quando o e-mail não pertence ao domínio @clinix.com', async ({ users }) => {
      const data = newUser();
      const outsideDomain = data.usuario.replace('@clinix.com', '@exemplo.com');

      const response = await users.create(users.adminToken, { ...data, usuario: outsideDomain });

      expect(response.status()).toBe(400);
      const error = apiErrorSchema.parse(await response.json());
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.fields).toEqual({
        usuario: 'O e-mail deve pertencer ao domínio @clinix.com.',
      });
      expect(await users.countMatching(data.nome)).toBe(0);
    });

    test('deve recusar quando o e-mail não tem formato válido', async ({ users }) => {
      const data = newUser();

      const response = await users.create(users.adminToken, {
        ...data,
        usuario: data.usuario.replace('@', ''),
      });

      expect(response.status()).toBe(400);
      const error = apiErrorSchema.parse(await response.json());
      expect(error.code).toBe('VALIDATION_ERROR');
      // Formato e domínio falham juntos; o backend devolve uma das duas mensagens.
      expect(Object.keys(error.fields ?? {})).toEqual(['usuario']);
      expect(await users.countMatching(data.nome)).toBe(0);
    });
  },
);

test.describe(
  'Cadastro de usuários › senha de 6 dígitos',
  { tag: ['@api', '@regression'], annotation: story },
  () => {
    const invalidPasswords = [
      { condition: 'tem 5 dígitos', senha: '12345' },
      { condition: 'tem 7 dígitos', senha: '1234567' },
      { condition: 'tem letra', senha: '12a456' },
    ];
    for (const { condition, senha } of invalidPasswords) {
      test(`deve recusar quando a senha ${condition}`, async ({ users }) => {
        const data = newUser({ senha });

        const response = await users.create(users.adminToken, data);

        expect(response.status()).toBe(400);
        const error = apiErrorSchema.parse(await response.json());
        expect(error.code).toBe('VALIDATION_ERROR');
        expect(error.fields).toEqual({ senha: PASSWORD_MESSAGE });
        expect(await users.countMatching(data.usuario)).toBe(0);
      });
    }
  },
);

test.describe(
  'Cadastro de usuários › e-mail único',
  { tag: ['@api', '@regression', '@critical'], annotation: story },
  () => {
    const variants = [
      { condition: 'idêntico', toEmail: (email: string) => email },
      {
        condition: 'com letras maiúsculas',
        toEmail: (email: string) => email.replace('qa.tmp', 'QA.Tmp'),
      },
    ];
    for (const { condition, toEmail } of variants) {
      test(`deve retornar 409 com mensagem e manter um só cadastro quando o e-mail já existe (${condition})`, async ({
        users,
      }) => {
        const existing = await users.seed(newUser());

        const response = await users.create(
          users.adminToken,
          newUser({ usuario: toEmail(existing.usuario) }),
        );

        expect(response.status()).toBe(409);
        const error = apiErrorSchema.parse(await response.json());
        expect(error.code).toBe('RESOURCE_CONFLICT');
        expect(error.message, 'mensagem apropriada (critério de aceite)').toMatch(/e-mail/i);
        expect(await users.countMatching(existing.usuario)).toBe(1);
      });
    }
  },
);

test.describe(
  'Cadastro de usuários › acesso administrativo',
  { tag: ['@api', '@regression', '@critical', '@security'], annotation: story },
  () => {
    test('deve recusar sem cadastrar quando o USER tenta cadastrar', async ({ users }) => {
      const data = newUser();

      const response = await users.create(users.userToken, data);

      expect(response.status()).toBe(403);
      // O 403 de /users vem do filtro de segurança e não traz requestId (observação no checklist).
      const error = apiErrorSchema.omit({ requestId: true }).parse(await response.json());
      expect(error.code).toBe('AUTH_FORBIDDEN');
      expect(await users.countMatching(data.usuario)).toBe(0);
    });

    test('deve recusar sem cadastrar quando não há token', async ({ users }) => {
      const data = newUser();

      const response = await users.create(null, data);

      expect(response.status()).toBe(401);
      // O 401 do filtro de segurança não traz requestId (observação já registrada).
      const error = apiErrorSchema.omit({ requestId: true }).parse(await response.json());
      expect(error.code).toBe('AUTH_UNAUTHORIZED');
      expect(await users.countMatching(data.usuario)).toBe(0);
    });
  },
);
