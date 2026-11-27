import { test, expect } from '../../../src/fixtures/test.ts';
import { getUser } from '../../../src/data/users.ts';
import { newMedication } from '../../../src/data/medications.ts';
import { apiErrorSchema } from '../../../src/schemas/auth.ts';
import {
  medicationOptionsSchema,
  medicationPageSchema,
  medicationSchema,
} from '../../../src/schemas/medications.ts';

const story = { type: 'story', description: 'SCRUM-21' };
// Relógio do container e do runner podem divergir alguns ms; 2 s não esconde data errada.
const CLOCK_TOLERANCE_MS = 2_000;
const DUPLICATE_MESSAGE = 'Medicamento já cadastrado.';

test.describe(
  'Cadastro de medicamentos › cadastro válido',
  { tag: ['@api', '@smoke', '@critical'], annotation: story },
  () => {
    test('deve retornar 201, estoque zero, data/hora e responsável quando o ADMIN cadastra um medicamento válido', async ({
      api,
      medications,
    }) => {
      const data = newMedication({
        activeIngredient: [{ name: 'Dipirona QA', dosage: 500, unitMeasurement: 'mg' }],
        category: 'ANALGESIC',
        presentationFormat: 'TABLET',
      });
      const startedAt = Date.now();

      const response = await medications.create(medications.adminToken, data);

      expect(response.status()).toBe(201);
      const created = medicationSchema.parse(await response.json());
      expect(response.headers()['location']).toBe(`/medications/${created.id}`);
      expect(created).toMatchObject({ ...data, quantity: 0 });
      expect(created.createdBy, 'RN02: responsável é o ADMIN autenticado').toBe(
        getUser('admin').usuario,
      );
      const createdAt = Date.parse(created.createdAt);
      expect(createdAt, 'RN02: data/hora do cadastro').toBeGreaterThanOrEqual(
        startedAt - CLOCK_TOLERANCE_MS,
      );
      expect(createdAt).toBeLessThanOrEqual(Date.now() + CLOCK_TOLERANCE_MS);

      const reread = await api.getMedication(medications.adminToken, created.id);
      expect(reread.status()).toBe(200);
      const persisted = medicationSchema.parse(await reread.json());
      expect(persisted).toMatchObject({ ...data, quantity: 0, createdBy: created.createdBy });
      // O POST devolve nanossegundos e o PostgreSQL guarda microssegundos: compara o instante em ms.
      expect(Date.parse(persisted.createdAt), 'RN02: data/hora persistida').toBe(createdAt);
    });
  },
);

test.describe(
  'Cadastro de medicamentos › acesso administrativo',
  { tag: ['@api', '@regression', '@critical', '@security'], annotation: story },
  () => {
    test('deve recusar sem cadastrar quando o USER tenta cadastrar', async ({ medications }) => {
      const data = newMedication();

      const response = await medications.create(medications.userToken, data);

      expect(response.status()).toBe(403);
      expect(apiErrorSchema.parse(await response.json()).code).toBe('AUTH_FORBIDDEN');
      expect(await medications.countByName(data.medicationName)).toBe(0);
    });

    test('deve recusar sem cadastrar quando não há token', async ({ medications }) => {
      const data = newMedication();

      const response = await medications.create(null, data);

      expect(response.status()).toBe(401);
      // O 401 do filtro de segurança não traz requestId (observação registrada no checklist).
      const error = apiErrorSchema.omit({ requestId: true }).parse(await response.json());
      expect(error.code).toBe('AUTH_UNAUTHORIZED');
      expect(await medications.countByName(data.medicationName)).toBe(0);
    });
  },
);

test.describe(
  'Cadastro de medicamentos › dosagem positiva',
  { tag: ['@api', '@regression', '@critical'], annotation: story },
  () => {
    const invalidDosages = [
      { condition: 'zero', dosage: 0 },
      { condition: 'negativa', dosage: -1 },
    ];
    for (const { condition, dosage } of invalidDosages) {
      test(`deve recusar quando a dosagem é ${condition}`, async ({ medications }) => {
        const data = newMedication({
          activeIngredient: [{ name: 'Princípio QA', dosage, unitMeasurement: 'mg' }],
        });

        const response = await medications.create(medications.adminToken, data);

        expect(response.status()).toBe(400);
        const error = apiErrorSchema.parse(await response.json());
        expect(error.code).toBe('VALIDATION_ERROR');
        expect(error.fields).toEqual({
          'activeIngredient[0].dosage': 'A dosagem deve ser maior que zero.',
        });
        expect(await medications.countByName(data.medicationName)).toBe(0);
      });
    }

    test('deve cadastrar quando a dosagem é a menor positiva aceita', async ({
      api,
      medications,
    }) => {
      const data = newMedication({
        activeIngredient: [{ name: 'Princípio QA', dosage: 0.000001, unitMeasurement: 'mg' }],
      });

      const response = await medications.create(medications.adminToken, data);

      expect(response.status()).toBe(201);
      const { id } = medicationSchema.parse(await response.json());
      const reread = medicationSchema.parse(
        await (await api.getMedication(medications.adminToken, id)).json(),
      );
      expect(reread.activeIngredient[0]?.dosage).toBe(0.000001);
    });
  },
);

test.describe(
  'Cadastro de medicamentos › campos obrigatórios',
  { tag: ['@api', '@regression'], annotation: story },
  () => {
    const ingredient = { name: 'Princípio QA', dosage: 500, unitMeasurement: 'mg' };
    const missingFields = [
      { label: 'o nome', field: 'medicationName', change: { medicationName: undefined } },
      {
        label: 'o princípio ativo',
        field: 'activeIngredient[0].name',
        change: { activeIngredient: [{ ...ingredient, name: undefined }] },
      },
      {
        label: 'a dosagem',
        field: 'activeIngredient[0].dosage',
        change: { activeIngredient: [{ ...ingredient, dosage: undefined }] },
      },
      {
        label: 'a unidade',
        field: 'activeIngredient[0].unitMeasurement',
        change: { activeIngredient: [{ ...ingredient, unitMeasurement: undefined }] },
      },
      { label: 'a categoria', field: 'category', change: { category: undefined } },
      {
        label: 'a apresentação',
        field: 'presentationFormat',
        change: { presentationFormat: undefined },
      },
      { label: 'o fabricante', field: 'manufacturer', change: { manufacturer: undefined } },
    ];
    for (const { label, field, change } of missingFields) {
      test(`deve indicar o campo obrigatório quando falta ${label}`, async ({ medications }) => {
        const valid = newMedication();

        const response = await medications.create(medications.adminToken, { ...valid, ...change });

        expect(response.status()).toBe(400);
        const error = apiErrorSchema.parse(await response.json());
        expect(error.code).toBe('VALIDATION_ERROR');
        expect(Object.keys(error.fields ?? {})).toEqual([field]);
        expect(await medications.countByName(valid.medicationName)).toBe(0);
      });
    }
  },
);

test.describe(
  'Cadastro de medicamentos › listas predefinidas',
  { tag: ['@api', '@regression'], annotation: story },
  () => {
    test('deve retornar as listas de unidades, categorias e apresentações quando o usuário está autenticado', async ({
      api,
      medications,
    }) => {
      const response = await api.medicationOptions(medications.userToken);

      expect(response.status()).toBe(200);
      const options = medicationOptionsSchema.parse(await response.json());
      // Exemplos citados na história; "ml" está em dúvida com o PO e não é verificado.
      expect(options.units.map((o) => o.value)).toContain('mg');
      expect(options.categories.map((o) => o.label)).toContain('Antialérgico');
      expect(options.presentationFormats.map((o) => o.label)).toEqual(
        expect.arrayContaining(['Gotas', 'Comprimido']),
      );
    });

    const foreignOptions = [
      {
        label: 'unidade',
        change: {
          activeIngredient: [{ name: 'Princípio QA', dosage: 500, unitMeasurement: 'colher' }],
        },
        message: 'Selecione uma opção válida para unidade de medida.',
      },
      {
        label: 'categoria',
        change: { category: 'VITAMINA' },
        message: 'Selecione uma opção válida para categoria.',
      },
      {
        label: 'apresentação',
        change: { presentationFormat: 'ADESIVO' },
        message: 'Selecione uma opção válida para forma de apresentação.',
      },
    ];
    for (const { label, change, message } of foreignOptions) {
      test(`deve recusar quando a opção não pertence à lista de ${label}`, async ({
        medications,
      }) => {
        const data = newMedication(change);

        const response = await medications.create(medications.adminToken, data);

        expect(response.status()).toBe(400);
        const error = apiErrorSchema.parse(await response.json());
        expect(error.code).toBe('BAD_REQUEST');
        expect(error.message).toBe(message);
        expect(await medications.countByName(data.medicationName)).toBe(0);
      });
    }
  },
);

test.describe(
  'Cadastro de medicamentos › medicamento já cadastrado',
  { tag: ['@api', '@smoke', '@critical'], annotation: story },
  () => {
    test('deve retornar 409 e "Medicamento já cadastrado." quando nome, dosagem e unidade já existem', async ({
      medications,
    }) => {
      const data = newMedication();
      expect((await medications.create(medications.adminToken, data)).status()).toBe(201);

      const response = await medications.create(medications.adminToken, data);

      expect(response.status()).toBe(409);
      const error = apiErrorSchema.parse(await response.json());
      expect(error.code).toBe('RESOURCE_CONFLICT');
      expect(error.message).toBe(DUPLICATE_MESSAGE);
      expect(await medications.countByName(data.medicationName)).toBe(1);
    });
  },
);

test.describe(
  'Cadastro de medicamentos › mesmo nome com outra dosagem ou unidade',
  { tag: ['@api', '@regression'], annotation: story },
  () => {
    const variations = [
      { label: 'a dosagem', dosage: 250, unitMeasurement: 'mg' },
      { label: 'a unidade', dosage: 500, unitMeasurement: 'g' },
    ];
    for (const { label, dosage, unitMeasurement } of variations) {
      test(`deve cadastrar quando o nome é igual e muda ${label}`, async ({ medications }) => {
        const original = newMedication({
          activeIngredient: [{ name: 'Princípio QA', dosage: 500, unitMeasurement: 'mg' }],
        });
        expect((await medications.create(medications.adminToken, original)).status()).toBe(201);
        const variation = {
          ...original,
          activeIngredient: [{ name: 'Princípio QA', dosage, unitMeasurement }],
        };

        const response = await medications.create(medications.adminToken, variation);

        expect(response.status()).toBe(201);
        expect(medicationSchema.parse(await response.json()).activeIngredient).toEqual(
          variation.activeIngredient,
        );
        expect(await medications.countByName(original.medicationName)).toBe(2);
      });
    }
  },
);

test.describe(
  'Cadastro de medicamentos › lista principal',
  { tag: ['@api', '@regression'], annotation: story },
  () => {
    test('deve aparecer na listagem quando o cadastro é concluído', async ({
      api,
      medications,
    }) => {
      const data = newMedication();
      const { id } = medicationSchema.parse(
        await (await medications.create(medications.adminToken, data)).json(),
      );

      const response = await api.listMedications(medications.userToken, data.medicationName);

      expect(response.status()).toBe(200);
      const page = medicationPageSchema.parse(await response.json());
      expect(page.content.map((m) => ({ id: m.id, name: m.medicationName }))).toContainEqual({
        id,
        name: data.medicationName,
      });
    });
  },
);
