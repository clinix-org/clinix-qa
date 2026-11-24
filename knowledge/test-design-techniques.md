# Test design techniques

Escolha a menor combinação que cubra o risco e registre o motivo em uma linha.

| Situação | Técnica | Item de cobertura | Exemplo Clinix |
|---|---|---|---|
| Grupos tratados igual | Partição de equivalência | cada partição | role ADMIN, USER, inválida |
| Limites e tamanhos | Valor limite | limite e vizinho | senha com 5, 6 e 7 dígitos |
| Regras combinadas | Tabela de decisão | cada regra viável | papel × operação × token |
| Ciclo de vida | Transição de estados | transições válidas e inválidas críticas | ativo → inativo → login |
| Muitos parâmetros | Pairwise | cada par | busca × ordem × página |
| Oráculo difícil | Metamórfico | relação | filtro é subconjunto do total |
| Histórico/experiência | Error guessing | hipótese | JSON malformado, e-mail duplicado |
| Código existente | Caixa-branca (ler branches) | decisão sem teste | handlers de exceção |

- Todo caso positivo importante tem o negativo de maior risco. Não combine dois inválidos no mesmo caso.
- Não multiplique matriz completa na UI: combinações na API, um fluxo representativo na UI.
- Testes unitários pertencem ao repositório do backend/frontend: reporte lacunas, não as compense com E2E.
