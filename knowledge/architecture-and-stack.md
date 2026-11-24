# Architecture and stack

## Decisions
| Tema | Escolha | Motivo |
|---|---|---|
| Repositório principal | `clinix-qa` | API, UI, contrato e performance com uma pipeline |
| API e UI | Playwright + TypeScript | uma linguagem e um relatório |
| Contrato | Zod + OpenAPI do backend | detecta quebra de schema sem broker |
| Carga | k6 | Playwright não é ferramenta de carga |
| Acessibilidade | `@axe-core/playwright` | verificação parcial nas telas principais |
| Segurança | gitleaks no PR; ZAP baseline manual | baixo custo |
| Agentes de IA | Playwright Test Agents, quando útil | ver `playwright-agents.md` |
| CI | GitHub Actions | já está no GitHub, sem servidor |
| Jenkins | Não agora | duplicaria a pipeline |
| Cucumber/Gherkin | Não | camada extra sem leitor definido |
| Relatório | HTML + JUnit; Allure 3 para histórico | equipe e CI |

Versões consultadas em 2026-11-23: Playwright 1.65.1, k6 2.4.0, Node 26 LTS, Allure Playwright 3.15.0, Zod 4.6.7, axe 4.14.0.
TypeScript: usar **6.0.x**; a 7.0 está fora da faixa suportada por `typescript-eslint` (`<6.1.0`). "Mais novo" significa última versão estável e compatível.

## Target structure (criar só quando usar)
```text
clinix-qa/
├── .claude/rules/      regras por tipo de arquivo
├── .github/workflows/  pipelines
├── knowledge/          conhecimento sob demanda
├── docs/features/      um checklist por funcionalidade
├── docs/exploratory/   charters e sessões
├── src/                api/ fixtures/ pages/ data/ schemas/ config/
├── tests/              setup/ api/ e2e/
├── test-data/          massa sintética em JSON
└── performance/        k6
```
Dependências em uma direção: `tests` → `fixtures` → `api`/`pages` → `config`. Sem camada criada "para o futuro".

## Scope
Este projeto usa somente **Playwright + k6** (mais axe, gitleaks e ZAP quando aprovados). REST Assured, Selenium, Postman e Cypress ficam em outro projeto: não criar, sugerir nem contar como cobertura.
O repositório contém somente testes, regras e documentação de testes.
