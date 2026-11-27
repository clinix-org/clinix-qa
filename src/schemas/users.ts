import { z } from 'zod';

// O backend devolve data/hora sem fuso (LocalDateTime), no relógio do container.
const localDateTime = z.iso.datetime({ local: true });

/** Resposta de usuário; `strict` reprova qualquer campo extra, como senha ou hash. */
export const userSchema = z.strictObject({
  id: z.number().int().positive(),
  nome: z.string().min(1),
  usuario: z.string().min(1),
  role: z.enum(['ADMIN', 'USER']),
  ativo: z.boolean(),
  createdBy: z.string().min(1).nullable(),
  createdAt: localDateTime.nullable(),
  updatedBy: z.string().min(1).nullable(),
  updatedAt: localDateTime.nullable(),
});

export const userListSchema = z.array(userSchema);

export type UserRecord = z.infer<typeof userSchema>;

/**
 * Converte a data/hora sem fuso do backend em instante. O container do backend roda em
 * UTC (local e CI); se o fuso do servidor mudar, este é o único ponto a ajustar.
 */
export function serverInstant(value: string | null): number {
  return Date.parse(`${value}Z`);
}
