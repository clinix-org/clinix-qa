# Git workflow

- `main`: estável. `develop`: integração. Trabalho em branch curta a partir de `develop`; PR para `develop`; depois `develop` → `main`.
- Organização GitHub: `clinix-org` (repositórios públicos, acesso por times). Repositório de testes: `clinix-qa`, ainda não criado em 2026-11-23.
- Backend e frontend: toda PR precisa da revisão e aceite de **outro** membro do time.
- `clinix-qa`: PR sem revisor obrigatório; o responsável pelo QA faz o merge.
- O agente nunca aprova nem faz merge, e não contorna proteção de branch.
- Os repositórios têm `main` e `develop`; ambas estão protegidas no backend e no frontend.
- Branch em inglês, kebab-case: `test/scrum-21-user-permissions`, `ci/add-smoke-pipeline`, `docs/auth-checklist`.
- Commit: prefixo em inglês, descrição em português: `test(api): valida limite da senha no cadastro`.

| Tipo | Uso |
|---|---|
| `test(api)` `test(e2e)` `test(contract)` `test(perf)` `test(security)` `test(a11y)` | testes |
| `chore(qa)` | configuração e dependências |
| `ci` | pipeline |
| `docs(plan)` `docs(rules)` | documentação |
| `fix(test)` `refactor(test)` | correção ou melhoria de teste |

`test(unit)` só se o repositório tiver testes unitários. Um propósito por commit; presente do indicativo, até 72 caracteres.

## AI identification (obrigatória em todo trabalho feito com IA)
Vale para os três repositórios. Usar o modelo **real** da sessão, nunca um valor copiado. Não usar em trabalho feito só por pessoas.

| Onde | O que registrar |
|---|---|
| Branch | só `tipo/assunto`; o modelo não entra no nome |
| Código | nada; o histórico do Git já identifica |
| Commit | corpo curto (o quê e por quê) e trailers |
| PR | bloco "Identificação" |

Commit:
```text
<tipo>(<escopo>): <descrição em português>

<o que mudou e por quê, até 3 linhas>

Refs: SCRUM-xx            (somente se houver história)
Co-Authored-By: <modelo> <noreply@anthropic.com>
```
PR:
```text
## Resumo
<o que mudou e por quê>
## Validação
<comandos e resultado real; o que não foi testado>
## Identificação
- IA: <modelo> via Claude Code
- História: SCRUM-xx ou nenhuma
- [ ] Diff revisado por uma pessoa

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```
O agente nunca marca a caixa de revisão humana nem declara que houve revisão.

## Pre-commit checklist
- [ ] Definition of Done do `CLAUDE.md`
- [ ] `git status` e diff staged lidos por completo
- [ ] Nenhum `.env`, token, relatório, trace ou PDF da ISO
- [ ] Somente arquivos da tarefa (nunca `git add .`)

## Authorization request (mostrar e esperar)
```text
Ação: commit | push | pull | PR
Repositório/branch: <nome> → <destino>
Mensagem: <mensagem completa>
Arquivos: <lista e resumo do diff>
Validação: <comandos e resultado real>
Pendências: <...>
Autoriza? (sim/não)
```
OK de commit não autoriza push. Se o diff mudar depois do OK, pedir de novo.
