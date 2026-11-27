import { randomUUID } from 'node:crypto';

export type IngredientPayload = { name: string; dosage: number; unitMeasurement: string };
export type MedicationPayload = {
  medicationName: string;
  activeIngredient: IngredientPayload[];
  category: string;
  presentationFormat: string;
  manufacturer: string;
};

/**
 * Prefixo único por teste. Buscar por ele isola a massa do teste dos demais
 * cadastros do banco, e as contagens de páginas ficam previsíveis.
 */
export function newPrefix(label = 'QA Pagina'): string {
  return `${label} ${randomUUID().slice(0, 8)}`;
}

/** Cadastros com o mesmo prefixo e o sufixo informado; dosagem distinta evita a duplicidade. */
export function medicationsNamed(prefix: string, suffixes: string[]): MedicationPayload[] {
  return suffixes.map((suffix, index) =>
    newMedication({
      medicationName: `${prefix} ${suffix}`.trim(),
      activeIngredient: [{ name: 'Princípio QA', dosage: index + 1, unitMeasurement: 'mg' }],
    }),
  );
}

/**
 * Medicamento sintético e válido, com nome único por chamada para que os testes
 * rodem em paralelo e no PostgreSQL já populado sem colidir na duplicidade.
 */
export function newMedication(overrides: Partial<MedicationPayload> = {}): MedicationPayload {
  return {
    medicationName: `QA Medicamento ${randomUUID().slice(0, 8)}`,
    activeIngredient: [{ name: 'Princípio QA', dosage: 500, unitMeasurement: 'mg' }],
    category: 'ANALGESIC',
    presentationFormat: 'TABLET',
    manufacturer: 'Fabricante QA',
    ...overrides,
  };
}
