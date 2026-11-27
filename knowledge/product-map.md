# Product map

Leitura estática de 2026-11-23, atualizada em 2026-11-26 após a SCRUM-21 (`develop`: backend `7522778`, frontend `ef2ad24`). Conferir antes de usar. **Código não é requisito.**

## Stack
Backend: Java 25, Spring Boot 3.5.16, PostgreSQL 18, JWT, OpenAPI. Há 40 anotações de teste no backend (inclui integração de medicamentos).
Frontend: React 19, Vite 7, TypeScript 5.9, Redux, Node 26 (`.nvmrc` e `AGENTS.md` alinhados). Único teste automatizado: dosagem de medicamentos (`npm run test:medications`). O módulo de medicamentos expõe `data-testid` documentados em `docs/medications-test-ids.md`.

Requisitos: Jira (histórias `SCRUM-xx`); critérios enviados pelo responsável a cada pedido. Versão oficial do backend: **Java 25**; ignorar referências antigas a 17 e 21.

## Features
| Feature | Interface | Risco |
|---|---|---|
| Login e sessão | `POST /auth/login`, `GET /auth/me`, `/login` | Alto |
| Autorização ADMIN/USER | todas as rotas, menus e `/403` | Alto |
| Usuários (CRUD, busca, autoproteção, auditoria) | `/users` (ADMIN), `/usuarios` | Alto |
| Medicamentos (leitura; escrita ADMIN) | API `/medications` (lista, `/options`, `/{id}`; POST/PUT/DELETE só ADMIN); tela `/medicamentos` | Alto na escrita, Médio na leitura |
| Dashboard, relatórios, configurações | telas | Baixo até confirmar integração real |

## Observable rules found in code
- E-mail `@clinix.com`; senha com exatamente 6 dígitos; role ADMIN ou USER.
- ADMIN não pode excluir, desativar ou rebaixar a si mesmo. E-mail é normalizado para minúsculas.
- Erros: 400, 401, 403, 404, 409, 423 e 500 com `code` e `requestId` (o 401 do filtro de segurança vem sem `requestId`). Rota inexistente devolve 500 em vez de 404 (defeito 2 no Qase).
- Medicamentos: duplicidade por nome normalizado + composição (princípio ativo, dosagem e unidade); cadastro começa com estoque 0 e `UNAVAILABLE`; `createdAt`/`createdBy` vêm do servidor. Regras em dúvida com o PO: ver `docs/features/medications.md`.
- Antes do deploy com banco existente, aplicar `docs/database/V001__medications.sql` do backend (renomeia a tabela legada; exige tabela vazia).
- `Usuarios.tsx` contém código mock inativo: `USERS_API_URL` é fixa em `/users`, então a tela chama a API real.

## Hypotheses
Ficam em `knowledge/hypotheses.local.md`, fora do Git, porque o repositório é público.
