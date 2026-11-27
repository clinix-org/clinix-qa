# Paginação de medicamentos — SCRUM-33
Risco: Médio (busca/paginação) | Base: regras e critérios escritos pelo QA em 2026-11-27 a partir do código e da explicação do desenvolvedor (a história no Jira só tem título; revisão com PO e DEV pendente) | Oráculo: esses critérios (RN01–RN08, RNI01–RNI07) | Técnicas: partição (página cheia, última parcial, além da última), valor limite (tamanho 0, 1, 100, 101; página −1), tabela (parâmetros inválidos), estados (vazio, erro)
Testado contra a `develop`: a paginação entrou nas PRs backend #12 e frontend #5 (2026-10-26) e foi reescrita pela SCRUM-21.

| OK | Comportamento esperado | Técnica | Onde | Suíte/CI |
|---|---|---|---|---|
| [x] | Deve devolver 2 itens, total 5, 3 páginas e não ser a última quando a primeira página tem tamanho 2 | Partição | API | smoke/PR |
| [x] | Deve devolver o item restante e indicar a última página quando a página 2 de tamanho 2 é pedida | Partição | API | regression/noturno |
| [x] | Deve devolver 200 com lista vazia quando a página pedida passa da última | Partição | API | regression/noturno |
| [x] | Deve usar a página 0 e 10 itens por página quando nenhum parâmetro é enviado | Partição | API | regression/noturno |
| [x] | Deve aceitar a listagem quando o tamanho da página é: 1; 100 | Limite | API (2) | regression/noturno |
| [x] | Deve seguir a ordem alfabética do nome em todas as páginas quando a ordenação é a padrão | Partição | API | regression/noturno |
| [x] | Deve listar cada medicamento uma única vez quando nomes iguais se espalham por várias páginas | Partição | API | regression/noturno |
| [x] | Deve contar só os medicamentos da busca quando o termo tem outra caixa e espaços extras | Partição | API | regression/noturno |
| [x] | Deve tratar como texto quando aparece no termo da busca: "%"; "_" | Partição | API (2) | regression/noturno |
| [x] | Deve recusar com 400 e mensagem quando: a página é negativa; o tamanho é 0; o tamanho é 101; o campo de ordenação não é permitido; a direção não é asc nem desc; a página não é numérica; o tamanho é decimal | Limite, tabela | API (7) | regression/noturno |
| [x] | Deve recusar com 401 quando a listagem é pedida sem token | Estados | API | regression/noturno |
| [x] | Deve mostrar 10 medicamentos, o total e a página 1 destacada quando a lista abre com 12 resultados | Partição | UI | smoke/PR |
| [x] | Deve mostrar a página seguinte e voltar à anterior quando uso Próxima e Anterior | Partição | UI | regression/noturno |
| [x] | Deve desabilitar Anterior na primeira página e Próxima na última quando há 2 páginas | Limite | UI | regression/noturno |
| [x] | Deve ir à página clicada e mostrar só a primeira, a vizinha e a última quando há 5 páginas | Partição | UI | regression/noturno |
| [x] | Deve voltar à página 1 e mostrar os 12 itens quando mudo para 20 itens por página | Estados | UI | regression/noturno |
| [x] | Deve voltar à página 1 e atualizar o total quando a busca muda estando na página 2 | Estados | UI | regression/noturno |
| [x] | Deve mostrar "Nenhum medicamento encontrado.", 0 resultados e a navegação desabilitada quando a busca não encontra nada | Estados | UI | regression/noturno |
| [x] | Deve mostrar a mensagem de erro da API quando a listagem falha | Estados | UI | regression/noturno |

Massa: cada teste cria a sua com um prefixo único (`QA Pagina <8 hex>`) e busca por ele. Isso isola as contagens dos demais cadastros e permite rodar em paralelo e no PostgreSQL já populado. A fixture `medications` (`seed`) cadastra em sequência e remove tudo ao final, mesmo em falha. Na API, o critério "25 itens em páginas de 10" é testado na mesma partição em escala menor: 5 itens em páginas de 2. A falha da API na UI é simulada com `page.route` apenas na listagem.
Coberturas existentes: USER lista medicamentos ("deve aparecer na listagem quando o cadastro é concluído", SCRUM-21). Abrir a página do novo medicamento após o cadastro (RNI06) está coberto por "deve exibir sucesso e mostrar o medicamento na lista quando todos os campos são válidos" quando o banco tem mais de 10 medicamentos (PostgreSQL). Não há teste próprio porque o resultado depende do total global do banco, que os testes em paralelo alteram.
Prova de falha (2026-11-27), em cópias temporárias do produto:
- Backend em H2, compilação A: limite de 100 removido, curingas sem escape, espaços não normalizados, ordenação por `manufacturer` aceita, padrão de 20 itens e desempate por ID removido. Reprovou exatamente os 7 testes correspondentes. O de desempate reprovou com a ordem dos IDs trocada entre páginas.
- Backend em H2, compilação B: total da página no lugar do total geral. Reprovou os 4 testes que conferem o total.
- Frontend no Vite, 9 adulterações aplicadas uma por vez (padrão de 20 itens, quantidade e busca sem voltar à página 1, Anterior sempre habilitado, todas as páginas visíveis, página sem o −1, mensagem da API ignorada, texto do estado vazio, total da página). Todas reprovaram ao menos o teste da regra.
Fora do escopo: estado "carregando" (transitório; sem asserção estável sem atrasar a API); ordenação pela tela (a tela não oferece); carga (k6, só a pedido).
Exploratório: a fazer — digitação rápida na busca (uma requisição por tecla, cancelada pela seguinte), atualizar o navegador numa página > 1, teclado e leitor de tela na navegação.
Observações (baixa severidade):
- Os botões Anterior e Próxima têm só ícone e não têm nome acessível. O leitor de tela não os anuncia, e os testes usam test id.
- `AppConsts.PAGE_SIZE = "20"` no backend não é usado; o padrão real é 10 (para o DEV).
- A documentação do backend diz "mais recentes primeiro"; a tela mostra do mais antigo para o mais novo.
Riscos restantes / dúvidas (para o PO):
- Busca: o campo diz "Pesquisar por código, categoria ou descrição", mas a busca é só pelo nome comercial. Qual vale?
- Ordem da lista: mais antigos primeiro (tela) ou mais recentes primeiro (documentação)?
- Quantidades por página 5, 10, 20 e 50, com padrão 10: confirmadas?
- Página além da última devolve lista vazia sem erro: está bom?
- Ao atualizar o navegador, a lista volta à página 1 (a página não fica no endereço): aceitável?
Veredito proposto: LIBERADO para os critérios escritos pelo QA (27/27) — 2026-11-27, backend `7522778`, frontend `ef2ad24`; ver `../test-runs/2026-11-27-scrum-33-medications-pagination.md`. Ressalvas: os critérios ainda não foram revisados por PO e DEV; as 5 dúvidas podem mudar o resultado esperado.
