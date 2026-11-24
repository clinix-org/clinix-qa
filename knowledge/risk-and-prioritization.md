# Risk and prioritization

Risco = impacto × probabilidade. Na dúvida entre dois níveis, use o maior.

| Nível | Exemplos | Conduta |
|---|---|---|
| Alto | autenticação, autorização, dados sensíveis, auditoria, pagamento, fluxo crítico, contrato de API | Parar, análise curta, aguardar OK |
| Médio | regra de negócio, integração, busca/paginação | Automatizar caminho principal e falhas relevantes |
| Baixo | texto, layout, melhoria isolada | Checklist manual ou nenhum teste novo |

## High-risk analysis (até 10 linhas)
Funcionalidade · test basis · oráculo · o que pode dar errado · cobertura existente · técnica · casos mínimos · onde roda · dúvida para decidir.

## Create a test only if
- [ ] protege contra uma falha que importa e ninguém mais detecta;
- [ ] não dá para detectar em nível mais baixo;
- [ ] o custo de manter é menor que o da falha.

Automatizar quando se repete (heurística: 5 ou mais execuções). Cobertura é medida por **riscos e regras cobertos**, não por quantidade de testes nem por percentual de linhas.
**BLOQUEADO**: falha em `@critical`, defeito Alto aberto, ou risco Alto sem verificação. Aceitar risco é decisão do responsável, não do agente.
