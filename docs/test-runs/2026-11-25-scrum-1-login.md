# SCRUM-1 — Login — 2026-11-25

Veredito: BLOQUEADO — usuário inativo recebe erro interno e nenhuma mensagem na tela
Responsável: responsável pelo QA
Motivo da execução: história
Ambiente: PostgreSQL 18 em Docker (completa) e H2 (somente smoke), Chromium do Playwright 1.65.1, tela em 8091
Backend: develop @ a86f0b5 | Frontend: develop @ 53158c9 | QA: test/scrum-1-login (este commit)

| Tipo | Executados | Passou | Falhou | Não executado |
|---|---|---|---|---|
| API | 8 | 7 | 1 | 0 |
| UI | 15 | 14 | 1 | 0 |
| Manual/exploratório | 0 | 0 | 0 | 0 |

Três execuções em PostgreSQL com o mesmo resultado. Mais 3 verificações de ambiente, todas aprovadas. Smoke em H2: 6 de 6.
Checklist: `../features/login.md`
Defeitos (Jira): a registrar
Não testado e por quê: carga (adiada), Firefox/WebKit e acessibilidade (fora desta etapa), CI (ainda não executada)
Riscos restantes: mensagem do usuário inativo sem definição na história
Evidência: `BASE_URL=http://localhost:8091 npx playwright test`
