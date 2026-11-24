# Clinix QA

Testes automatizados do Clinix: Playwright (API e UI) e k6 (carga, ainda não implementado).

Requisitos: Node 26, Docker, `clinix-backend` e `clinix-frontend` na mesma pasta deste projeto.

```bash
npm ci
npx playwright install chromium
npm run env:init      # cria o .env; preencha o ADMIN e confirme o banco local
npm test              # com backend e frontend já em execução
```

Qualidade do código: `npm run check`. Regras do agente: `CLAUDE.md`. Checklists: `docs/features/`.
