import { test, expect } from '../../src/fixtures/test.ts';

test.describe(
  'Disponibilidade da API',
  { tag: ['@api', '@smoke'], annotation: { type: 'feature', description: 'ambiente' } },
  () => {
    test('deve informar status UP quando o backend está disponível', async ({ request }) => {
      const response = await request.get('/actuator/health');

      expect(response.status()).toBe(200);
      expect(await response.json()).toMatchObject({ status: 'UP' });
    });
  },
);
