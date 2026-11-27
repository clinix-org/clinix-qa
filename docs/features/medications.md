# Cadastro de medicamentos — SCRUM-21
Risco: Alto | Base: critérios da SCRUM-21 (RN01–RN04, RNI01–RNI04) | Oráculo: critérios; normalização do nome e composição com vários princípios ativos são do código, a confirmar | Técnicas: partição, valor limite (dosagem −1, 0, 0,000001), tabela de decisão (duplicidade), estados (perfil)
Plano aprovado pelo responsável em 2026-11-26 (API e UI). Testado contra backend `feat/SCRUM-21` (PR #15) e frontend `feat/SCRUM-21` (PR #8).

| OK | Comportamento esperado | Técnica | Onde | Suíte/CI |
|---|---|---|---|---|
| [x] | Deve retornar 201, estoque zero, data/hora e responsável quando o ADMIN cadastra um medicamento válido | Partição | API | smoke/PR |
| [x] | Deve recusar sem cadastrar quando: o USER tenta cadastrar (403); não há token (401) | Estados | API (2) | regression/noturno |
| [x] | Deve recusar quando a dosagem é: zero; negativa | Limite | API (2) | regression/noturno |
| [x] | Deve cadastrar quando a dosagem é a menor positiva aceita (0.000001) | Limite | API | regression/noturno |
| [x] | Deve indicar o campo obrigatório quando falta: o nome; o princípio ativo; a dosagem; a unidade; a categoria; a apresentação; o fabricante | Partição | API (7) | regression/noturno |
| [x] | Deve recusar quando a opção não pertence à lista de: unidade; categoria; apresentação | Partição | API (3) | regression/noturno |
| [x] | Deve retornar as listas de unidades, categorias e apresentações quando o usuário está autenticado | Partição | API | regression/noturno |
| [x] | Deve retornar 409 e "Medicamento já cadastrado." quando nome, dosagem e unidade já existem | Tabela de decisão | API | smoke/PR |
| [x] | Deve cadastrar quando o nome é igual e muda: a dosagem; a unidade | Tabela de decisão | API (2) | regression/noturno |
| [x] | Deve aparecer na listagem quando o cadastro é concluído | Partição | API | regression/noturno |
| [x] | Deve exibir "Novo Medicamento" quando o ADMIN abre a lista | Estados | UI | smoke/PR |
| [x] | Não deve exibir "Novo Medicamento" quando o USER abre a lista | Estados | UI | regression/noturno |
| [x] | Deve apresentar os campos obrigatórios e as listas de opções quando o formulário abre | Partição | UI | regression/noturno |
| [x] | Deve alertar e não enviar quando há campo obrigatório vazio | Partição | UI | regression/noturno |
| [x] | Deve alertar e não enviar quando a dosagem é zero | Limite | UI | regression/noturno |
| [x] | Deve exibir sucesso e mostrar o medicamento na lista quando todos os campos são válidos | Partição | UI | smoke/PR |
| [x] | Deve exibir "Medicamento já cadastrado." quando o medicamento já existe | Tabela de decisão | UI | regression/noturno |

Massa: nome único por teste (`QA Medicamento <8 hex>`); a fixture `medications` remove por `DELETE /medications/{id}` tudo o que o teste criou, pela API ou pela tela, mesmo em falha. Na UI, a sessão vem da API (token no localStorage), sem login pela tela. Nenhum dado real.
Prova de falha (2026-11-26): backend adulterado em cópia temporária (sem `@PreAuthorize`, dosagem 0 aceita, duplicidade desligada, responsável fixo, fabricante opcional): cada adulteração reprovou exatamente o teste correspondente; os demais 17 passaram. UI: frontend adulterado em cópia temporária (botão para todos, lista sem obrigatoriedade, fabricante opcional, dosagem 0 aceita, texto de sucesso trocado, aviso de duplicidade desligado): 6 de 6 reprovados pelo motivo certo; o teste do botão para ADMIN, não adulterado, passou.
Fora do escopo: edição e exclusão (existem na API, sem história; o DELETE só é usado para limpar massa); estoque; filtro; carga (k6, depois).
Exploratório: a fazer — vários princípios ativos (até 30), dosagem com vírgula e 6 casas, nome com acento/caixa/espaços, duplo clique em Cadastrar, teclado, nome longo no toast.
Observações (baixa severidade, fora dos critérios):
- O 401 sem token não traz `requestId`, e o texto diz "Sessão expirada ou inválido." (concordância). Já existia antes da SCRUM-21.
- `createdAt` do POST tem nanossegundos; o valor persistido no PostgreSQL tem microssegundos. O instante coincide em milissegundos.
Riscos restantes / dúvidas (para o PO):
- Duplicidade: a história usa nome + dosagem + unidade; o código também compara o **nome do princípio ativo** (mesmo nome comercial, 500 mg, princípio ativo diferente = permitido). Qual vale?
- Composição: a história tem um princípio ativo; o código aceita de 1 a 30, cada um com dosagem e unidade.
- Nome igual com caixa/espaços diferentes conta como duplicado? (o código diz que sim; a história não diz).
- Unidades: a história cita "ml", que não está na lista; micrograma aparece como `mgc` (usual: `mcg`/`µg`), enquanto existe `mcg/mL`.
- "Alerta antes de salvar": campo vazio e dosagem zero são barrados pelo balão nativo do navegador (os testes verificam `validationMessage` e que nada foi gravado); o alerta próprio da aplicação só aparece em casos que o navegador deixa passar. O balão nativo atende?
- RN02: data/hora/usuário ficam na resposta da API e na auditoria; não aparecem na tela. Basta?
Veredito proposto: LIBERADO para os critérios da SCRUM-21 como escritos (28/28) — 2026-11-26, backend `569de32`, frontend `164fde0`; ver `../test-runs/2026-11-26-scrum-21-medications.md`. Ressalvas: as 6 dúvidas acima podem mudar o resultado esperado; decisão final do responsável.
