# Test documentation

Um arquivo por funcionalidade em `docs/features/`, até uma página. Detalhes ficam no código; não duplicar passos.

Markdown para documentos, JSON para massa; PDF e TXT não são versionados.
Plano: `docs/test-plan.md`. Histórico: `docs/test-runs/AAAA-MM-DD-scrum-xx-feature.md`, a partir de `_template.md`.
Registrar execução em: história testada, reteste, regressão antes de `develop` → `main` e sessão exploratória. Nunca preencher resultado não executado.
Defeitos: somente no Jira, sem Xray/Zephyr. O agente entrega o texto pronto; não publica no Jira sem OK. Falha de segurança não vai para o repositório público.

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
