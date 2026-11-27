# Test documentation

Um arquivo por funcionalidade em `docs/features/`, até uma página. Detalhes ficam no código; não duplicar passos.

Markdown para documentos, JSON para massa; PDF e TXT não são versionados.
Plano: `docs/test-plan.md`. Histórico: `docs/test-runs/AAAA-MM-DD-scrum-xx-feature.md`, a partir de `_template.md`.
Catálogo: `docs/test-catalog.md`, separado em API, UI e desempenho (k6). É **gerado** por `npm run docs:catalog`; nunca editar à mão. Teste novo, renomeado ou removido exige gerar de novo; a CI (`docs:check`) reprova a PR com o catálogo desatualizado.
Registrar execução em: história testada, reteste, regressão antes de `develop` → `main` e sessão exploratória. Nunca preencher resultado não executado.
Defeitos: no Qase, ligados ao caso e à execução que falhou, citando a história do Jira. O agente entrega o texto pronto; não publica sem OK. Falha de segurança não vai para o repositório público nem para o Qase.

## k6 scripts
O catálogo lê o cabeçalho de cada script em `performance/` (pastas `lib/` são ignoradas). Um `// case:` por caso, no mesmo padrão "deve X quando Y":
```js
// story: SCRUM-1
// feature: Login
// case: deve manter p95 abaixo da meta quando 20 usuários fazem login ao mesmo tempo
```

## Qase (gestão de testes)
- O repositório é a fonte; o Qase é um espelho para consulta e gestão. O histórico oficial continua em `docs/test-runs/`.
- Limites do Free (docs oficiais, lidos em 2026-11-27): resultados de execução, **defeitos** e histórico de alterações ficam acessíveis por 30 dias; casos e suítes não expiram. 500 MB de armazenamento, 2 projetos, 2 execuções ativas, 5.000 resultados por mês via API, 150 requisições por minuto.
- Sincronização (autorizada pelo responsável em 2026-11-27, sem pedir OK a cada lote): ao concluir testes de uma história e ao alterar um teste que falhava ou estava bloqueado, atualizar casos, execução e o defeito afetado. Antes, comparar os títulos do catálogo com os casos do Qase e recriar o que faltar. Depois, exportar a cópia local. Exclusão e defeito novo continuam exigindo OK.
- Acesso pelo MCP oficial (`@qase/mcp-server`), com o token configurado no escopo do usuário do Claude Code, fora do repositório. O token nunca entra em arquivo do projeto, log ou diff.
- Estrutura: suíte = tipo › funcionalidade (`API › Login`, `UI › Login`, `Desempenho › Login`). Caso = o mesmo título do código; descrição com o grupo e o caminho do arquivo; tags com a história (`SCRUM-1`), `smoke` e `critical`; marcado como automatizado.
- A identidade do caso é o título, como no código. IDs do Qase não entram no código nem nos títulos.
- Execução: uma por registro em `test-runs/`, com o mesmo nome do arquivo e os SHAs testados; resultados copiados da execução real, nunca de leitura de código.
- Em 2026-11-27, `qase_ci_report` com `defect: true` respondeu sucesso, mas não gravou os resultados (a execução ficou aberta e "untested"). Não usar `defect: true`; citar o defeito no `comment` e reler a execução após gravar.
- Ainda em 2026-11-27, com `qase_result_record`, a releitura imediata da execução mostrou "untested" e, segundos depois, os resultados certos: a leitura do Qase atrasa. Reler depois de alguns segundos antes de concluir que não gravou; não regravar (duplica o resultado). Concluir a execução (`qase_run_complete`) só depois de ver os resultados.
- Limites do Free vistos em 2026-11-26: sem busca QQL (ler com `qase_get`); a API não liga defeito a resultado existente (citar os títulos dos testes no defeito); resultado individual não é relido sem o hash (o detalhe fica em `test-runs/`).
- Exclusões no Qase e o acesso direto `qase_api` ficam bloqueados nas permissões do usuário do Claude Code.
- Cópia local: após cada sincronização, exportar o projeto do Qase em JSON para `/mnt/NAS/qa/clinix/qase-backup/AAAA-MM-DD/`, fora do repositório (defeitos não vão para o repositório público).

## Writing pattern
Sem números ou IDs sequenciais. A identidade do caso é: **funcionalidade › comportamento › título**.
- Título: "deve <resultado observável> quando <condição>", único no grupo.
- Grupo: `test.describe` com o nome da funcionalidade ou regra. Um arquivo por comportamento: `tests/api/auth/login.spec.ts`.
- O mesmo título vale no checklist e no código. A ordem não importa: insira o caso novo onde fizer sentido.
- Tag diz quando/onde roda; `annotation` do tipo `story` liga à história do Jira. O código `SCRUM-xx` não entra no título.
- `test.step` só em fluxo longo de UI, com nome da ação do usuário.
- Bom: deve retornar 200 e um token utilizável quando o ADMIN informa credenciais válidas.
- Fraco: deve retornar status 200 (sem condição, não prova o comportamento).
- Dois comportamentos independentes viram dois casos. Gherkin não é usado.
- Renomear o título exige atualizar o checklist; o histórico em `test-runs/` não muda.

## Feature template
```markdown
# <Feature> — SCRUM-xx
Risco: Alto | Base: <critério> | Oráculo: <fonte> | Técnicas: <quais e por quê>

| OK | Comportamento esperado | Técnica | Onde | Suíte/CI |
|---|---|---|---|---|
| [ ] | Deve retornar 200 e token utilizável quando a credencial é válida | Partição | API | smoke/PR |

Fora do escopo: <...>
Exploratório: <link da sessão>
Riscos restantes / dúvidas: <...>
Veredito: LIBERADO | BLOQUEADO — data, SHA backend, SHA frontend, link da execução
```
`[x]` significa implementado e executado com sucesso no SHA registrado. Nunca marcar por leitura de código.

## Defect template
Título (onde + o que + condição) · ambiente/SHA · passos mínimos · esperado e **fonte** · obtido · evidência mascarada · `requestId` · severidade · reprodutibilidade · sugestão de correção (quando cabível).
Antes de reportar: reproduzir 2 vezes e separar produto, teste, ambiente e massa.

**Sugestão de correção:** incluir sempre que for válida e plausível, em seção própria, marcada como "Sugestão do QA — a confirmar".
- Válida: coerente com a história e o oráculo, sem criar regra nova de negócio, sem abrir risco (ex.: enumeração de usuários) e verificável pelo teste existente. Ex.: texto da mensagem ao usuário, código HTTP, validação ausente.
- Descrever o comportamento esperado, não o código. Não citar classe ou linha do produto como se fosse a correção certa.
- Inviável ou incerta (causa desconhecida, depende de decisão de produto, arquitetura): não sugerir; registrar só o que foi observado.
- Falha de segurança: nenhuma sugestão em local público.
- A sugestão não muda o resultado esperado dos testes; só a história confirmada muda. Sugestão aceita pelo responsável passa a ser base no checklist da funcionalidade.
Defeito fechado exige reteste e regressão da área afetada.
