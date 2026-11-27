import { test, expect } from '../../../src/fixtures/test.ts';
import { medicationsNamed, newPrefix } from '../../../src/data/medications.ts';

const story = { type: 'story', description: 'SCRUM-33' };

/** Sufixos "01", "02", ...: a tela ordena por data de cadastro, que segue esta sequência. */
const numbered = (count: number) =>
  Array.from({ length: count }, (_, index) => String(index + 1).padStart(2, '0'));
const names = (prefix: string, suffixes: string[]) => suffixes.map((s) => `${prefix} ${s}`);

test.describe('Paginação de medicamentos › navegação', { tag: ['@ui'], annotation: story }, () => {
  test.beforeEach(async ({ signInAs }) => {
    await signInAs('user');
  });

  test(
    'deve mostrar 10 medicamentos, o total e a página 1 destacada quando a lista abre com 12 resultados',
    { tag: '@smoke' },
    async ({ medicationsPage: screen, medications }) => {
      const prefix = newPrefix();
      await medications.seed(medicationsNamed(prefix, numbered(12)));

      await screen.openFiltered(prefix);

      await expect(screen.rowNames).toHaveText(names(prefix, numbered(10)));
      await expect(screen.totalCount).toHaveText('de 12 resultados.');
      await expect(screen.itemsPerPage, 'RNI02: 10 itens por página por padrão').toHaveValue('10');
      await expect(screen.numberButton(1)).toHaveAttribute('aria-current', 'page');
    },
  );

  test(
    'deve mostrar a página seguinte e voltar à anterior quando uso Próxima e Anterior',
    { tag: '@regression' },
    async ({ medicationsPage: screen, medications }) => {
      const prefix = newPrefix();
      await medications.seed(medicationsNamed(prefix, numbered(12)));
      await screen.openFiltered(prefix);
      await expect(screen.rowNames).toHaveText(names(prefix, numbered(10)));

      await screen.nextPage.click();

      await expect(screen.rowNames).toHaveText(names(prefix, ['11', '12']));
      await expect(screen.numberButton(2)).toHaveAttribute('aria-current', 'page');

      await screen.previousPage.click();

      await expect(screen.rowNames).toHaveText(names(prefix, numbered(10)));
      await expect(screen.numberButton(1)).toHaveAttribute('aria-current', 'page');
    },
  );

  test(
    'deve desabilitar Anterior na primeira página e Próxima na última quando há 2 páginas',
    { tag: '@regression' },
    async ({ medicationsPage: screen, medications }) => {
      const prefix = newPrefix();
      await medications.seed(medicationsNamed(prefix, numbered(12)));
      await screen.openFiltered(prefix);
      await expect(screen.totalCount).toHaveText('de 12 resultados.');

      await expect(screen.previousPage).toBeDisabled();
      await expect(screen.nextPage).toBeEnabled();

      await screen.numberButton(2).click();

      await expect(screen.rowNames).toHaveText(names(prefix, ['11', '12']));
      await expect(screen.nextPage).toBeDisabled();
      await expect(screen.previousPage).toBeEnabled();
    },
  );

  test(
    'deve ir à página clicada e mostrar só a primeira, a vizinha e a última quando há 5 páginas',
    { tag: '@regression' },
    async ({ medicationsPage: screen, medications }) => {
      const prefix = newPrefix();
      await medications.seed(medicationsNamed(prefix, numbered(25)));
      await screen.openFiltered(prefix);
      await screen.itemsPerPage.selectOption('5');
      await expect(screen.totalCount).toHaveText('de 25 resultados.');

      await screen.numberButton(5).click();

      await expect(screen.rowNames).toHaveText(names(prefix, ['21', '22', '23', '24', '25']));
      await expect(screen.numberButton(5)).toHaveAttribute('aria-current', 'page');
      await expect(screen.numberButton(1)).toBeVisible();
      await expect(screen.numberButton(4)).toBeVisible();
      await expect(screen.numberButton(2), 'RNI03: página distante fica oculta').toHaveCount(0);
      await expect(screen.numberButton(3), 'RNI03: página distante fica oculta').toHaveCount(0);
      await expect(screen.pagination.getByText('...')).toBeVisible();
    },
  );
});

test.describe(
  'Paginação de medicamentos › mudança de filtro',
  { tag: ['@ui', '@regression'], annotation: story },
  () => {
    test.beforeEach(async ({ signInAs }) => {
      await signInAs('user');
    });

    test('deve voltar à página 1 e mostrar os 12 itens quando mudo para 20 itens por página', async ({
      medicationsPage: screen,
      medications,
    }) => {
      const prefix = newPrefix();
      await medications.seed(medicationsNamed(prefix, numbered(12)));
      await screen.openFiltered(prefix);
      await screen.nextPage.click();
      await expect(screen.numberButton(2)).toHaveAttribute('aria-current', 'page');

      await screen.itemsPerPage.selectOption('20');

      await expect(screen.rowNames).toHaveText(names(prefix, numbered(12)));
      await expect(screen.numberButton(1)).toHaveAttribute('aria-current', 'page');
      await expect(screen.numberButton(2)).toHaveCount(0);
    });

    test('deve voltar à página 1 e atualizar o total quando a busca muda estando na página 2', async ({
      medicationsPage: screen,
      medications,
    }) => {
      const prefix = newPrefix();
      await medications.seed(medicationsNamed(prefix, numbered(12)));
      await screen.openFiltered(prefix);
      await screen.nextPage.click();
      await expect(screen.numberButton(2)).toHaveAttribute('aria-current', 'page');

      // "<prefixo> 1" encontra só 10, 11 e 12.
      await screen.search.fill(`${prefix} 1`);

      await expect(screen.rowNames).toHaveText(names(prefix, ['10', '11', '12']));
      await expect(screen.totalCount).toHaveText('de 3 resultados.');
      await expect(screen.numberButton(1)).toHaveAttribute('aria-current', 'page');
    });
  },
);

test.describe(
  'Paginação de medicamentos › estados da lista',
  { tag: ['@ui', '@regression'], annotation: story },
  () => {
    test.beforeEach(async ({ signInAs }) => {
      await signInAs('user');
    });

    test('deve mostrar "Nenhum medicamento encontrado.", 0 resultados e a navegação desabilitada quando a busca não encontra nada', async ({
      medicationsPage: screen,
    }) => {
      await screen.openFiltered(newPrefix('QA Inexistente'));

      await expect(screen.emptyState).toBeVisible();
      await expect(screen.totalCount).toHaveText('de 0 resultados.');
      await expect(screen.numberButton(1)).toHaveAttribute('aria-current', 'page');
      await expect(screen.previousPage).toBeDisabled();
      await expect(screen.nextPage).toBeDisabled();
    });

    test('deve mostrar a mensagem de erro da API quando a listagem falha', async ({
      page,
      medicationsPage: screen,
    }) => {
      const message = 'Nao foi possivel concluir a operacao. Tente novamente mais tarde.';
      // Simula a falha só na listagem; /medications/options continua real.
      await page.route(
        (url) => url.pathname.endsWith('/medications'),
        (route) =>
          route.fulfill({ status: 500, json: { status: 500, code: 'INTERNAL_ERROR', message } }),
      );

      await screen.open();

      await expect(screen.listError).toHaveText(message);
      await expect(screen.table).toHaveAttribute('data-state', 'error');
    });
  },
);
