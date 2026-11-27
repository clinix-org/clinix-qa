# SCRUM-33 — Paginação de medicamentos — 2026-11-27

Veredito proposto: LIBERADO — os 27 testes da história passaram (19 API + 8 UI); critérios escritos pelo QA, revisão com PO e DEV pendente
Responsável: responsável pelo QA
Motivo da execução: história
Ambiente: PostgreSQL 18 em Docker local (containers do projeto construídos na `develop` em 2026-11-27) e H2 em memória (cópia local da API, só para a suíte de API), Chromium do Playwright 1.65.1
Backend: develop @ 7522778 | Frontend: develop @ ef2ad24 | QA: test/scrum-33-medications-pagination (a partir de develop @ 8287ea2, ainda sem commit)

| Tipo | Executados | Passou | Falhou | Não executado |
|---|---|---|---|---|
| API — paginação (PostgreSQL) | 19 | 19 | 0 | 0 |
| API — suíte completa (H2) | 49 | 48 | 1 | 0 |
| UI — paginação (PostgreSQL, tela 8091) | 8 | 8 | 0 | 0 |
| Suíte completa (PostgreSQL, tela 8091) | 80 | 79 | 1 | 0 |
| Manual/exploratório | 0 | 0 | 0 | 0 |

A suíte completa passou 3 vezes seguidas com o mesmo resultado (79/80) no PostgreSQL. A contagem não inclui o setup. Prova de falha em cópias temporárias: backend com 7 adulterações em duas compilações e frontend com 9 adulterações, uma por vez; todas reprovaram os testes esperados (detalhes no checklist).
Falha na suíte completa e no H2: "deve recusar com conta inativa e sem token quando o usuário está inativo" (API: 500 em vez de 423; defeito já aberto, SCRUM-1).
Checklist: `../features/medications-pagination.md` | Catálogo: `../test-catalog.md`
Defeitos (Qase): nenhum novo
Qase: suítes `API › Paginação de medicamentos` (19 casos) e `UI › Paginação de medicamentos` (8 casos); execuções "2026-11-27 — SCRUM-33 Paginação de medicamentos — API local" (19/19) e "— UI local" (8/8), registradas em 2026-11-27
Não testado e por quê: UI em H2 (a tela 8091 usa o backend do container, em PostgreSQL); estado "carregando"; exploratório; Firefox/WebKit; carga (k6, só a pedido)
Riscos restantes: critérios derivados do código; 5 dúvidas para o PO (busca por código/categoria/descrição, ordem da lista, quantidades por página, página inexistente, página no endereço)
Evidência: execução local, `npx playwright test --project=api`, `API_URL=<API em H2> npx playwright test --project=api` e `BASE_URL=http://localhost:8091 npx playwright test`
