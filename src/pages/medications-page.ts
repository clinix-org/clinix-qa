import type { Page } from '@playwright/test';
import type { MedicationPayload } from '../data/medications.ts';

/** Ações e locators da lista e do cadastro de medicamentos; asserções ficam nos testes. */
export class MedicationsPage {
  readonly table;
  readonly createButton;
  readonly dialog;
  readonly name;
  readonly ingredient;
  readonly dosage;
  readonly unit;
  readonly category;
  readonly presentation;
  readonly manufacturer;
  readonly submit;
  readonly successMessage;
  readonly duplicateMessage;

  constructor(private readonly page: Page) {
    // data-state indica quando a lista terminou de carregar (sem papel ARIA equivalente).
    this.table = page.getByTestId('medications-table');
    // exact: texto da história; o botão decorativo antigo ("Novo medicamento") não pode passar.
    this.createButton = page.getByRole('button', { name: 'Novo Medicamento', exact: true });
    this.dialog = page.getByRole('dialog', { name: 'Novo medicamento' });
    this.name = this.dialog.getByLabel('Nome do medicamento');
    // Âncora: "Adicionar princípio ativo" (botão) também contém o texto.
    this.ingredient = this.dialog.getByLabel(/^Princípio ativo/);
    this.dosage = this.dialog.getByLabel('Dosagem');
    this.unit = this.dialog.getByLabel('Unidade de medida');
    this.category = this.dialog.getByLabel('Categoria');
    this.presentation = this.dialog.getByLabel('Forma de apresentação');
    this.manufacturer = this.dialog.getByLabel('Fabricante do medicamento');
    this.submit = this.dialog.getByRole('button', { name: 'Cadastrar' });
    // O texto do toast é dividido em vários elementos; o test id o reúne.
    this.successMessage = page.getByTestId('medications-success-toast-message');
    this.duplicateMessage = page.getByTestId('medications-duplicate-toast-message');
  }

  async open() {
    await this.page.goto('/medicamentos');
  }

  rowWithName(name: string) {
    return this.table.getByRole('row').filter({ hasText: name });
  }

  /** Preenche o formulário; um campo com `undefined` fica vazio. */
  async fill(data: Partial<MedicationPayload>) {
    const ingredient = data.activeIngredient?.[0];
    if (data.medicationName !== undefined) await this.name.fill(data.medicationName);
    if (ingredient?.name !== undefined) await this.ingredient.fill(ingredient.name);
    if (ingredient?.dosage !== undefined) await this.dosage.fill(String(ingredient.dosage));
    if (ingredient?.unitMeasurement !== undefined)
      await this.unit.selectOption(ingredient.unitMeasurement);
    if (data.category !== undefined) await this.category.selectOption(data.category);
    if (data.presentationFormat !== undefined)
      await this.presentation.selectOption(data.presentationFormat);
    if (data.manufacturer !== undefined) await this.manufacturer.fill(data.manufacturer);
  }
}
