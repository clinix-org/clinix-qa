import type { ClinixApi } from '../../../src/api/clinix-api.ts';
import { test, expect } from '../../../src/fixtures/test.ts';
import { medicationsNamed, newPrefix } from '../../../src/data/medications.ts';
import { apiErrorSchema } from '../../../src/schemas/auth.ts';
import { medicationPageSchema } from '../../../src/schemas/medications.ts';

const story = { type: 'story', description: 'SCRUM-33' };
const INVALID_PAGINATION = 'Paginação inválida. Use páginas de 1 a 100 itens.';
const INVALID_SORT = 'Ordenação inválida.';
const MALFORMED = 'Confira o formato dos dados informados.';

// Mesma partição do critério (25 itens, páginas de 10) em escala menor: 5 itens, páginas de 2
// = 2 páginas cheias e uma última parcial.
const FIVE = ['A', 'B', 'C', 'D', 'E'];

/** Lê as páginas pedidas com a mesma consulta; cada leitura precisa responder 200. */
async function readPages(
  api: ClinixApi,
  token: string,
  query: Record<string, string | number>,
  pageNumbers: number[],
) {
  return Promise.all(
    pageNumbers.map(async (pageNumber) => {
      const response = await api.listMedicationPage(token, { ...query, pageNumber });
      if (!response.ok()) throw new Error(`Página ${pageNumber}: HTTP ${response.status()}`);
      return medicationPageSchema.parse(await response.json());
    }),
  );
}

test.describe(
  'Paginação de medicamentos › páginas e totais',
  { tag: ['@api'], annotation: story },
  () => {
    test(
      'deve devolver 2 itens, total 5, 3 páginas e não ser a última quando a primeira página tem tamanho 2',
      { tag: ['@smoke', '@contract'] },
      async ({ api, medications }) => {
        const prefix = newPrefix();
        await medications.seed(medicationsNamed(prefix, FIVE));

        const response = await api.listMedicationPage(medications.userToken, {
          search: prefix,
          pageNumber: 0,
          pageSize: 2,
        });

        expect(response.status()).toBe(200);
        const page = medicationPageSchema.parse(await response.json());
        expect(page).toMatchObject({
          pageNumber: 0,
          pageSize: 2,
          totalElements: 5,
          totalPages: 3,
          lastPage: false,
        });
        expect(page.content).toHaveLength(2);
      },
    );

    test(
      'deve devolver o item restante e indicar a última página quando a página 2 de tamanho 2 é pedida',
      { tag: '@regression' },
      async ({ api, medications }) => {
        const prefix = newPrefix();
        await medications.seed(medicationsNamed(prefix, FIVE));

        const response = await api.listMedicationPage(medications.userToken, {
          search: prefix,
          pageNumber: 2,
          pageSize: 2,
        });

        expect(response.status()).toBe(200);
        const page = medicationPageSchema.parse(await response.json());
        expect(page).toMatchObject({ pageNumber: 2, totalElements: 5, lastPage: true });
        expect(page.content.map((m) => m.medicationName)).toEqual([`${prefix} E`]);
      },
    );

    test(
      'deve devolver 200 com lista vazia quando a página pedida passa da última',
      { tag: '@regression' },
      async ({ api, medications }) => {
        const prefix = newPrefix();
        await medications.seed(medicationsNamed(prefix, FIVE));

        const response = await api.listMedicationPage(medications.userToken, {
          search: prefix,
          pageNumber: 3,
          pageSize: 2,
        });

        expect(response.status()).toBe(200);
        const page = medicationPageSchema.parse(await response.json());
        expect(page).toMatchObject({ content: [], totalElements: 5, totalPages: 3 });
      },
    );

    test(
      'deve usar a página 0 e 10 itens por página quando nenhum parâmetro é enviado',
      { tag: '@regression' },
      async ({ api, medications }) => {
        const response = await api.listMedicationPage(medications.userToken);

        expect(response.status()).toBe(200);
        const page = medicationPageSchema.parse(await response.json());
        expect(page).toMatchObject({ pageNumber: 0, pageSize: 10 });
        expect(page.content.length).toBeLessThanOrEqual(10);
      },
    );

    for (const pageSize of [1, 100]) {
      test(
        `deve aceitar a listagem quando o tamanho da página é ${pageSize}`,
        { tag: '@regression' },
        async ({ api, medications }) => {
          const prefix = newPrefix();
          await medications.seed(medicationsNamed(prefix, ['A', 'B']));

          const response = await api.listMedicationPage(medications.userToken, {
            search: prefix,
            pageSize,
          });

          expect(response.status()).toBe(200);
          const page = medicationPageSchema.parse(await response.json());
          expect(page.pageSize).toBe(pageSize);
          expect(page.content).toHaveLength(Math.min(pageSize, 2));
          expect(page.totalPages).toBe(Math.ceil(2 / pageSize));
        },
      );
    }
  },
);

test.describe(
  'Paginação de medicamentos › ordem entre páginas',
  { tag: ['@api', '@regression'], annotation: story },
  () => {
    test('deve seguir a ordem alfabética do nome em todas as páginas quando a ordenação é a padrão', async ({
      api,
      medications,
    }) => {
      const prefix = newPrefix();
      // Cadastrados fora de ordem: a ordem da resposta tem de vir da ordenação, não do cadastro.
      await medications.seed(medicationsNamed(prefix, ['C', 'A', 'E', 'B', 'D']));
      const query = { search: prefix, pageSize: 2 };

      const pages = await readPages(api, medications.userToken, query, [0, 1, 2]);

      expect(pages.flatMap((p) => p.content.map((m) => m.medicationName))).toEqual(
        FIVE.map((suffix) => `${prefix} ${suffix}`),
      );
    });

    test('deve listar cada medicamento uma única vez quando nomes iguais se espalham por várias páginas', async ({
      api,
      medications,
    }) => {
      const prefix = newPrefix();
      // Mesmo nome comercial, dosagens diferentes: o empate na ordenação é desfeito pelo ID.
      const ids = await medications.seed(medicationsNamed(prefix, ['', '', '', '', '']));
      const query = { search: prefix, pageSize: 2, sortBy: 'medicationName', sortOrder: 'asc' };

      const pages = await readPages(api, medications.userToken, query, [0, 1, 2]);

      expect(
        pages.flatMap((p) => p.content.map((m) => m.id)),
        'RN05: sem repetição nem omissão; empate desfeito pelo ID',
      ).toEqual([...ids].sort((a, b) => a - b));
    });
  },
);

test.describe(
  'Paginação de medicamentos › busca',
  { tag: ['@api', '@regression'], annotation: story },
  () => {
    test('deve contar só os medicamentos da busca quando o termo tem outra caixa e espaços extras', async ({
      api,
      medications,
    }) => {
      const prefix = newPrefix();
      await medications.seed(medicationsNamed(prefix, ['A', 'B', 'C']));

      const response = await api.listMedicationPage(medications.userToken, {
        search: `   ${prefix.toUpperCase().replace(' ', '   ')}  `,
        pageSize: 2,
      });

      expect(response.status()).toBe(200);
      const page = medicationPageSchema.parse(await response.json());
      expect(page).toMatchObject({ totalElements: 3, totalPages: 2, lastPage: false });
      expect(page.content.map((m) => m.medicationName)).toEqual([`${prefix} A`, `${prefix} B`]);
    });

    for (const { symbol, literal, wildcardMatch } of [
      { symbol: '%', literal: '100%', wildcardMatch: '1000' },
      { symbol: '_', literal: 'a_b', wildcardMatch: 'axb' },
    ]) {
      test(`deve tratar "${symbol}" como texto quando aparece no termo da busca`, async ({
        api,
        medications,
      }) => {
        const prefix = newPrefix();
        await medications.seed(medicationsNamed(prefix, [literal, wildcardMatch]));

        const response = await api.listMedicationPage(medications.userToken, {
          search: `${prefix} ${literal}`,
        });

        expect(response.status()).toBe(200);
        const page = medicationPageSchema.parse(await response.json());
        expect(page.content.map((m) => m.medicationName)).toEqual([`${prefix} ${literal}`]);
        expect(page.totalElements).toBe(1);
      });
    }
  },
);

test.describe(
  'Paginação de medicamentos › parâmetros inválidos',
  { tag: ['@api', '@regression'], annotation: story },
  () => {
    for (const { condition, params, message } of [
      { condition: 'a página é negativa', params: { pageNumber: -1 }, message: INVALID_PAGINATION },
      {
        condition: 'o tamanho da página é 0',
        params: { pageSize: 0 },
        message: INVALID_PAGINATION,
      },
      {
        condition: 'o tamanho da página é 101',
        params: { pageSize: 101 },
        message: INVALID_PAGINATION,
      },
      {
        condition: 'o campo de ordenação não é permitido',
        params: { sortBy: 'manufacturer' },
        message: INVALID_SORT,
      },
      {
        condition: 'a direção da ordenação não é asc nem desc',
        params: { sortOrder: 'up' },
        message: INVALID_SORT,
      },
      { condition: 'a página não é numérica', params: { pageNumber: 'abc' }, message: MALFORMED },
      {
        condition: 'o tamanho da página é decimal',
        params: { pageSize: '1.5' },
        message: MALFORMED,
      },
    ]) {
      test(`deve recusar com 400 e "${message}" quando ${condition}`, async ({
        api,
        medications,
      }) => {
        const response = await api.listMedicationPage(medications.userToken, params);

        expect(response.status()).toBe(400);
        const error = apiErrorSchema.parse(await response.json());
        expect(error).toMatchObject({ code: 'BAD_REQUEST', message });
      });
    }
  },
);

test.describe(
  'Paginação de medicamentos › acesso',
  { tag: ['@api', '@regression', '@security'], annotation: story },
  () => {
    test('deve recusar com 401 quando a listagem é pedida sem token', async ({ api }) => {
      const response = await api.listMedicationPage(null, { pageNumber: 0, pageSize: 2 });

      expect(response.status()).toBe(401);
      // O 401 do filtro de segurança não traz requestId (observação já registrada na SCRUM-21).
      const error = apiErrorSchema.omit({ requestId: true }).parse(await response.json());
      expect(error.code).toBe('AUTH_UNAUTHORIZED');
    });
  },
);
