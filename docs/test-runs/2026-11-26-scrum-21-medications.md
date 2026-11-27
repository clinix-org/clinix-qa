# SCRUM-21 — Cadastro de medicamentos — 2026-11-26

Veredito proposto: LIBERADO — os 28 testes da história passaram (21 API + 7 UI); 6 dúvidas abertas com o PO
Responsável: responsável pelo QA
Motivo da execução: história
Ambiente: PostgreSQL 18 em Docker local (containers do projeto reconstruídos na branch da história) e H2 em memória (API local, só para a suíte de API), Chromium do Playwright 1.65.1
Backend: feat/SCRUM-21 @ 569de32 | Frontend: feat/SCRUM-21 @ 164fde0 | QA: test/scrum-21-medications (a partir de develop @ 4843577, ainda sem commit)

| Tipo | Executados | Passou | Falhou | Não executado |
|---|---|---|---|---|
| API — medicamentos (PostgreSQL) | 21 | 21 | 0 | 0 |
| API — medicamentos (H2) | 21 | 21 | 0 | 0 |
| UI — medicamentos (PostgreSQL, tela 8091) | 7 | 7 | 0 | 0 |
| Suíte completa (PostgreSQL, tela 8091) | 53 | 52 | 1 | 0 |
| Manual/exploratório | 0 | 0 | 0 | 0 |

Os testes novos (API e UI) passaram 3 vezes seguidas no PostgreSQL. A suíte completa não conta o setup. Prova de falha em cópias temporárias: backend com 5 adulterações reprovou os 5 testes de API esperados; frontend com 6 adulterações reprovou os 6 testes de UI esperados.
Falha na suíte completa: "deve recusar com conta inativa e sem token quando o usuário está inativo" (API: 500 em vez de 423; defeito já aberto, SCRUM-1).
Mudança observada: "deve exibir mensagem e permanecer no login quando o usuário está inativo" (UI) passou nesta branch, porque o frontend agora mostra "Não foi possível entrar agora. Tente novamente." para erros diferentes de 401. A API continua com 500 e a tela não explica que a conta está inativa; o defeito continua aberto.
Checklist: `../features/medications.md` | Catálogo: `../test-catalog.md`
Defeitos (Qase): nenhum novo
Qase: suíte `API › Medicamentos` com os 21 casos e a execução "2026-11-26 — SCRUM-21 Medicamentos — API local" (21 passaram), registradas em 2026-11-26
Não testado e por quê: UI em H2 (a tela 8091 usa o backend do container, em PostgreSQL); exploratório; Firefox/WebKit; carga (k6, depois)
Riscos restantes: regra de duplicidade e lista de unidades a confirmar com o PO; migração SQL obrigatória antes do deploy em produção
Evidência: execução local, `npx playwright test --project=api` e `BASE_URL=http://localhost:8091 npx playwright test`
Qase (UI): suíte `UI › Medicamentos` com os 7 casos e a execução "2026-11-26 — SCRUM-21 Medicamentos — UI local" (7 passaram), registradas em 2026-11-26
