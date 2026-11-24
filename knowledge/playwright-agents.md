# Playwright Test Agents

Opcionais. Instalar só após o esqueleto do projeto e com OK: `npx playwright init-agents --loop=claude`.
Regenerar ao atualizar o Playwright e revisar o diff: não podem sobrescrever nossas regras.

| Agente | Uso permitido | Limite |
|---|---|---|
| planner | explorar a tela e propor cenários em `specs/` | critério de aceite vem do Jira; reduzir ao mínimo antes de gerar |
| generator | rascunhar teste a partir de plano aprovado | revisar como código humano e provar que o teste consegue falhar |
| healer | diagnosticar locator ou sincronização | **pode transformar falha em teste pulado: nunca aceitar `skip`/`fixme` nem alterar asserção ou resultado esperado sem OK** |

O planner numera cenários no rascunho; descartar os números.
Fonte única do checklist: `docs/features/`. `specs/` é rascunho e não é versionado.
Os agentes só acessam ambiente local com dados sintéticos e seguem todas as regras absolutas.
