import { test, expect } from '../../../src/fixtures/test.ts';
import { getUser, newUser } from '../../../src/data/users.ts';

const listStory = { type: 'story', description: 'SCRUM-14' };
const searchStory = { type: 'story', description: 'SCRUM-16' };

test.describe(
  'Gestão de usuários › acesso pelo dashboard',
  { tag: ['@ui', '@regression'], annotation: listStory },
  () => {
    test(
      'deve abrir a lista de usuários quando o ADMIN clica em "Usuários" no menu do dashboard',
      { tag: '@critical' },
      // A SCRUM-14 diz "Gestão de usuários"; o nome em uso é "Usuários" (decisão do responsável em 2026-11-27).
      async ({ page, signInAs, usersPage }) => {
        await signInAs('admin');
        await page.goto('/dashboard');

        await usersPage.menuLink.click();

        await expect(page).toHaveURL(/\/usuarios$/);
        await expect(usersPage.table).toBeVisible();
        await expect(usersPage.createButton).toBeVisible();
      },
    );

    test(
      'não deve exibir o módulo Usuários quando o USER abre o dashboard',
      { tag: ['@critical', '@security'] },
      async ({ page, signInAs, usersPage }) => {
        await signInAs('user');

        await page.goto('/dashboard');

        // Espera o menu carregar: a ausência só vale com a tela pronta.
        await expect(
          page.getByRole('navigation').getByRole('button', { name: 'Medicamentos' }),
        ).toBeVisible();
        await expect(usersPage.menuLink).toHaveCount(0);
      },
    );

    test(
      'deve exibir acesso negado quando o USER abre /usuarios pelo endereço',
      { tag: ['@critical', '@security'] },
      async ({ page, signInAs, usersPage }) => {
        await signInAs('user');

        await page.goto('/usuarios');

        await expect(usersPage.forbiddenDialog).toBeVisible();
        await expect(usersPage.table).toHaveCount(0);
      },
    );
  },
);

test.describe(
  'Gestão de usuários › lista',
  { tag: ['@ui', '@critical'], annotation: listStory },
  () => {
    test(
      'deve exibir usuário, e-mail, acesso, status e os ícones de editar e excluir quando o ADMIN abre a lista',
      { tag: '@smoke' },
      async ({ signInAs, users, usersPage }) => {
        const target = await users.seed(newUser({ role: 'USER' }));
        await signInAs('admin');

        await usersPage.openFiltered(target.usuario);

        await expect(usersPage.table.getByRole('columnheader')).toContainText([
          'Nome de usuário',
          'E-mail',
          'Acesso',
          'Status',
        ]);
        const row = usersPage.rowWith(target.usuario);
        await expect(row).toContainText(target.nome);
        await expect(row).toContainText('Colaborador');
        await expect(row).toContainText('Ativo');
        await expect(usersPage.editButton(row)).toBeVisible();
        await expect(usersPage.deleteButton(row)).toBeVisible();
        await expect(usersPage.createButton).toBeVisible();
      },
    );
  },
);

test.describe('Gestão de usuários › pesquisa na tela', { tag: ['@ui', '@regression'] }, () => {
  test(
    'deve mostrar somente o usuário correspondente quando o ADMIN pesquisa por parte do e-mail',
    { annotation: searchStory },
    async ({ signInAs, users, usersPage }) => {
      const code = crypto.randomUUID().replaceAll('-', '').slice(0, 10);
      const target = await users.seed(newUser({ usuario: `qa.tela${code}@clinix.com` }));
      await signInAs('admin');

      await usersPage.openFiltered(`TELA${code.toUpperCase()}`);

      await expect(usersPage.rows).toHaveCount(1);
      await expect(usersPage.rowWith(target.usuario)).toContainText(target.nome);
    },
  );

  test(
    'deve exibir "Nenhum usuário encontrado." quando a busca não encontra usuários',
    { annotation: listStory },
    async ({ signInAs, usersPage }) => {
      await signInAs('admin');

      await usersPage.openFiltered(`qa-inexistente-${crypto.randomUUID().slice(0, 8)}`);

      await expect(usersPage.emptyState).toBeVisible();
    },
  );

  test(
    'deve impedir que o ADMIN exclua a si mesmo quando abre a própria linha',
    { annotation: searchStory },
    async ({ signInAs, usersPage }) => {
      const self = getUser('admin').usuario;
      await signInAs('admin');

      await usersPage.openFiltered(self);

      await expect(usersPage.deleteButton(usersPage.rowWith(self))).toBeDisabled();
    },
  );
});
