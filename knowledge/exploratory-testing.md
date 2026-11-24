# Exploratory, manual and experience-based testing

Usar em funcionalidade nova, mudança arriscada, UX, requisito vago ou após defeito. Sessão de 45–60 min.

## Charter template
```markdown
# <título da missão>
Explorar: <área>
Com: <perfil, dados, ferramenta>
Para descobrir: <risco>
Ambiente/SHA: <...> · Início/fim: <...>

- [ ] Ideia 1
- [ ] Ideia 2

Observações · Defeitos · Dúvidas · Não coberto · Candidatos a automação
```
Salvar em `docs/exploratory/AAAA-MM-DD-<assunto>.md`.

## Heuristics
- **Tours**: funcionalidades principais, papéis, dados estranhos, interrupções.
- **Ataques**: duplo clique, duas abas, voltar, refresh, rede lenta/caída, token removido, concorrência.
- **CRUD**: criar, ler, alterar, excluir e repetir cada operação.
- **UX manual**: teclado, foco, zoom 200%, celular, mensagens, estados vazio/carregando/erro.

Defeito relevante encontrado vira teste de regressão no nível mais baixo possível. O agente prepara charter e massa; o julgamento de usabilidade é humano. Nunca registrar sessão que não foi executada.
