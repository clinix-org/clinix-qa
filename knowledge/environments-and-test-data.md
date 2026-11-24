# Environments and test data

Usar o Docker **do próprio projeto**. O QA não tem Compose nem container próprio e não altera os do projeto.

| Item | Valor |
|---|---|
| API / tela | `http://localhost:8080` / `http://localhost:5173` |
| Quem sobe e para | o responsável; o agente só com OK |
| H2 em memória | feedback rápido; dados somem ao reiniciar |
| PostgreSQL em Docker | decisão de liberar; depende de ajuste do time no backend |

- Se o PostgreSQL não estiver disponível, registrar no veredito que a execução foi só em H2.
- Antes de executar: o responsável confirma que o `DB_URL` é local e define `QA_LOCAL_DB_CONFIRMED=true`. O agente não altera essa variável nem abre o `.env.local` do backend.
- `.env` do QA: `npm run env:init`; o responsável preenche o ADMIN.
- Registrar o SHA testado. `down -v` apaga dados: exige OK.
- CI: ambiente descartável a partir dos `Dockerfile` do projeto; detalhes a decidir com a pipeline.

## Test data
- `test-data/users.json`: perfis `admin`, `user` e `inactive`, **sem senhas**. Senhas e o e-mail do ADMIN vêm do `.env`.
- Ler com `getUser('admin' | 'user' | 'inactive')`, que valida o formato.
- `tests/setup/users.setup.ts` cria e ajusta `user` e `inactive`; é idempotente nos dois bancos.
- Estes três são somente leitura. Teste que altera usuário cria o próprio.
- Massa nova recebida: converter para JSON sintético em `test-data/`. Se vier com senha ou dado real, parar e avisar.
