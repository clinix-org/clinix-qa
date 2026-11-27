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
