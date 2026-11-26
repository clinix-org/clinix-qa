import { randomInt } from 'node:crypto';
import { existsSync, writeFileSync } from 'node:fs';

if (existsSync('.env')) {
  console.log('.env já existe; nada foi alterado.');
} else {
  // O produto exige senha com exatamente 6 dígitos.
  const pin = () => String(randomInt(100000, 1000000));
  const lines = [
    'BASE_URL=http://localhost:5173',
    'API_URL=http://localhost:8090',
    'QA_LOCAL_DB_CONFIRMED=false',
    'QA_ADMIN_EMAIL=',
    'QA_ADMIN_PASSWORD=',
    `QA_USER_PASSWORD=${pin()}`,
    `QA_INACTIVE_PASSWORD=${pin()}`,
  ];
  writeFileSync('.env', lines.join('\n') + '\n', { mode: 0o600 });
  console.log('.env local criado . Preencha o ADMIN e confirme o banco.');
}
