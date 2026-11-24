# Plano de testes — Clinix

**Objetivo:** dar sinal claro de LIBERADO ou BLOQUEADO com o mínimo de testes de alto valor.
**Escopo atual:** login e sessão, autorização, usuários e medicamentos. Os demais entram por história do Jira.
**Fora do escopo:** testes unitários (repositórios do produto), produção e dados reais.

| Nível | Ferramenta | Foco |
|---|---|---|
| API e contrato | Playwright + Zod | regras, erros, autorização |
| UI ponta a ponta | Playwright | poucos fluxos críticos |
| Acessibilidade | axe + manual (planejado) | telas principais |
| Carga | k6 (planejado) | login e busca |
| Exploratório e manual | charters | UX, requisito vago, risco novo |

**Riscos principais:** acesso indevido, sessão incorreta, perda ou alteração indevida de dados, quebra de contrato.
**Ambientes:** H2 (rápido) e PostgreSQL 18 em Docker (decisão de liberar).
**Entrada:** história e critérios disponíveis, ambiente saudável, massa sintética pronta.
**Suspensão:** ambiente instável ou defeito que impede o fluxo principal.
**Saída:** checklist executado, nenhum teste `@critical` falhando, nenhum defeito Alto aberto, riscos restantes declarados.
**Defeitos:** Jira. **Histórico:** `test-runs/`. **Aprovação:** responsável pelo QA.
