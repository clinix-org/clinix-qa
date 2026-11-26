# Catálogo de testes automatizados

> Gerado por `npm run docs:catalog` a partir do código. Não edite à mão: altere o teste e gere de novo.
> Resultado das execuções: `test-runs/`. Plano: `test-plan.md`. Checklist por funcionalidade: `features/`.

| Tipo | Casos | Smoke (PR) | Críticos |
|---|---|---|---|
| API | 9 | 2 | 6 |
| Interface web (UI) | 16 | 3 | 5 |
| Desempenho (k6) | 0 | 0 | 0 |
| **Total** | **25** | **5** | **11** |

## API

### Login — SCRUM-1

| Grupo | Caso | Suíte | Crítico | Código |
|---|---|---|---|---|
| credenciais válidas | deve retornar token aceito em /auth/me quando as credenciais são válidas | smoke + regressão | sim | [login.spec.ts:13](../tests/api/auth/login.spec.ts#L13) |
| credenciais inválidas | deve recusar com a mesma mensagem quando a senha está incorreta | regressão | sim | [login.spec.ts:39](../tests/api/auth/login.spec.ts#L39) |
| credenciais inválidas | deve recusar com a mesma mensagem quando o e-mail não está cadastrado | regressão | sim | [login.spec.ts:39](../tests/api/auth/login.spec.ts#L39) |
| credenciais inválidas | deve recusar o acesso quando a senha tem 5 dígitos | regressão | sim | [login.spec.ts:50](../tests/api/auth/login.spec.ts#L50) |
| credenciais inválidas | deve recusar o acesso quando a senha tem 7 dígitos | regressão | sim | [login.spec.ts:50](../tests/api/auth/login.spec.ts#L50) |
| campos obrigatórios | deve indicar o campo obrigatório quando falta o e-mail | regressão |  | [login.spec.ts:72](../tests/api/auth/login.spec.ts#L72) |
| campos obrigatórios | deve indicar o campo obrigatório quando falta a senha | regressão |  | [login.spec.ts:72](../tests/api/auth/login.spec.ts#L72) |
| usuário inativo | deve recusar com conta inativa e sem token quando o usuário está inativo | regressão | sim | [login.spec.ts:88](../tests/api/auth/login.spec.ts#L88) |

### Ambiente

| Grupo | Caso | Suíte | Crítico | Código |
|---|---|---|---|---|
| Disponibilidade da API | deve informar status UP quando o backend está disponível | smoke + regressão |  | [health.spec.ts:7](../tests/api/health.spec.ts#L7) |

## Interface web (UI)

### Login — SCRUM-1

| Grupo | Caso | Suíte | Crítico | Código |
|---|---|---|---|---|
| tela | deve exibir a logo e o título quando o visitante abre a tela | smoke + regressão |  | [login.spec.ts:13](../tests/e2e/auth/login.spec.ts#L13) |
| tela | deve aceitar o e-mail e mascarar a senha quando o usuário digita | regressão |  | [login.spec.ts:22](../tests/e2e/auth/login.spec.ts#L22) |
| botão Entrar | deve ficar desabilitado quando os dois campos estão vazios | regressão |  | [login.spec.ts:48](../tests/e2e/auth/login.spec.ts#L48) |
| botão Entrar | deve ficar desabilitado quando só o e-mail está preenchido | regressão |  | [login.spec.ts:48](../tests/e2e/auth/login.spec.ts#L48) |
| botão Entrar | deve ficar desabilitado quando só a senha está preenchida | regressão |  | [login.spec.ts:48](../tests/e2e/auth/login.spec.ts#L48) |
| botão Entrar | deve ficar desabilitado quando a senha tem 5 caracteres | regressão |  | [login.spec.ts:48](../tests/e2e/auth/login.spec.ts#L48) |
| botão Entrar | deve ficar desabilitado quando o e-mail não tem domínio | regressão |  | [login.spec.ts:48](../tests/e2e/auth/login.spec.ts#L48) |
| botão Entrar | deve ficar habilitado quando o e-mail é válido e a senha tem 6 caracteres | regressão |  | [login.spec.ts:60](../tests/e2e/auth/login.spec.ts#L60) |
| botão Entrar | deve ficar habilitado quando o e-mail tem só o primeiro nome | regressão |  | [login.spec.ts:60](../tests/e2e/auth/login.spec.ts#L60) |
| botão Entrar | deve exibir "Entrando" quando a validação está em andamento | regressão |  | [login.spec.ts:67](../tests/e2e/auth/login.spec.ts#L67) |
| credenciais válidas | deve abrir o dashboard quando as credenciais são válidas | smoke + regressão | sim | [login.spec.ts:92](../tests/e2e/auth/login.spec.ts#L92) |
| credenciais inválidas | deve exibir erro e permanecer no login quando a senha está incorreta | regressão | sim | [login.spec.ts:117](../tests/e2e/auth/login.spec.ts#L117) |
| credenciais inválidas | deve exibir erro e permanecer no login quando o e-mail não está cadastrado | regressão | sim | [login.spec.ts:117](../tests/e2e/auth/login.spec.ts#L117) |
| credenciais inválidas | deve exibir erro e permanecer no login quando o e-mail tem só o primeiro nome | regressão | sim | [login.spec.ts:117](../tests/e2e/auth/login.spec.ts#L117) |
| usuário inativo | deve exibir mensagem e permanecer no login quando o usuário está inativo | regressão | sim | [login.spec.ts:136](../tests/e2e/auth/login.spec.ts#L136) |

### Ambiente

| Grupo | Caso | Suíte | Crítico | Código |
|---|---|---|---|---|
| Disponibilidade da aplicação | deve exibir a tela de acesso quando o visitante abre /login | smoke + regressão |  | [app-shell.spec.ts:7](../tests/e2e/app-shell.spec.ts#L7) |

## Desempenho (k6)

Nenhum caso implementado.
