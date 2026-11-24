import { test as setup, expect } from '../../src/fixtures/test.ts';
import { getUser } from '../../src/data/users.ts';

setup('deve preparar os usuários USER e inativo quando o ADMIN autentica', async ({ api }) => {
  const admin = getUser('admin');
  const token = await api.getToken(admin.usuario, admin.senha);
  expect(token, 'o ADMIN do ambiente deve conseguir autenticar').toBeTruthy();
  await api.ensureUser(token, getUser('user'));
  await api.ensureUser(token, getUser('inactive'));
});
