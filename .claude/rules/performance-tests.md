---
paths:
  - "performance/**"
---
# Performance — k6

- Playwright não gera carga. k6 fica em `performance/`, no mesmo repositório.
- Só ambiente descartável ou local. Carga em ambiente compartilhado exige OK explícito com data, alvo e limite.
- Perfis: `smoke` (1–2 VUs, 30 s), `load` (carga esperada), `stress` (só manual). Não criar soak/spike sem risco que justifique.
- Todo script tem `thresholds` (latência p95, taxa de erro) e `checks`.
- Metas em `knowledge/performance-targets.md`; são provisórias até o baseline.
- Rodar com dataset conhecido. Começar por `POST /auth/login` e `GET /medicamentos/nomecomercial`.
- Runner da CI é compartilhado: resultado serve de tendência, não de capacidade de produção.
- Registrar commit testado, dataset, máquina, perfil e resultado.
