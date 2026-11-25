# Clinix QA

![Quality](https://github.com/clinix-org/clinix-qa/actions/workflows/quality.yml/badge.svg?branch=develop)
![Regression](https://github.com/clinix-org/clinix-qa/actions/workflows/regression.yml/badge.svg)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)

Testes automatizados do Clinix: Playwright (API e UI) e k6 (carga, ainda não implementado).

Requisitos: Node 26, Docker, `clinix-backend` e `clinix-frontend` na mesma pasta deste projeto.

```bash
npm ci
npx playwright install chromium
npm run env:init      # cria o .env; preencha o ADMIN e confirme o banco local
npm test              # com backend e frontend já em execução
```

Qualidade do código: `npm run check`. Regras do agente: `CLAUDE.md`. Checklists: `docs/features/`.

## Cobertura

| História | Funcionalidade | API | UI | Veredito | Detalhes |
|---|---|---|---|---|---|
| SCRUM-1 | Login | 7 de 8 | 14 de 15 | BLOQUEADO (2026-11-25) | [checklist](docs/features/login.md) |

`Quality`: qualidade do código e smoke em H2. `Regression`: todos os testes em PostgreSQL, toda noite.
Totais, falhas e SHAs testados ficam no resumo de cada execução, em [Actions](https://github.com/clinix-org/clinix-qa/actions).
