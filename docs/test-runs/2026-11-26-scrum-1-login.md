# SCRUM-1 — Login — 2026-11-26

Veredito: BLOQUEADO — usuário inativo recebe erro interno e nenhuma mensagem na tela
Responsável: responsável pelo QA
Motivo da execução: regressão
Ambiente: PostgreSQL 18 em container descartável (GitHub Actions), Chromium do Playwright 1.65.1
Backend: develop @ a86f0b5 | Frontend: develop @ 53158c9 | QA: develop @ a7fbe34

| Tipo | Executados | Passou | Falhou | Não executado |
|---|---|---|---|---|
| API | 9 | 8 | 1 | 0 |
| UI | 16 | 15 | 1 | 0 |
| Manual/exploratório | 0 | 0 | 0 | 0 |

Os totais incluem as verificações de ambiente (API disponível e tela de acesso). As duas falhas repetiram na nova tentativa da CI.
Falhas: "deve recusar com conta inativa e sem token quando o usuário está inativo" (API: 500 em vez de 423) e "deve exibir mensagem e permanecer no login quando o usuário está inativo" (UI: nenhum alerta).
Checklist: `../features/login.md` | Catálogo: `../test-catalog.md`
Defeitos (Qase): usuário inativo recebe erro 500 e nenhuma mensagem — ver projeto CLINIX
Não testado e por quê: carga (adiada), Firefox/WebKit e acessibilidade (fora desta etapa)
Riscos restantes: mensagem do usuário inativo sem definição na história
Evidência: GitHub Actions, Regression, execução 45858209913 (agendada)
