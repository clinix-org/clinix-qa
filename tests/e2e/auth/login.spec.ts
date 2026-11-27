import { test, expect } from '../../../src/fixtures/test.ts';
import { getUser } from '../../../src/data/users.ts';

const story = { type: 'story', description: 'SCRUM-1' };
// Nunca é a senha de um usuário: a massa é gerada a partir de 100000.
const WRONG_PASSWORD = '000000';

test.describe('Login › tela', { tag: ['@ui'], annotation: story }, () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test(
    'deve exibir a logo e o título quando o visitante abre a tela',
    { tag: '@smoke' },
    async ({ loginPage }) => {
      await expect(loginPage.logo).toBeVisible();
      await expect(loginPage.title).toBeVisible();
    },
  );

  test(
    'deve aceitar o e-mail e mascarar a senha quando o usuário digita',
    { tag: '@regression' },
    async ({ loginPage }) => {
      await loginPage.fillCredentials('qa.user@clinix.com', '123456');

      await expect(loginPage.email).toHaveValue('qa.user@clinix.com');
      await expect(loginPage.password).toHaveValue('123456');
      await expect(loginPage.password).toHaveAttribute('type', 'password');
    },
  );
});

test.describe('Login › botão Entrar', { tag: ['@ui', '@regression'], annotation: story }, () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  const disabledCases = [
    { condition: 'os dois campos estão vazios', email: '', password: '' },
    { condition: 'só o e-mail está preenchido', email: 'qa.user@clinix.com', password: '' },
    { condition: 'só a senha está preenchida', email: '', password: '123456' },
    { condition: 'a senha tem 5 caracteres', email: 'qa.user@clinix.com', password: '12345' },
    { condition: 'o e-mail não tem domínio', email: 'qa.user', password: '123456' },
  ];
  for (const { condition, email, password } of disabledCases) {
    test(`deve ficar desabilitado quando ${condition}`, async ({ loginPage }) => {
      await loginPage.fillCredentials(email, password);

      await expect(loginPage.submit).toBeDisabled();
    });
  }

  const enabledCases = [
    { condition: 'o e-mail é válido e a senha tem 6 caracteres', email: 'qa.user@clinix.com' },
    { condition: 'o e-mail tem só o primeiro nome', email: 'qa@clinix.com' },
  ];
  for (const { condition, email } of enabledCases) {
    test(`deve ficar habilitado quando ${condition}`, async ({ loginPage }) => {
      await loginPage.fillCredentials(email, '123456');

      await expect(loginPage.submit).toBeEnabled();
    });
  }

  test('deve exibir "Entrando" quando a validação está em andamento', async ({
    page,
    loginPage,
  }) => {
    // Segura a resposta para que o estado de carregamento seja observável.
    const { promise: released, resolve: release } = Promise.withResolvers<void>();
    await page.route('**/auth/login', async (route) => {
      await released;
      await route.continue();
    });

    await loginPage.signIn('qa.user@clinix.com', WRONG_PASSWORD);

    const loading = page.getByRole('button', { name: /^Entrando/ });
    await expect(loading).toBeVisible();
    await expect(loading).toBeDisabled();
    release();
    await expect(loginPage.submit).toBeVisible();
  });
});

test.describe(
  'Login › credenciais válidas',
  { tag: ['@ui', '@smoke', '@critical'], annotation: story },
  () => {
    test('deve abrir o dashboard quando as credenciais são válidas', async ({
      page,
      loginPage,
    }) => {
      const user = getUser('user');
      await loginPage.open();

      await loginPage.signIn(user.usuario, user.senha);

      await expect(page).toHaveURL(/\/dashboard$/);
      await expect(page.getByRole('heading', { name: 'Atividades recentes' })).toBeVisible();
    });
  },
);

test.describe(
  'Login › credenciais inválidas',
  { tag: ['@ui', '@regression', '@critical'], annotation: story },
  () => {
    const invalidCredentials = [
      { condition: 'a senha está incorreta', email: 'qa.user@clinix.com' },
      { condition: 'o e-mail não está cadastrado', email: 'qa.naocadastrado@clinix.com' },
      { condition: 'o e-mail tem só o primeiro nome', email: 'qa@clinix.com' },
    ];
    for (const { condition, email } of invalidCredentials) {
      test(`deve exibir erro e permanecer no login quando ${condition}`, async ({
        page,
        loginPage,
      }) => {
        await loginPage.open();

        await loginPage.signIn(email, WRONG_PASSWORD);

        await expect(loginPage.alert).toHaveText('E-mail ou senha incorretos. Tente novamente.');
        await expect(page).toHaveURL(/\/login$/);
      });
    }
  },
);

test.describe(
  'Login › usuário inativo',
  { tag: ['@ui', '@regression', '@critical'], annotation: story },
  () => {
    test('deve informar que a conta está inativa e permanecer no login quando o usuário está inativo', async ({
      page,
      loginPage,
    }) => {
      const inactive = getUser('inactive');
      await loginPage.open();

      await loginPage.signIn(inactive.usuario, inactive.senha);

      // O texto exato será definido pelo PO; a mensagem genérica de erro não explica a recusa.
      await expect(loginPage.alert, 'a tela deve explicar que a conta está inativa').toContainText(
        /inativ/i,
      );
      await expect(page).toHaveURL(/\/login$/);
    });
  },
);
