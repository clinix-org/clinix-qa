import type { APIRequestContext } from '@playwright/test';

export type UserPayload = {
  nome: string;
  usuario: string;
  senha: string;
  role: 'ADMIN' | 'USER';
  ativo: boolean;
};
type UserRecord = Omit<UserPayload, 'senha'> & { id: number };

/** Cliente fino: devolve a resposta crua; asserções ficam nos testes. */
export class ClinixApi {
  constructor(private readonly request: APIRequestContext) {}

  login(username: string, password: string) {
    return this.request.post('/auth/login', { data: { username, password } });
  }

  async getToken(username: string, password: string): Promise<string> {
    const response = await this.login(username, password);
    if (!response.ok()) throw new Error(`Login de preparação falhou: HTTP ${response.status()}`);
    return ((await response.json()) as { token: string }).token;
  }

  /** Idempotente: funciona no H2 vazio e no PostgreSQL já populado. */
  async ensureUser(token: string, user: UserPayload): Promise<void> {
    const headers = { Authorization: `Bearer ${token}` };
    const list = await this.request.get('/users', { headers, params: { search: user.usuario } });
    if (!list.ok()) throw new Error(`Busca de usuário falhou: HTTP ${list.status()}`);
    let found = ((await list.json()) as UserRecord[]).find((u) => u.usuario === user.usuario);

    if (!found) {
      const created = await this.request.post('/users', { headers, data: user });
      if (!created.ok()) throw new Error(`Criação de usuário falhou: HTTP ${created.status()}`);
      found = (await created.json()) as UserRecord;
    }
    // O PUT garante senha e situação esperadas, inclusive para usuário inativo.
    const updated = await this.request.put(`/users/${found.id}`, { headers, data: user });
    if (!updated.ok()) throw new Error(`Ajuste de usuário falhou: HTTP ${updated.status()}`);
    const state = ((await updated.json()) as UserRecord).ativo;
    if (state !== user.ativo) throw new Error(`Situação divergente para ${user.usuario}`);
  }
}
