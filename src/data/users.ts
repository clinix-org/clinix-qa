import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { env } from '../config/env.ts';

const userSchema = z.object({
  nome: z.string().min(1),
  usuario: z.string().regex(/^qa\.[a-z0-9]+@clinix\.com$/),
  role: z.enum(['ADMIN', 'USER']),
  ativo: z.boolean(),
  passwordEnv: z.string().regex(/^QA_[A-Z_]+$/),
});
// O e-mail do ADMIN vem do .env: é o usuário inicial do ambiente do projeto.
const adminSchema = userSchema
  .omit({ usuario: true })
  .extend({ usuarioEnv: z.string().regex(/^QA_[A-Z_]+$/) });
const usersSchema = z.object({ admin: adminSchema, user: userSchema, inactive: userSchema });

export type UserKey = keyof z.infer<typeof usersSchema>;

const file = new URL('../../test-data/users.json', import.meta.url);
const users = usersSchema.parse(JSON.parse(readFileSync(file, 'utf8')));

/** Dados do JSON (versionado) + senha do .env (nunca versionada). */
export function getUser(key: UserKey) {
  const { passwordEnv, ...user } = users[key];
  const { usuarioEnv, ...rest } = { usuarioEnv: undefined, ...user };
  const usuario = 'usuario' in rest ? rest.usuario : env.required(String(usuarioEnv));
  return { ...rest, usuario, senha: env.required(passwordEnv) };
}

export type NewUserPayload = {
  nome: string;
  usuario: string;
  senha: string;
  role: 'ADMIN' | 'USER';
};

/**
 * Usuário sintético e válido, com nome e e-mail únicos por chamada: os testes rodam
 * em paralelo e no PostgreSQL já populado sem colidir na regra de e-mail único.
 */
export function newUser(overrides: Partial<NewUserPayload> = {}): NewUserPayload {
  const id = randomUUID().replaceAll('-', '').slice(0, 10);
  return {
    nome: `QA Usuario ${id}`,
    usuario: `qa.tmp${id}@clinix.com`,
    senha: '246810',
    role: 'USER',
    ...overrides,
  };
}
