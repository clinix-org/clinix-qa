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

## Estratégia de trabalho
- Uma história por vez: critérios → checklist → API → UI → execução → veredito.
- Regras e combinações na API; na UI, o que o usuário vê. k6 depois das histórias validadas.
- Desenvolver e decidir em containers com PostgreSQL; ao final, `@smoke` em H2.
- Teste novo passa 3 vezes e prova que consegue falhar (produto adulterado em cópia temporária).
- Defeito mantém o teste vermelho, sem `skip`; o resultado esperado só muda com a história.
- CI: `quality.yml` (PR, smoke em H2) e `regression.yml` (noturno, tudo em PostgreSQL).
