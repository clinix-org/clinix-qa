import type { Page } from '@playwright/test';

/** Ações e locators da tela de login; asserções ficam nos testes. */
export class LoginPage {
  readonly title;
  readonly logo;
  readonly email;
  readonly password;
  readonly submit;
  readonly alert;

  constructor(private readonly page: Page) {
    this.title = page.getByRole('heading', { name: 'Acessar o sistema' });
    this.logo = page.getByRole('img', { name: 'Clinix Logo' });
    this.email = page.getByLabel('E-mail');
    this.password = page.getByLabel('Senha');
    this.submit = page.getByRole('button', { name: 'Entrar', exact: true });
    this.alert = page.getByRole('alert');
  }

  async open() {
    await this.page.goto('/login');
  }

  async fillCredentials(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
  }

  async signIn(email: string, password: string) {
    await this.fillCredentials(email, password);
    await this.submit.click();
  }
}
