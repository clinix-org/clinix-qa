import { test, expect } from '../../../src/fixtures/test.ts';
import { newMedication } from '../../../src/data/medications.ts';

const story = { type: 'story', description: 'SCRUM-21' };
const DUPLICATE_MESSAGE = 'Medicamento já cadastrado.';

test.describe(
  'Cadastro de medicamentos › acesso ao cadastro',
  { tag: ['@ui', '@critical'], annotation: story },
  () => {
    test(
      'deve exibir "Novo Medicamento" quando o ADMIN abre a lista',
      { tag: '@smoke' },
      async ({ signInAs, medicationsPage }) => {
        await signInAs('admin');

        await medicationsPage.open();

        await expect(medicationsPage.createButton).toBeVisible();
        await expect(medicationsPage.createButton).toBeEnabled();
      },
    );

    test(
      'não deve exibir "Novo Medicamento" quando o USER abre a lista',
      { tag: ['@regression', '@security'] },
      async ({ signInAs, medicationsPage }) => {
        await signInAs('user');

        await medicationsPage.open();

        // Espera a lista terminar de carregar: a ausência do botão só vale com a tela pronta.
        await expect(medicationsPage.table).toHaveAttribute('data-state', /^(ready|empty)$/);
        await expect(medicationsPage.createButton).toHaveCount(0);
      },
    );
  },
);

test.describe(
  'Cadastro de medicamentos › formulário',
  { tag: ['@ui', '@regression'], annotation: story },
  () => {
    test.beforeEach(async ({ signInAs, medicationsPage }) => {
      await signInAs('admin');
      await medicationsPage.open();
      await medicationsPage.createButton.click();
    });

    test('deve apresentar os campos obrigatórios e as listas de opções quando o formulário abre', async ({
      medicationsPage: form,
    }) => {
      await expect(form.dialog).toBeVisible();
      await expect(form.name).toHaveAttribute('required');
      await expect(form.ingredient).toHaveAttribute('required');
      await expect(form.dosage).toHaveAttribute('required');
      await expect(form.unit).toHaveAttribute('required');
      await expect(form.category).toHaveAttribute('required');
      await expect(form.presentation).toHaveAttribute('required');
      await expect(form.manufacturer).toHaveAttribute('required');
      // Listas predefinidas, com exemplos citados na história ("ml" está em dúvida com o PO).
      await expect(form.unit).toHaveJSProperty('tagName', 'SELECT');
      await expect(form.unit).toContainText('mg — Miligrama');
      await expect(form.category).toHaveJSProperty('tagName', 'SELECT');
      await expect(form.category).toContainText('Antialérgico');
      await expect(form.presentation).toHaveJSProperty('tagName', 'SELECT');
      await expect(form.presentation).toContainText('Comprimido');
      await expect(form.presentation).toContainText('Gotas');
    });

    test('deve alertar e não enviar quando há campo obrigatório vazio', async ({
      medicationsPage: form,
      medications,
    }) => {
      const data = newMedication();
      medications.cleanupByName(data.medicationName);
      await form.fill({ ...data, manufacturer: undefined });

      await form.submit.click();

      // O alerta é o balão nativo do navegador: não fica no DOM, mas aparece em validationMessage.
      expect(
        await form.manufacturer.evaluate((el: HTMLInputElement) => el.validity.valueMissing),
      ).toBe(true);
      await expect(form.manufacturer).not.toHaveJSProperty('validationMessage', '');
      await expect(form.dialog).toBeVisible();
      expect(await medications.countByName(data.medicationName)).toBe(0);
    });

    test('deve alertar e não enviar quando a dosagem é zero', async ({
      medicationsPage: form,
      medications,
    }) => {
      const data = newMedication({
        activeIngredient: [{ name: 'Princípio QA', dosage: 0, unitMeasurement: 'mg' }],
      });
      medications.cleanupByName(data.medicationName);
      await form.fill(data);

      await form.submit.click();

      expect(await form.dosage.evaluate((el: HTMLInputElement) => el.validity.rangeUnderflow)).toBe(
        true,
      );
      await expect(form.dosage).not.toHaveJSProperty('validationMessage', '');
      await expect(form.dialog).toBeVisible();
      expect(await medications.countByName(data.medicationName)).toBe(0);
    });
  },
);

test.describe(
  'Cadastro de medicamentos › salvar',
  { tag: ['@ui', '@critical'], annotation: story },
  () => {
    test.beforeEach(async ({ signInAs, medicationsPage }) => {
      await signInAs('admin');
      await medicationsPage.open();
    });

    test(
      'deve exibir sucesso e mostrar o medicamento na lista quando todos os campos são válidos',
      { tag: '@smoke' },
      async ({ medicationsPage: screen, medications }) => {
        const data = newMedication({
          activeIngredient: [{ name: 'Dipirona QA', dosage: 500, unitMeasurement: 'mg' }],
          category: 'ANALGESIC',
          presentationFormat: 'TABLET',
        });
        medications.cleanupByName(data.medicationName);
        await screen.createButton.click();
        await screen.fill(data);

        await screen.submit.click();

        await expect(screen.successMessage).toHaveText(
          `Medicamento ${data.medicationName} (comprimido, 500 mg) cadastrado com sucesso.`,
        );
        await expect(screen.dialog).toBeHidden();
        await expect(screen.rowWithName(data.medicationName)).toBeVisible();
        expect(await medications.countByName(data.medicationName)).toBe(1);
      },
    );

    test(
      'deve exibir "Medicamento já cadastrado." quando o medicamento já existe',
      { tag: '@regression' },
      async ({ medicationsPage: screen, medications }) => {
        const data = newMedication();
        expect((await medications.create(medications.adminToken, data)).status()).toBe(201);
        await screen.createButton.click();
        await screen.fill(data);

        await screen.submit.click();

        await expect(screen.duplicateMessage).toHaveText(DUPLICATE_MESSAGE);
        await expect(screen.dialog, 'o formulário fica aberto para correção').toBeVisible();
        expect(await medications.countByName(data.medicationName)).toBe(1);
      },
    );
  },
);
