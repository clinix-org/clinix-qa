import { test, expect } from '../../../src/fixtures/test.ts';
import { newUser } from '../../../src/data/users.ts';
import { userSchema } from '../../../src/schemas/users.ts';

const story = { type: 'story', description: 'SCRUM-16' };

test.describe(
  'Gestão de usuários › edição na tela',
  { tag: ['@ui', '@regression'], annotation: story },
  () => {
    test('deve abrir a edição com nome, e-mail, perfil e status do usuário quando o ADMIN clica no lápis', async ({
      signInAs,
      users,
      usersPage,
    }) => {
      const target = await users.seed(newUser({ role: 'USER' }));
      await signInAs('admin');
      await usersPage.openFiltered(target.usuario);

      await usersPage.editButton(usersPage.rowWith(target.usuario)).click();

      const form = usersPage.editDialog;
      await expect(form.name).toHaveValue(target.nome);
      await expect(form.email).toHaveValue(target.usuario);
      await expect(form.role).toHaveValue('USER');
      await expect(form.status).toHaveValue('true');
    });

    test(
      'deve atualizar a lista quando o ADMIN salva nome e status alterados',
      { tag: '@critical' },
      async ({ api, page, signInAs, users, usersPage }) => {
        const target = await users.seed(newUser());
        const newName = `${target.nome} Editado`;
        await signInAs('admin');
        await usersPage.openFiltered(target.usuario);
        await usersPage.editButton(usersPage.rowWith(target.usuario)).click();
        const form = usersPage.editDialog;

        await form.name.fill(newName);
        await form.status.selectOption('false');
        await form.submit.click();

        await expect(page.getByText('Dados alterados com sucesso!')).toBeVisible();
        const row = usersPage.rowWith(target.usuario);
        await expect(row).toContainText(newName);
        await expect(row).toContainText('Inativo');
        const persisted = userSchema.parse(
          await (await api.getUserById(users.adminToken, target.id)).json(),
        );
        expect(persisted).toMatchObject({ nome: newName, ativo: false });
      },
    );
  },
);

test.describe(
  'Gestão de usuários › exclusão na tela',
  { tag: ['@ui', '@regression', '@critical'], annotation: story },
  () => {
    test('deve pedir confirmação e manter o usuário quando o ADMIN cancela a exclusão', async ({
      api,
      signInAs,
      users,
      usersPage,
    }) => {
      const target = await users.seed(newUser());
      await signInAs('admin');
      await usersPage.openFiltered(target.usuario);

      await usersPage.deleteButton(usersPage.rowWith(target.usuario)).click();
      await expect(usersPage.deleteDialog).toContainText(
        `Tem certeza que deseja excluir o usuário ${target.nome}`,
      );
      await usersPage.deleteDialog.getByRole('button', { name: 'Cancelar' }).click();

      await expect(usersPage.deleteDialog).toBeHidden();
      await expect(usersPage.rowWith(target.usuario)).toContainText('Ativo');
      const reread = await api.getUserById(users.adminToken, target.id);
      expect(userSchema.parse(await reread.json()).ativo).toBe(true);
    });

    test('deve remover o usuário da lista quando o ADMIN confirma a exclusão', async ({
      api,
      signInAs,
      users,
      usersPage,
    }) => {
      const target = await users.seed(newUser());
      await signInAs('admin');
      await usersPage.openFiltered(target.usuario);

      await usersPage.deleteButton(usersPage.rowWith(target.usuario)).click();
      await usersPage.deleteDialog.getByRole('button', { name: 'Excluir', exact: true }).click();

      await expect(usersPage.deleteDialog).toBeHidden();
      // Exclusão física (decisão do responsável em 2026-11-27): a linha sai da lista.
      await expect(usersPage.rowWith(target.usuario)).toHaveCount(0);
      const reread = await api.getUserById(users.adminToken, target.id);
      expect(reread.status()).toBe(404);
    });
  },
);
