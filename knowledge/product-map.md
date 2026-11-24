# Product map

Leitura estática de 2026-11-23 (`develop`: backend `82b736e`, frontend `d7bf42d`). Conferir antes de usar. **Código não é requisito.**

## Stack
Backend: Java 25, Spring Boot 3.5.16, PostgreSQL 18, JWT, OpenAPI. Há 28 anotações de teste no backend.
Frontend: React 19, Vite 7, TypeScript 5.9, Redux. Sem testes automatizados. O `AGENTS.md` está divergente do código em alguns pontos (cita Node 20; `.nvmrc` é 26).

Requisitos: Jira (histórias `SCRUM-xx`); critérios enviados pelo responsável a cada pedido. Versão oficial do backend: **Java 25**; ignorar referências antigas a 17 e 21.

## Features
| Feature | Interface | Risco |
|---|---|---|
| Login e sessão | `POST /auth/login`, `GET /auth/me`, `/login` | Alto |
| Autorização ADMIN/USER | todas as rotas, menus e `/403` | Alto |
| Usuários (CRUD, busca, autoproteção, auditoria) | `/users` (ADMIN), `/usuarios` | Alto |
| Medicamentos (leitura; escrita ADMIN) | `/medicamentos`, `/medicamentos/nomecomercial` | Alto na escrita, Médio na leitura |
| Dashboard, relatórios, configurações | telas | Baixo até confirmar integração real |

## Observable rules found in code
- E-mail `@clinix.com`; senha com exatamente 6 dígitos; role ADMIN ou USER.
- ADMIN não pode excluir, desativar ou rebaixar a si mesmo. E-mail é normalizado para minúsculas.
- Erros: 400, 401, 404, 409, 423 e 500 com `code` e `requestId`.
- `Usuarios.tsx` contém código mock inativo: `USERS_API_URL` é fixa em `/users`, então a tela chama a API real.

## Hypotheses
Ficam em `knowledge/hypotheses.local.md`, fora do Git, porque o repositório é público.
