import { test, expect } from '../../src/fixtures/test.ts';

test.describe(
  'Disponibilidade da aplicação',
  { tag: ['@ui', '@smoke'], annotation: { type: 'feature', description: 'ambiente' } },
  () => {
    test('deve exibir a tela de acesso quando o visitante abre /login', async ({ page }) => {
      await page.goto('/login');

      await expect(page.getByRole('heading', { name: 'Acessar o sistema' })).toBeVisible();
    });
  },
);
