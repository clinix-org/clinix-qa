<div align="center">

# Clinix QA

**Qualidade automatizada da plataforma Clinix: API, interface web e desempenho.**

[![Quality](https://github.com/clinix-org/clinix-qa/actions/workflows/quality.yml/badge.svg?branch=develop)](https://github.com/clinix-org/clinix-qa/actions/workflows/quality.yml?query=branch%3Adevelop)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
[![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-blue)](LICENSE)

![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![k6](https://img.shields.io/badge/k6-7D64FF?style=for-the-badge&logo=k6&logoColor=white)

[Resultados](#resultados) · [Como executar](#como-executar) · [Pipeline](#pipeline) · [Documentação](#documentação)

</div>

---

## Resultados

| Tipo | Total | ✅ Aprovados | ❌ Reprovados | ⚠️ Erros | ⛔ Bloqueados | Sucesso |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **API** | 9 | 8 | 1 | 0 | 0 | 89% |
| **Interface web (UI)** | 16 | 15 | 1 | 0 | 0 | 94% |
| **Desempenho (k6)** | 0 | – | – | – | – | Planejado |
| **Total** | **25** | **23** | **2** | **0** | **0** | **92%** |

<sub>Última execução completa: 25/11/2026 · PostgreSQL 18 · Chromium · backend `a86f0b5` · frontend `53158c9`</sub>

<details>
<summary>O que significa cada resultado</summary>

| Resultado | Significado |
| :--- | :--- |
| ✅ Aprovado | O sistema se comportou como esperado |
| ❌ Reprovado | O sistema se comportou diferente do esperado |
| ⚠️ Erro | O teste não terminou por problema de ambiente, massa ou código do teste |
| ⛔ Bloqueado | O teste não pôde ser executado por depender de outra correção |

</details>

## Como executar

**Pré-requisitos:** Node.js 26, Docker, [clinix-backend](https://github.com/clinix-org/clinix-backend) e
[clinix-frontend](https://github.com/clinix-org/clinix-frontend) na mesma pasta deste projeto e em execução.

```bash
npm ci
npx playwright install chromium
npm run env:init      # cria o .env; preencha o ADMIN e confirme o banco local
BASE_URL=http://localhost:8091 npm test
```

| Comando | Executa |
| :--- | :--- |
| `npm test` | Todos os testes |
| `npm run test:api` | Somente API |
| `npm run test:e2e` | Somente interface web |
| `npm run test:smoke` | Verificação rápida |
| `npm run report` | Abre o relatório HTML |
| `npm run check` | Lint, formatação e tipos |

<sub>O `BASE_URL` aponta para o frontend no Docker (8091). Com `npm run dev`, use a porta 5173.</sub>

## Pipeline

| Workflow | Quando | O que valida |
| :--- | :--- | :--- |
| **Quality** | Pull request e push em `develop` e `main` | Código, segredos expostos e smoke em H2 |
| **Regression** | Toda noite e sob demanda (após chegar à `main`) | Todos os testes em PostgreSQL |

O selo **Quality** verde indica que o código e o smoke passaram; o resultado completo está em [Resultados](#resultados).
Cada execução publica o resumo e o relatório em [Actions](https://github.com/clinix-org/clinix-qa/actions).

## Documentação

| Documento | Conteúdo |
| :--- | :--- |
| [Plano de testes](docs/test-plan.md) | Escopo, estratégia e critérios de saída |
| [Funcionalidades](docs/features) | Comportamentos cobertos |
| [Execuções](docs/test-runs) | Histórico de resultados |

## Licença

Distribuído sob a licença [MIT](LICENSE).
