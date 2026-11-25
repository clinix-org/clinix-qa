<div align="center">

# Clinix QA

[![Quality](https://github.com/clinix-org/clinix-qa/actions/workflows/quality.yml/badge.svg?branch=develop)](https://github.com/clinix-org/clinix-qa/actions/workflows/quality.yml?query=branch%3Adevelop)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)

</div>

<a href="https://github.com/clinix-org/clinix-qa/actions/workflows/regression.yml">
  <img src="https://raw.githubusercontent.com/clinix-org/clinix-qa/results/results.svg" alt="Resultados mais recentes dos testes de API, interface web e desempenho" width="100%">
</a>

## Executar os testes

```bash
# API (Playwright)
npm run test:api

# Interface web (Playwright)
BASE_URL=http://localhost:8091 npm run test:e2e

# Desempenho (k6): em breve
```
