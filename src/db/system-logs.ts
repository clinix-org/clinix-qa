import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { z } from 'zod';

const run = promisify(execFile);

/**
 * Container do PostgreSQL do próprio projeto (`container_name` no Compose do backend), o
 * mesmo local e na CI. Não há API nem tela para ler o log; a leitura é só SELECT, com as
 * credenciais que o próprio container já tem (nenhuma senha passa pelo QA).
 */
const CONTAINER = 'clinix-saude-postgres';

/** Executa uma consulta somente leitura e devolve a primeira coluna da primeira linha. */
async function query(sql: string): Promise<string> {
  try {
    const { stdout } = await run(
      'docker',
      [
        'exec',
        CONTAINER,
        'sh',
        '-c',
        'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -At -c "$0"',
        sql,
      ],
      { timeout: 10_000 },
    );
    return stdout.trim();
  } catch (error) {
    throw new Error(
      `Consulta ao banco falhou: o log só pode ser lido com a API usando o PostgreSQL do ` +
        `container ${CONTAINER} (opção 2 do backend). ${(error as Error).message}`,
    );
  }
}

/** Registro de `system_logs`; `performedAt` vem sem fuso (relógio do container, UTC). */
export const systemLogSchema = z.object({
  action: z.enum(['CREATE', 'UPDATE', 'DELETE']),
  entityName: z.string(),
  entityId: z.number().int().nullable(),
  performedBy: z.string(),
  performedAt: z.iso.datetime({ local: true }),
  details: z.string().nullable(),
});

export type SystemLog = z.infer<typeof systemLogSchema>;

const userId = z.number().int().positive();

export const systemLogs = {
  /** Registros de log de um usuário, do mais antigo ao mais novo. */
  async forUser(id: number): Promise<SystemLog[]> {
    const safeId = userId.parse(id);
    const rows = await query(
      `select coalesce(json_agg(json_build_object(
         'action', action, 'entityName', entity_name, 'entityId', entity_id,
         'performedBy', performed_by, 'performedAt', performed_at, 'details', details
       ) order by id), '[]') from system_logs
       where entity_name = 'Users' and entity_id = ${safeId}`,
    );
    return z.array(systemLogSchema).parse(JSON.parse(rows));
  },

  /**
   * Pré-condição: o usuário criado pela API existe neste banco. Sem isso, a API usa outro
   * banco (H2, por exemplo) e a ausência de log não diria nada sobre o produto.
   */
  async hasUser(id: number): Promise<boolean> {
    return (await query(`select count(*) from users where id = ${userId.parse(id)}`)) === '1';
  },
};
