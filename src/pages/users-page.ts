import type { Page } from '@playwright/test';

/** Ações e locators da gestão de usuários; asserções ficam nos testes. */
export class UsersPage {
  readonly table;
  readonly rows;
  readonly search;
  readonly createButton;
  readonly emptyState;
  readonly createDialog;
  readonly editDialog;
  readonly deleteDialog;
  readonly menuLink;
  readonly forbiddenDialog;

  constructor(private readonly page: Page) {
    this.table = page.getByRole('table');
    // Linhas com células de dados; o cabeçalho só tem columnheader.
    this.rows = this.table.getByRole('row').filter({ has: page.getByRole('cell') });
    this.search = page.getByRole('searchbox', { name: 'Pesquisar usuários' });
    this.createButton = page.getByRole('button', { name: 'Criar novo usuário', exact: true });
    // Acento opcional: a tela mostra "usuario"; o responsável tratou como ajuste de texto
    // com o DEV, sem defeito (2026-11-27). O texto e a pontuação continuam exatos.
    this.emptyState = page.getByText(/^Nenhum usu[aá]rio encontrado\.$/);
    this.createDialog = new UserForm(page.getByRole('dialog', { name: 'Criar usuário' }));
    this.editDialog = new UserForm(page.getByRole('dialog', { name: 'Editar usuário' }));
    this.deleteDialog = page.getByRole('dialog', { name: 'Excluir usuário' });
    this.menuLink = page.getByRole('navigation').getByRole('button', { name: 'Usuários' });
    this.forbiddenDialog = page.getByRole('dialog', { name: 'Acesso negado (403)' });
  }

  /**
   * Abre a lista e espera a primeira carga terminar. Sem isso, a resposta da carga
   * inicial pode chegar depois da resposta da busca e sobrescrever o resultado.
   */
  async open() {
    await Promise.all([this.waitForList(), this.page.goto('/usuarios')]);
  }

  /** Abre a lista já filtrada: isola a massa do teste dos demais cadastros do banco. */
  async openFiltered(term: string) {
    await this.open();
    await Promise.all([this.waitForList(), this.search.fill(term)]);
  }

  rowWith(text: string) {
    return this.rows.filter({ hasText: text });
  }

  editButton(row: ReturnType<UsersPage['rowWith']>) {
    return row.getByRole('button', { name: 'Editar usuario' });
  }

  deleteButton(row: ReturnType<UsersPage['rowWith']>) {
    return row.getByRole('button', { name: 'Excluir usuario' });
  }

  /**
   * Espera a resposta do GET /users (lista ou busca); não usa networkidle.
   * No container a tela chama `/api/users` (proxy do Nginx); no modo dev, `/users`.
   */
  private waitForList() {
    return this.page.waitForResponse(
      (response) =>
        /^(\/api)?\/users$/.test(new URL(response.url()).pathname) &&
        response.request().method() === 'GET',
    );
  }
}

/** Campos do modal de criação/edição de usuário. */
export class UserForm {
  readonly name;
  readonly email;
  readonly password;
  readonly confirmPassword;
  readonly role;
  readonly status;
  readonly submit;
  readonly cancel;

  constructor(readonly dialog: ReturnType<Page['getByRole']>) {
    // A tela usa "Nome completo" e a história diz "Nome": o prefixo cobre os dois.
    this.name = dialog.getByLabel(/^Nome/);
    this.email = dialog.getByLabel(/^E-mail/);
    this.password = dialog.getByLabel(/^Senha/);
    this.confirmPassword = dialog.getByLabel(/^Confirm/);
    this.role = dialog.getByLabel(/^Perfil/);
    this.status = dialog.getByLabel(/^Status/);
    // "Criar novo usuário" na criação e "Salvar" na edição.
    this.submit = dialog.getByRole('button', { name: /^(Criar novo usuário|Salvar)$/ });
    this.cancel = dialog.getByRole('button', { name: 'Cancelar' });
  }

  /** Preenche o formulário; um campo com `undefined` fica vazio. */
  async fill(data: {
    nome?: string;
    usuario?: string;
    senha?: string;
    confirmacao?: string;
    role?: 'ADMIN' | 'USER';
  }) {
    if (data.nome !== undefined) await this.name.fill(data.nome);
    if (data.usuario !== undefined) await this.email.fill(data.usuario);
    if (data.senha !== undefined) await this.password.fill(data.senha);
    if (data.confirmacao !== undefined) await this.confirmPassword.fill(data.confirmacao);
    if (data.role !== undefined) await this.role.selectOption(data.role);
  }
}
