// Gera credenciais descartáveis para a CI. Uso: node scripts/ci-env.mjs h2|postgres
import { randomBytes, randomInt } from 'node:crypto';
import { writeFileSync } from 'node:fs';

if (process.env.CI !== 'true')
  throw new Error('Somente na CI: evita sobrescrever arquivos locais.');
const database = process.argv[2];
if (!['h2', 'postgres'].includes(database)) throw new Error('Informe h2 ou postgres.');

function secret(value) {
  console.log(`::add-mask::${value}`);
  return value;
}
// O produto exige senha com exatamente 6 dígitos; 100000+ nunca coincide com a senha errada.
const pin = () => secret(String(randomInt(100000, 1000000)));
const adminPassword = pin();
const dbPassword = secret(randomBytes(16).toString('hex'));
const adminEmail = 'qa.admin@clinix.com';

const databaseLines =
  database === 'h2'
    ? ['DB_URL=jdbc:h2:mem:clinix_db', 'DB_USERNAME=sa', 'DB_PASSWORD=', 'DB_DDL_AUTO=create-drop']
    : [
        'DB_URL=jdbc:postgresql://clinix-saude-postgres:5432/clinix_db',
        'DB_USERNAME=clinix_user',
        `DB_PASSWORD=${dbPassword}`,
        'DB_DDL_AUTO=update',
        `POSTGRES_PASSWORD=${dbPassword}`,
      ];

// wx: falha se o arquivo já existir.
const options = { mode: 0o600, flag: 'wx' };
writeFileSync(
  '../clinix-backend/.env.local',
  [
    'SPRING_PROFILES_ACTIVE=local',
    ...databaseLines,
    `JWT_SECRET=${secret(randomBytes(32).toString('hex'))}`,
    'CORS_ALLOWED_ORIGINS=http://localhost:8091',
    'JPA_SHOW_SQL=false',
    'SWAGGER_ENABLED=false',
    'BOOTSTRAP_ADMIN_ENABLED=true',
    `ADMIN_EMAIL=${adminEmail}`,
    `ADMIN_PASSWORD=${adminPassword}`,
    'ADMIN_NAME=QA Admin',
    'ADMIN_ACTIVE=true',
    '',
  ].join('\n'),
  options,
);
writeFileSync(
  '.env',
  [
    'BASE_URL=http://localhost:8091',
    'API_URL=http://localhost:8090',
    'QA_LOCAL_DB_CONFIRMED=true',
    `QA_ADMIN_EMAIL=${adminEmail}`,
    `QA_ADMIN_PASSWORD=${adminPassword}`,
    `QA_USER_PASSWORD=${pin()}`,
    `QA_INACTIVE_PASSWORD=${pin()}`,
    '',
  ].join('\n'),
  options,
);
