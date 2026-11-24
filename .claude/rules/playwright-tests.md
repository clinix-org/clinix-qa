---
paths:
  - "tests/**/*.ts"
  - "src/**/*.ts"
  - "playwright.config.ts"
---
# Playwright — API, contrato e UI

## Obrigatório
- Um comportamento por teste, estrutura Preparar/Agir/Verificar, título em português: **"deve <resultado observável> quando <condição>"**. Sem número ou ID no título; agrupar com `test.describe`. Status HTTP sozinho não é resultado completo.
- Testes DAMP: os valores que explicam o resultado ficam visíveis no teste.
- Locators: `getByRole` > `getByLabel` > `getByText` > `getByTestId`. CSS só com justificativa; XPath proibido.
- Asserções web-first (`await expect(locator)...`). Mensagem clara quando a falha não for óbvia.
- API: validar status, `code` do erro, campos relevantes e schema (Zod). Não comparar o corpo inteiro com timestamps e IDs.
- Escrita: confirmar o estado resultante com nova leitura, não só o status.
- Autorização: cobrir sem token, USER e ADMIN. Esconder menu na UI não prova autorização.
- Preparar massa por API, nunca pela UI, exceto quando a UI é o comportamento testado.
- Login pela UI só nos testes de login. Nos demais, fixture por API com `storageState`; token fica em `localStorage`, chave `token`.
- `baseURL` e configuração por ambiente; nenhum URL ou credencial fixa.

## Proibido
- `waitForTimeout`/sleep, `networkidle` como sincronização, `test.only`, dependência de ordem.
- `if`, loop ou `try/catch` no corpo do teste. Casos parametrizados por tabela são permitidos.
- Testar método privado, classe CSS, detalhe interno ou snapshot genérico.
- Herança profunda. Use composição e fixtures; Page Object só para fluxo reutilizado, sem asserção de negócio.

- Aceitar 500 como resultado esperado de entrada inválida, ou engolir a falha (teste que passa quando nada falha).

## Tags
Nível: `@api` ou `@ui`. Suíte: `@smoke` ou `@regression`. Opcionais: `@critical`, `@contract`, `@security`, `@a11y`.
Todo teste tem `annotation` `{ type: 'story', description: 'SCRUM-xx' }` (no `describe` quando vale para o grupo) ou `type: 'feature'`. `@exploratory` só em automação de apoio.

## Flaky
Retry na CI: no máximo 1, para coletar trace; passou no retry = flaky = defeito a investigar. Quarentena exige OK, motivo, dono e prazo.
