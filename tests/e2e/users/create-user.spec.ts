import { test, expect } from '../../../src/fixtures/test.ts';
import { newUser } from '../../../src/data/users.ts';

const story = { type: 'story', description: 'SCRUM-15' };

test.describe(
  'Cadastro de usuários › formulário',
  { tag: ['@ui', '@regression'], annotation: story },
  () => {
    test.beforeEach(async ({ signInAs, usersPage }) => {
      await signInAs('admin');
      await usersPage.open();
      await usersPage.createButton.click();
    });

    test('deve apresentar Nome, E-mail, Senha, Confirmação de senha e Perfil obrigatórios quando o formulário abre', async ({
      usersPage,
    }) => {
      const form = usersPage.createDialog;

      await expect(form.dialog).toBeVisible();
      await expect(form.name).toHaveAttribute('required');
      await expect(form.email).toHaveAttribute('required');
      await expect(form.password).toHaveAttribute('required');
      await expect(form.confirmPassword).toHaveAttribute('required');
      // Perfil é obrigatório por vir sempre preenchido (lista sem opção vazia).
      await expect(form.role).toHaveJSProperty('tagName', 'SELECT');
      await expect(form.role).not.toHaveValue('');
    });

    test('deve oferecer os perfis User e Administrador quando o formulário abre', async ({
      usersPage,
    }) => {
      const options = usersPage.createDialog.role.getByRole('option');

      // "Colaborador" passou a se chamar "User" (decisão do responsável em 2026-11-27).
      await expect(options).toHaveText(['User', 'Administrador']);
    });

    test(
      'deve exibir sucesso e mostrar o usuário na lista quando o ADMIN preenche dados válidos',
      { tag: ['@smoke', '@critical'] },
      async ({ page, users, usersPage }) => {
        const data = newUser({ role: 'USER' });
        users.cleanupByEmail(data.usuario);
        const form = usersPage.createDialog;

        await form.fill({ ...data, confirmacao: data.senha });
        await form.submit.click();

        await expect(page.getByText(`Usuário ${data.nome} criado com sucesso!`)).toBeVisible();
        await expect(form.dialog).toBeHidden();
        await expect(usersPage.rowWith(data.usuario)).toContainText(data.nome);
        expect(await users.countMatching(data.usuario)).toBe(1);
      },
    );

    test('deve alertar e não enviar quando um campo obrigatório está vazio', async ({
      users,
      usersPage,
    }) => {
      const data = newUser();
      users.cleanupByEmail(data.usuario);
      const form = usersPage.createDialog;

      await form.fill({ ...data, nome: undefined, confirmacao: data.senha });
      await form.submit.click();

      await expect(form.dialog).toBeVisible();
      expect(await form.name.evaluate((input: HTMLInputElement) => input.validationMessage)).toBe(
        'Preencha este campo',
      );
      expect(await users.countMatching(data.usuario)).toBe(0);
    });

    test('deve exibir "As senhas precisam ser iguais." e não enviar quando a confirmação é diferente', async ({
      users,
      usersPage,
    }) => {
      const data = newUser({ senha: '112233' });
      users.cleanupByEmail(data.usuario);
      const form = usersPage.createDialog;

      await form.fill({ ...data, confirmacao: '332211' });
      await form.submit.click();

      await expect(form.dialog.getByText('As senhas precisam ser iguais.')).toBeVisible();
      expect(await users.countMatching(data.usuario)).toBe(0);
    });

    test(
      'deve informar que o e-mail já está cadastrado quando o ADMIN usa um e-mail existente',
      // Defeito aberto: o cartão do README mostra a falha como conhecida. Remover ao corrigir.
      { tag: '@critical', annotation: { type: 'defect', description: 'Qase CLINIX-7' } },
      async ({ page, users, usersPage }) => {
        const existing = await users.seed(newUser());
        const data = newUser({ usuario: existing.usuario });
        const form = usersPage.createDialog;

        await form.fill({ ...data, confirmacao: data.senha });
        await form.submit.click();

        // Critério: "mensagem apropriada"; a história não define o texto exato.
        await expect(page.getByText(/e-mail.*(j[aá] )?(cadastrad|existe|utiliz)/i)).toBeVisible();
        expect(await users.countMatching(existing.usuario)).toBe(1);
      },
    );
  },
);
