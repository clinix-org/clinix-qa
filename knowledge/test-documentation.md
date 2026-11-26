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
- O repositório é a fonte; o Qase é um espelho para consulta e gestão. Plano Free: histórico de 30 dias, por isso o histórico oficial continua em `docs/test-runs/`.
- Acesso pelo MCP oficial (`@qase/mcp-server`), com o token configurado no escopo do usuário do Claude Code, fora do repositório. O token nunca entra em arquivo do projeto, log ou diff.
- Estrutura: suíte = tipo › funcionalidade (`API › Login`, `UI › Login`, `Desempenho › Login`). Caso = o mesmo título do código; descrição com o grupo e o caminho do arquivo; tags com a história (`SCRUM-1`), `smoke` e `critical`; marcado como automatizado.
- A identidade do caso é o título, como no código. IDs do Qase não entram no código nem nos títulos.
- Execução: uma por registro em `test-runs/`, com o mesmo nome do arquivo e os SHAs testados; resultados copiados da execução real, nunca de leitura de código.
- Toda escrita no Qase (casos, execuções, defeitos) é publicação: mostrar a lista e esperar OK. Um OK vale para um lote.
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
Título (onde + o que + condição) · ambiente/SHA · passos mínimos · esperado e **fonte** · obtido · evidência mascarada · `requestId` · severidade · reprodutibilidade.
Antes de reportar: reproduzir 2 vezes e separar produto, teste, ambiente e massa.
Defeito fechado exige reteste e regressão da área afetada.
