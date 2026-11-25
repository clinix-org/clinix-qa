# Environments and test data

Usar o Docker **do próprio projeto**. O QA não tem Compose nem container próprio e não altera os do projeto.

| Item | Valor |
|---|---|
| API | `http://localhost:8090` (8080 só dentro do container) |
| Tela | `http://localhost:5173` (desenvolvimento) e `http://localhost:8081` (produção local, via Nginx) |
| Containers | `clinix-saude-backend`, `clinix-saude-postgres`, `clinix-saude-frontend`, `clinix-saude-frontend-prod` |
| Quem sobe e para | o responsável ou o agente; nunca apagar volume sem OK |
| H2 em memória | feedback rápido; dados somem ao reiniciar |
| PostgreSQL em Docker | decisão de liberar; dados persistem no volume |

- Se o PostgreSQL não estiver disponível, registrar no veredito que a execução foi só em H2.
- Antes de executar: conferir que o `DB_URL` ativo é local; o responsável define `QA_LOCAL_DB_CONFIRMED=true`. O agente não altera essa variável.
- Sequência: subir o backend e depois o frontend de produção, que usa a rede criada por ele.
- Registrar o SHA testado. `down -v` apaga dados: exige OK.
- CI: ambiente descartável a partir dos `Dockerfile` do projeto; detalhes a decidir com a pipeline.

## Environment files
Um único fluxo; não criar outros arquivos `.env`.

| Projeto | Origem | Arquivo real | Escolha |
|---|---|---|---|
| Backend | `.env.example` | `.env.local` | opção 1 (H2) ou 2 (PostgreSQL) |
| Frontend | `.env.example` | `.env.local` | nenhuma |
| QA | `npm run env:init` | `.env` | ADMIN inicial do backend |

- Opção 1: `docker compose up -d --build`. Opção 2: `docker compose --profile local-db up -d --build`, ambas em `clinix-backend`.
- Opção 3 (banco remoto): somente a pedido explícito do responsável.
- O ADMIN inicial vem do backend; os demais usuários são criados pela API.
- Mudar `ADMIN_PASSWORD` não altera um ADMIN que já existe no PostgreSQL.
- Arquivo real nunca é versionado nem tem valores expostos.

## Test data
- `test-data/users.json`: perfis `admin`, `user` e `inactive`, **sem senhas**. Senhas e o e-mail do ADMIN vêm do `.env`.
- Ler com `getUser('admin' | 'user' | 'inactive')`, que valida o formato.
- `tests/setup/users.setup.ts` cria e ajusta `user` e `inactive`; é idempotente nos dois bancos.
- Estes três são somente leitura. Teste que altera usuário cria o próprio.
- Massa nova recebida: converter para JSON sintético em `test-data/`. Se vier com senha ou dado real, parar e avisar.
- Alvo padrão da suíte completa: containers com PostgreSQL e tela em 8091 (`BASE_URL=http://localhost:8091`); ao final, `@smoke` em H2.
