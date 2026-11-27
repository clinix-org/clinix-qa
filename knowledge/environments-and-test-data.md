# Environments and test data

Usar o Docker **do próprio projeto**. O QA não tem Compose nem container próprio e não altera os do projeto.

| Item | Valor |
|---|---|
| API | `http://localhost:8090` (8080 só dentro do container) |
| Tela | `http://localhost:8091` (Docker, via Nginx, versão de produção) e `http://localhost:5173` (Vite com hot reload: `npm run dev` fora do Docker ou o serviço opcional `frontend-dev`; nunca os dois juntos) |
| Containers | `clinix-saude-backend`, `clinix-saude-postgres`, `clinix-saude-frontend`; opcional, só para programar: `frontend-dev` (perfil `development`, sobe só com `docker compose up -d --build frontend-dev`; nunca no servidor). Hoje sem `container_name`: o Compose gera `clinix-saude-frontend-frontend-dev-1` (padrão proposto: `clinix-saude-frontend-dev`). |
| Quem sobe e para | o responsável ou o agente; nunca apagar volume sem OK |
| H2 em memória | feedback rápido; dados somem ao reiniciar |
| PostgreSQL em Docker | decisão de liberar; dados persistem no volume |

- Se o PostgreSQL não estiver disponível, registrar no veredito que a execução foi só em H2.
- Antes de executar: conferir que o `DB_URL` ativo é local; o responsável define `QA_LOCAL_DB_CONFIRMED=true`. O agente não altera essa variável.
- Sequência: subir o backend e depois o frontend, que usa a rede criada por ele.
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
- Alvo padrão da suíte completa: containers com PostgreSQL e tela em 8091 (`BASE_URL=http://localhost:8091`); ao final, `@smoke` em H2. Se o `.env` apontar `BASE_URL` para a 5173 e o Vite não estiver no ar, a UI falha com conexão recusada (problema de ambiente, não do produto).
- Massa de medicamentos: nome único por teste (`QA Medicamento <8 hex>`), removida pela fixture `medications` ao final, mesmo em falha. Na UI, a sessão vem da API (`signInAs`).
