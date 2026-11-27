# Gestão de usuários — SCRUM-15, SCRUM-14, SCRUM-16 (épico SCRUM-20)
Risco: Alto (autorização, auditoria, exclusão) | Base: critérios e regras das histórias SCRUM-15 (cadastrar), SCRUM-14 (listar/dashboard) e SCRUM-16 (gerenciar), com as decisões do responsável de 2026-11-27 abaixo | Oráculo: esses critérios e decisões; o bloqueio de o ADMIN tornar a si mesmo inativo vem do código (regra a incluir na SCRUM-16) | Técnicas: partição, valor limite (senha com 5, 6 e 7 dígitos), tabela de decisão (perfil × ação), transição de estado (ativo → inativo → sem acesso; excluído → removido)
Plano aprovado pelo responsável em 2026-11-27. Testado contra a `develop` (backend `7522778`, frontend `ef2ad24`). Organização: testes por operação (`create`, `list`, `update`, `delete`); cada teste traz a história na `annotation`.
Decisões do responsável (2026-11-27), que substituem o texto das histórias até o PO atualizá-las:
- Excluir remove o usuário de verdade (exclusão física). Para tirar o acesso sem apagar, o ADMIN edita o status para Inativo. A SCRUM-16 ainda diz "exclusão lógica".
- O acesso pelo dashboard é o menu "Usuários" (só aparece para o ADMIN). A SCRUM-14 ainda diz "Gestão de usuários".
- O perfil colaborador se chama "User". A SCRUM-15 ainda diz "Colaborador".
- "Nenhum usuario encontrado." sem acento não é defeito: o responsável trata o ajuste de texto direto com o DEV. O teste aceita com ou sem acento.

## SCRUM-15 — Cadastrar novo usuário
| OK | Comportamento esperado | Técnica | Onde | Suíte/CI |
|---|---|---|---|---|
| [x] | Deve retornar 201 sem senha, ativo, com responsável e data/hora quando o ADMIN cadastra um: Colaborador; Administrador | Partição | API (2) | smoke/PR |
| [x] | Deve autenticar com a senha cadastrada quando o usuário acabou de ser criado | Estados | API | smoke/PR |
| [x] | Deve recusar e indicar o campo quando falta: o nome; o e-mail; a senha; o perfil | Partição | API (4) | regression/noturno |
| [x] | Deve recusar quando o e-mail: não pertence ao domínio @clinix.com; não tem formato válido | Partição | API (2) | regression/noturno |
| [x] | Deve recusar quando a senha: tem 5 dígitos; tem 7 dígitos; tem letra | Limite | API (3) | regression/noturno |
| [x] | Deve retornar 409 com mensagem e manter um só cadastro quando o e-mail já existe: idêntico; com letras maiúsculas | Tabela de decisão | API (2) | regression/noturno |
| [x] | Deve recusar sem cadastrar quando: o USER tenta cadastrar (403); não há token (401) | Estados | API (2) | regression/noturno |
| [x] | Deve apresentar Nome, E-mail, Senha, Confirmação de senha e Perfil obrigatórios quando o formulário abre | Partição | UI | regression/noturno |
| [x] | Deve oferecer os perfis User e Administrador quando o formulário abre | Partição | UI | regression/noturno |
| [x] | Deve exibir sucesso e mostrar o usuário na lista quando o ADMIN preenche dados válidos | Partição | UI | smoke/PR |
| [x] | Deve alertar e não enviar quando um campo obrigatório está vazio | Partição | UI | regression/noturno |
| [x] | Deve exibir "As senhas precisam ser iguais." e não enviar quando a confirmação é diferente | Partição | UI | regression/noturno |
| [ ] | Deve informar que o e-mail já está cadastrado quando o ADMIN usa um e-mail existente | Tabela de decisão | UI | regression/noturno — **falha**: bloqueia, mas não mostra mensagem (Qase CLINIX-7) |

## SCRUM-14 — Listar os usuários (Dashboard)
| OK | Comportamento esperado | Técnica | Onde | Suíte/CI |
|---|---|---|---|---|
| [x] | Deve listar administradores, colaboradores, ativos e inativos sem expor a senha quando o ADMIN consulta | Partição | API | smoke/PR |
| [x] | Deve retornar 200 e lista vazia quando nenhum usuário corresponde à busca | Partição | API | regression/noturno |
| [x] | Deve recusar a lista de usuários quando: o USER consulta (403); não há token (401) | Estados | API (2) | regression/noturno |
| [x] | Deve abrir a lista de usuários quando o ADMIN clica em "Usuários" no menu do dashboard | Partição | UI | regression/noturno |
| [x] | Não deve exibir o módulo Usuários quando o USER abre o dashboard | Estados | UI | regression/noturno |
| [x] | Deve exibir acesso negado quando o USER abre /usuarios pelo endereço | Estados | UI | regression/noturno |
| [x] | Deve exibir usuário, e-mail, acesso, status e os ícones de editar e excluir quando o ADMIN abre a lista | Partição | UI | smoke/PR |
| [x] | Deve exibir "Nenhum usuário encontrado." quando a busca não encontra usuários (acento opcional) | Partição | UI | regression/noturno |

## SCRUM-16 — Gerenciar usuários
| OK | Comportamento esperado | Técnica | Onde | Suíte/CI |
|---|---|---|---|---|
| [x] | Deve encontrar somente o usuário correspondente quando a busca usa: parte do nome; parte do e-mail; o nome em maiúsculas | Partição | API (3) | regression/noturno |
| [x] | Deve gravar nome, perfil e status com responsável e data/hora quando o ADMIN edita o usuário | Partição | API | smoke/PR |
| [x] | Deve recusar com 409 sem alterar quando o novo e-mail pertence a outro usuário | Tabela de decisão | API | regression/noturno |
| [x] | Deve retornar 404 quando o usuário não existe: na edição; na exclusão | Partição | API (2) | regression/noturno |
| [x] | Deve recusar com 401 o token já emitido quando o ADMIN torna o usuário inativo | Transição de estado | API | regression/noturno |
| [x] | Deve recusar sem alterar quando o ADMIN tenta: tornar a si mesmo inativo; excluir a si mesmo | Tabela de decisão | API (2) | regression/noturno |
| [x] | Deve recusar sem alterar quando o USER tenta (403) ou não há token (401): editar; excluir | Estados | API (4) | regression/noturno |
| [x] | Deve remover o registro quando o ADMIN exclui um usuário | Transição de estado | API | regression/noturno |
| [x] | Deve mostrar somente o usuário correspondente quando o ADMIN pesquisa por parte do e-mail | Partição | UI | regression/noturno |
| [x] | Deve impedir que o ADMIN exclua a si mesmo quando abre a própria linha | Estados | UI | regression/noturno |
| [x] | Deve abrir a edição com nome, e-mail, perfil e status do usuário quando o ADMIN clica no lápis | Partição | UI | regression/noturno |
| [x] | Deve atualizar a lista quando o ADMIN salva nome e status alterados | Partição | UI | regression/noturno |
| [x] | Deve pedir confirmação e manter o usuário quando o ADMIN cancela a exclusão | Estados | UI | regression/noturno |
| [x] | Deve remover o usuário da lista quando o ADMIN confirma a exclusão | Transição de estado | UI | regression/noturno |

Massa: nome e e-mail únicos por teste (`QA Usuario <10 hex>`, `qa.tmp<10 hex>@clinix.com`); a fixture `users` remove por `DELETE /users/{id}` tudo o que o teste criou, pela API ou pela tela, mesmo em falha. Os testes de "a si mesmo" usam um ADMIN temporário, para que uma falha nunca bloqueie nem apague o ADMIN do ambiente. Na UI, a sessão vem da API (token no localStorage). Nenhum dado real. 
Prova de falha (2026-11-27), em cópias temporárias do produto:
- Backend em H2 com 11 alterações (USER com acesso a `/users`, senha de 5 a 7 caracteres, domínio livre, duplicidade desligada no cadastro e na edição, responsável fixo, autoexclusão e autodesativação liberadas, busca sensível a maiúsculas, inativo com token válido, `updatedBy` não gravado): reprovaram exatamente os 19 testes correspondentes; os outros 16 passaram.
- Frontend com 10 alterações (módulo liberado para todos, excluir sempre habilitado, busca ignorada, confirmação de senha ignorada, nome opcional, texto de sucesso trocado, edição sem e-mail, lista sem atualizar após editar, Cancelar que exclui, coluna Status renomeada): todas reprovaram o teste correspondente. "Atualizar a lista após editar" foi conferido em uma segunda rodada, com a edição sem e-mail desfeita, porque as duas alterações reprovavam o mesmo teste.
- Reteste após as decisões (2026-11-27): backend em H2 com a exclusão trocada por inativação; o teste "deve remover o registro quando o ADMIN exclui um usuário" reprovou (GET 200 em vez de 404) e os outros 35 passaram.
- O teste "acesso negado em /usuarios" continuou passando com o bloqueio da tela removido, porque a API devolve 403 e a tela redireciona para "Acesso negado". O colaborador continua barrado, mas só pela API; a proteção da tela não fica provada sozinha.
Fora do escopo: log do sistema (`system_logs`): a gravação existe e tem teste unitário no backend, mas não há tela nem API para lê-lo; a decisão (consultar o banco, pedir endpoint ou manter só o unitário) está com o responsável. Também ficam fora: cores de "Ativo"/"Inativo" (checagem visual manual), filtros de acesso/status e paginação da tela (sem critério), troca de senha na edição (sem critério) e carga (k6, só a pedido).
Exploratório: a fazer. Pontos: busca com `%` e `_` (hoje `_` traz todos), digitação rápida na busca (uma requisição por tecla, sem cancelar a anterior), ADMIN editando o próprio e-mail (o token pode deixar de valer), excluir outro ADMIN, nome com 255+ caracteres, duplo clique em "Criar novo usuário", teclado e foco nos modais.
Observações (baixa severidade):
- O 401 e o 403 de `/users` não trazem `requestId` (vêm do filtro de segurança; o 403 de medicamentos traz).
- `createdAt`/`updatedAt` de usuário vêm sem fuso (horário do servidor, hoje UTC); os de medicamento vêm com fuso.
- Mensagens da API sem acento em parte dos casos ("Ja existe um usuario...", "Usuario nao encontrado.", "Nao e permitido..."), com acento em outros ("O e-mail é obrigatório.").
- Autoexclusão e autodesativação respondem 400 `BAD_REQUEST` (código genérico).
- O dashboard mostra números e atividades fixos no código (24, 179, 42).
- Com a exclusão física, o log do sistema guarda o e-mail do usuário excluído no texto do registro ("Usuario excluido: <e-mail>"). O histórico fica preservado, mas o dado pessoal continua no banco: ponto para o PO avaliar com a LGPD.
- O ícone de excluir fica desabilitado para todos os administradores, não só para o próprio usuário; a API permite excluir outro ADMIN.
Riscos restantes / dúvidas: ver o texto para PO e DEV entregue em 2026-11-27.
Veredito proposto: BLOQUEADO — 2026-11-27, backend `7522778`, frontend `ef2ad24`; 51/52 testes da gestão de usuários passaram (35/35 API, 16/17 UI). O bloqueio vem do e-mail duplicado sem mensagem na tela (critério de aceite da SCRUM-15, Qase CLINIX-7). As demais divergências com o texto das histórias foram resolvidas pelas decisões do responsável acima; as histórias precisam ser atualizadas pelo PO. Ver `../test-runs/2026-11-27-scrum-20-user-management.md`.
