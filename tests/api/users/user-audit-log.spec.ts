import { test, expect } from '../../../src/fixtures/test.ts';
import { getUser, newUser } from '../../../src/data/users.ts';
import { systemLogs } from '../../../src/db/system-logs.ts';
import { serverInstant, type UserRecord } from '../../../src/schemas/users.ts';
import type { ClinixApi } from '../../../src/api/clinix-api.ts';

const CLOCK_TOLERANCE_MS = 2_000;

// RN da SCRUM-16: "Todas as alterações (edição ou exclusão) devem ser registradas no log do
// sistema com data, hora e usuário que realizou a ação". Não há API nem tela para o log:
// a leitura é feita no PostgreSQL do container (decisão do responsável em 2026-11-27).
const changes = [
  {
    condition: 'edita um usuário',
    action: 'UPDATE',
    expectedStatus: 200,
    act: (api: ClinixApi, token: string, user: UserRecord) =>
      api.updateUser(token, user.id, {
        nome: `${user.nome} Editado`,
        usuario: user.usuario,
        role: user.role,
        ativo: false,
      }),
  },
  {
    condition: 'exclui um usuário',
    action: 'DELETE',
    expectedStatus: 204,
    act: (api: ClinixApi, token: string, user: UserRecord) => api.deleteUser(token, user.id),
  },
] as const;

test.describe(
  'Gestão de usuários › log do sistema',
  {
    tag: ['@api', '@regression', '@critical'],
    annotation: [
      { type: 'story', description: 'SCRUM-16' },
      { type: 'precondition', description: 'API com o PostgreSQL do container (não roda em H2)' },
    ],
  },
  () => {
    for (const { condition, action, expectedStatus, act } of changes) {
      test(`deve registrar a ação com data, hora e o ADMIN responsável quando o ADMIN ${condition}`, async ({
        api,
        users,
      }) => {
        const target = await users.seed(newUser());
        expect(
          await systemLogs.hasUser(target.id),
          'Pré-condição: a API precisa usar o PostgreSQL do container',
        ).toBe(true);
        const startedAt = Date.now();

        const response = await act(api, users.adminToken, target);

        expect(response.status()).toBe(expectedStatus);
        const entries = (await systemLogs.forUser(target.id)).filter((e) => e.action === action);
        expect(entries, `RN: um registro ${action} com o ADMIN que realizou a ação`).toEqual([
          expect.objectContaining({ performedBy: getUser('admin').usuario }),
        ]);
        const performedAt = serverInstant(entries[0]?.performedAt ?? null);
        expect(performedAt, 'RN: data e hora da ação').toBeGreaterThanOrEqual(
          startedAt - CLOCK_TOLERANCE_MS,
        );
        expect(performedAt).toBeLessThanOrEqual(Date.now() + CLOCK_TOLERANCE_MS);
      });
    }
  },
);
