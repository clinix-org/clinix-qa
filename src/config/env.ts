import { existsSync } from 'node:fs';

if (existsSync('.env')) process.loadEnvFile('.env');

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variável ausente: ${name}. Rode "npm run env:init".`);
  return value;
}

/** Trava de segurança: os testes só rodam contra localhost. */
function localUrl(name: string): string {
  const value = required(name);
  if (!['localhost', '127.0.0.1'].includes(new URL(value).hostname)) {
    throw new Error(`${name} deve apontar para localhost. Execução bloqueada.`);
  }
  return value;
}

/** Localhost não prova que o banco é local: exige confirmação humana. */
if (process.env.QA_LOCAL_DB_CONFIRMED !== 'true') {
  throw new Error('Confirme que o banco do backend é local e defina QA_LOCAL_DB_CONFIRMED=true.');
}

export const env = { baseUrl: localUrl('BASE_URL'), apiUrl: localUrl('API_URL'), required };
