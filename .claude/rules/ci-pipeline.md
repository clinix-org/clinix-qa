---
paths:
  - ".github/**"
---
# CI/CD — GitHub Actions

| Gatilho | Executa | Meta |
|---|---|---|
| PR em `clinix-qa` | lint, typecheck, gitleaks, `@smoke` (Chromium) | até 10 min |
| Noturno, contra `develop` | `@regression` API + UI, a11y | até 30 min |
| Manual (`workflow_dispatch`, com refs) | suíte escolhida, Firefox/WebKit, k6, ZAP baseline | sob demanda |

- A partir dos `Dockerfile` do projeto, subir backend, frontend e PostgreSQL 18 descartáveis; aguardar health check, nunca sleep fixo.
- Registrar o SHA do backend e do frontend testados no resumo.
- Versão da imagem Playwright igual à de `@playwright/test`. Node 26 LTS; Java 25 para o backend.
- `npm ci`, lockfile versionado, cache, `timeout-minutes`, `concurrency` com cancelamento.
- `permissions: contents: read`; ações fixadas por SHA; nunca `pull_request_target` com código do PR.
- Credenciais da aplicação descartável são geradas na execução. GitHub Secrets só se inevitável.
- Artefatos: HTML, JUnit, Allure, trace somente em falha; retenção de 7 dias. **O repositório é público**: no CI, trace/vídeo só com credencial descartável e massa sintética; nunca publicar relatório de segurança.
- `schedule` só dispara a partir da branch padrão.
- Gate em PR de backend/frontend exige mudança nesses repositórios: decisão do time, não do agente.
