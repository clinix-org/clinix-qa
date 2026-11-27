# Catálogo de testes automatizados

> Gerado por `npm run docs:catalog` a partir do código. Não edite à mão: altere o teste e gere de novo.
> Resultado das execuções: `test-runs/`. Plano: `test-plan.md`. Checklist por funcionalidade: `features/`.

| Tipo | Casos | Smoke (PR) | Críticos |
|---|---|---|---|
| API | 86 | 10 | 37 |
| Interface web (UI) | 48 | 8 | 18 |
| Desempenho (k6) | 0 | 0 | 0 |
| **Total** | **134** | **18** | **55** |

## API

### Cadastro de medicamentos — SCRUM-21

| Grupo | Caso | Suíte | Crítico | Código |
|---|---|---|---|---|
| cadastro válido | deve retornar 201, estoque zero, data/hora e responsável quando o ADMIN cadastra um medicamento válido | smoke + regressão | sim | [create-medication.spec.ts:20](../tests/api/medications/create-medication.spec.ts#L20) |
| acesso administrativo | deve recusar sem cadastrar quando o USER tenta cadastrar | regressão | sim | [create-medication.spec.ts:60](../tests/api/medications/create-medication.spec.ts#L60) |
| acesso administrativo | deve recusar sem cadastrar quando não há token | regressão | sim | [create-medication.spec.ts:70](../tests/api/medications/create-medication.spec.ts#L70) |
| dosagem positiva | deve recusar quando a dosagem é zero | regressão | sim | [create-medication.spec.ts:93](../tests/api/medications/create-medication.spec.ts#L93) |
| dosagem positiva | deve recusar quando a dosagem é negativa | regressão | sim | [create-medication.spec.ts:93](../tests/api/medications/create-medication.spec.ts#L93) |
| dosagem positiva | deve cadastrar quando a dosagem é a menor positiva aceita | regressão | sim | [create-medication.spec.ts:110](../tests/api/medications/create-medication.spec.ts#L110) |
| campos obrigatórios | deve indicar o campo obrigatório quando falta o nome | regressão |  | [create-medication.spec.ts:161](../tests/api/medications/create-medication.spec.ts#L161) |
| campos obrigatórios | deve indicar o campo obrigatório quando falta o princípio ativo | regressão |  | [create-medication.spec.ts:161](../tests/api/medications/create-medication.spec.ts#L161) |
| campos obrigatórios | deve indicar o campo obrigatório quando falta a dosagem | regressão |  | [create-medication.spec.ts:161](../tests/api/medications/create-medication.spec.ts#L161) |
| campos obrigatórios | deve indicar o campo obrigatório quando falta a unidade | regressão |  | [create-medication.spec.ts:161](../tests/api/medications/create-medication.spec.ts#L161) |
| campos obrigatórios | deve indicar o campo obrigatório quando falta a categoria | regressão |  | [create-medication.spec.ts:161](../tests/api/medications/create-medication.spec.ts#L161) |
| campos obrigatórios | deve indicar o campo obrigatório quando falta a apresentação | regressão |  | [create-medication.spec.ts:161](../tests/api/medications/create-medication.spec.ts#L161) |
| campos obrigatórios | deve indicar o campo obrigatório quando falta o fabricante | regressão |  | [create-medication.spec.ts:161](../tests/api/medications/create-medication.spec.ts#L161) |
| listas predefinidas | deve retornar as listas de unidades, categorias e apresentações quando o usuário está autenticado | regressão |  | [create-medication.spec.ts:180](../tests/api/medications/create-medication.spec.ts#L180) |
| listas predefinidas | deve recusar quando a opção não pertence à lista de unidade | regressão |  | [create-medication.spec.ts:216](../tests/api/medications/create-medication.spec.ts#L216) |
| listas predefinidas | deve recusar quando a opção não pertence à lista de categoria | regressão |  | [create-medication.spec.ts:216](../tests/api/medications/create-medication.spec.ts#L216) |
| listas predefinidas | deve recusar quando a opção não pertence à lista de apresentação | regressão |  | [create-medication.spec.ts:216](../tests/api/medications/create-medication.spec.ts#L216) |
| medicamento já cadastrado | deve retornar 409 e "Medicamento já cadastrado." quando nome, dosagem e unidade já existem | smoke + regressão | sim | [create-medication.spec.ts:237](../tests/api/medications/create-medication.spec.ts#L237) |
| mesmo nome com outra dosagem ou unidade | deve cadastrar quando o nome é igual e muda a dosagem | regressão |  | [create-medication.spec.ts:263](../tests/api/medications/create-medication.spec.ts#L263) |
| mesmo nome com outra dosagem ou unidade | deve cadastrar quando o nome é igual e muda a unidade | regressão |  | [create-medication.spec.ts:263](../tests/api/medications/create-medication.spec.ts#L263) |
| lista principal | deve aparecer na listagem quando o cadastro é concluído | regressão |  | [create-medication.spec.ts:289](../tests/api/medications/create-medication.spec.ts#L289) |

### Cadastro de usuários — SCRUM-15

| Grupo | Caso | Suíte | Crítico | Código |
|---|---|---|---|---|
| cadastro válido | deve retornar 201 sem senha, ativo, com responsável e data/hora quando o ADMIN cadastra um Colaborador | smoke + regressão | sim | [create-user.spec.ts:20](../tests/api/users/create-user.spec.ts#L20) |
| cadastro válido | deve retornar 201 sem senha, ativo, com responsável e data/hora quando o ADMIN cadastra um Administrador | smoke + regressão | sim | [create-user.spec.ts:20](../tests/api/users/create-user.spec.ts#L20) |
| cadastro válido | deve autenticar com a senha cadastrada quando o usuário acabou de ser criado | smoke + regressão | sim | [create-user.spec.ts:59](../tests/api/users/create-user.spec.ts#L59) |
| campos obrigatórios | deve recusar e indicar o campo quando falta o nome | regressão |  | [create-user.spec.ts:91](../tests/api/users/create-user.spec.ts#L91) |
| campos obrigatórios | deve recusar e indicar o campo quando falta o e-mail | regressão |  | [create-user.spec.ts:91](../tests/api/users/create-user.spec.ts#L91) |
| campos obrigatórios | deve recusar e indicar o campo quando falta a senha | regressão |  | [create-user.spec.ts:91](../tests/api/users/create-user.spec.ts#L91) |
| campos obrigatórios | deve recusar e indicar o campo quando falta o perfil | regressão |  | [create-user.spec.ts:91](../tests/api/users/create-user.spec.ts#L91) |
| e-mail corporativo | deve recusar quando o e-mail não pertence ao domínio @clinix.com | regressão |  | [create-user.spec.ts:111](../tests/api/users/create-user.spec.ts#L111) |
| e-mail corporativo | deve recusar quando o e-mail não tem formato válido | regressão |  | [create-user.spec.ts:126](../tests/api/users/create-user.spec.ts#L126) |
| senha de 6 dígitos | deve recusar quando a senha tem 5 dígitos | regressão |  | [create-user.spec.ts:154](../tests/api/users/create-user.spec.ts#L154) |
| senha de 6 dígitos | deve recusar quando a senha tem 7 dígitos | regressão |  | [create-user.spec.ts:154](../tests/api/users/create-user.spec.ts#L154) |
| senha de 6 dígitos | deve recusar quando a senha tem letra | regressão |  | [create-user.spec.ts:154](../tests/api/users/create-user.spec.ts#L154) |
| e-mail único | deve retornar 409 com mensagem e manter um só cadastro quando o e-mail já existe (idêntico) | regressão | sim | [create-user.spec.ts:181](../tests/api/users/create-user.spec.ts#L181) |
| e-mail único | deve retornar 409 com mensagem e manter um só cadastro quando o e-mail já existe (com letras maiúsculas) | regressão | sim | [create-user.spec.ts:181](../tests/api/users/create-user.spec.ts#L181) |
| acesso administrativo | deve recusar sem cadastrar quando o USER tenta cadastrar | regressão | sim | [create-user.spec.ts:205](../tests/api/users/create-user.spec.ts#L205) |
| acesso administrativo | deve recusar sem cadastrar quando não há token | regressão | sim | [create-user.spec.ts:217](../tests/api/users/create-user.spec.ts#L217) |

### Gestão de usuários — SCRUM-14

| Grupo | Caso | Suíte | Crítico | Código |
|---|---|---|---|---|
| listagem | deve listar administradores, colaboradores, ativos e inativos sem expor a senha quando o ADMIN consulta | smoke + regressão | sim | [list-users.spec.ts:15](../tests/api/users/list-users.spec.ts#L15) |
| busca sem resultado | deve retornar 200 e lista vazia quando nenhum usuário corresponde à busca | regressão |  | [list-users.spec.ts:71](../tests/api/users/list-users.spec.ts#L71) |
| acesso à listagem | deve recusar com 403 quando o USER consulta a lista de usuários | regressão | sim | [list-users.spec.ts:90](../tests/api/users/list-users.spec.ts#L90) |
| acesso à listagem | deve recusar com 401 quando a lista de usuários é consultada sem token | regressão | sim | [list-users.spec.ts:100](../tests/api/users/list-users.spec.ts#L100) |

### Gestão de usuários — SCRUM-16

| Grupo | Caso | Suíte | Crítico | Código |
|---|---|---|---|---|
| exclusão | deve remover o registro quando o ADMIN exclui um usuário | regressão | sim | [delete-user.spec.ts:13](../tests/api/users/delete-user.spec.ts#L13) |
| exclusão | deve recusar sem excluir quando o ADMIN tenta excluir a si mesmo | regressão | sim | [delete-user.spec.ts:31](../tests/api/users/delete-user.spec.ts#L31) |
| exclusão | deve retornar 404 quando o usuário excluído não existe | regressão | sim | [delete-user.spec.ts:52](../tests/api/users/delete-user.spec.ts#L52) |
| acesso à exclusão | deve recusar com 403 sem excluir quando o USER tenta excluir | regressão | sim | [delete-user.spec.ts:84](../tests/api/users/delete-user.spec.ts#L84) |
| acesso à exclusão | deve recusar com 401 sem excluir quando não há token | regressão | sim | [delete-user.spec.ts:84](../tests/api/users/delete-user.spec.ts#L84) |
| pesquisa | deve encontrar somente o usuário correspondente quando a busca usa parte do nome | regressão |  | [list-users.spec.ts:48](../tests/api/users/list-users.spec.ts#L48) |
| pesquisa | deve encontrar somente o usuário correspondente quando a busca usa parte do e-mail | regressão |  | [list-users.spec.ts:48](../tests/api/users/list-users.spec.ts#L48) |
| pesquisa | deve encontrar somente o usuário correspondente quando a busca usa o nome em maiúsculas | regressão |  | [list-users.spec.ts:48](../tests/api/users/list-users.spec.ts#L48) |
| edição | deve gravar nome, perfil e status com responsável e data/hora quando o ADMIN edita o usuário | smoke + regressão | sim | [update-user.spec.ts:23](../tests/api/users/update-user.spec.ts#L23) |
| edição | deve recusar com 409 sem alterar quando o novo e-mail pertence a outro usuário | regressão | sim | [update-user.spec.ts:48](../tests/api/users/update-user.spec.ts#L48) |
| edição | deve retornar 404 quando o usuário editado não existe | regressão | sim | [update-user.spec.ts:72](../tests/api/users/update-user.spec.ts#L72) |
| usuário inativo | deve recusar com 401 o token já emitido quando o ADMIN torna o usuário inativo | regressão | sim | [update-user.spec.ts:94](../tests/api/users/update-user.spec.ts#L94) |
| usuário inativo | deve recusar sem alterar quando o ADMIN tenta tornar a si mesmo inativo | regressão | sim | [update-user.spec.ts:113](../tests/api/users/update-user.spec.ts#L113) |
| acesso à edição | deve recusar com 403 sem alterar quando o USER tenta editar | regressão | sim | [update-user.spec.ts:155](../tests/api/users/update-user.spec.ts#L155) |
| acesso à edição | deve recusar com 401 sem alterar quando não há token | regressão | sim | [update-user.spec.ts:155](../tests/api/users/update-user.spec.ts#L155) |
| log do sistema | deve registrar a ação com data, hora e o ADMIN responsável quando o ADMIN edita um usuário | regressão | sim | [user-audit-log.spec.ts:44](../tests/api/users/user-audit-log.spec.ts#L44) |
| log do sistema | deve registrar a ação com data, hora e o ADMIN responsável quando o ADMIN exclui um usuário | regressão | sim | [user-audit-log.spec.ts:44](../tests/api/users/user-audit-log.spec.ts#L44) |

### Login — SCRUM-1

| Grupo | Caso | Suíte | Crítico | Código |
|---|---|---|---|---|
| credenciais válidas | deve retornar token aceito em /auth/me quando as credenciais são válidas | smoke + regressão | sim | [login.spec.ts:13](../tests/api/auth/login.spec.ts#L13) |
| credenciais inválidas | deve recusar com a mesma mensagem quando a senha está incorreta | regressão | sim | [login.spec.ts:39](../tests/api/auth/login.spec.ts#L39) |
| credenciais inválidas | deve recusar com a mesma mensagem quando o e-mail não está cadastrado | regressão | sim | [login.spec.ts:39](../tests/api/auth/login.spec.ts#L39) |
| credenciais inválidas | deve recusar o acesso quando a senha tem 5 dígitos | regressão | sim | [login.spec.ts:50](../tests/api/auth/login.spec.ts#L50) |
| credenciais inválidas | deve recusar o acesso quando a senha tem 7 dígitos | regressão | sim | [login.spec.ts:50](../tests/api/auth/login.spec.ts#L50) |
| campos obrigatórios | deve indicar o campo obrigatório quando falta o e-mail | regressão |  | [login.spec.ts:72](../tests/api/auth/login.spec.ts#L72) |
| campos obrigatórios | deve indicar o campo obrigatório quando falta a senha | regressão |  | [login.spec.ts:72](../tests/api/auth/login.spec.ts#L72) |
| usuário inativo | deve recusar com conta inativa e sem token quando o usuário está inativo | regressão | sim | [login.spec.ts:88](../tests/api/auth/login.spec.ts#L88) |

### Paginação de medicamentos — SCRUM-33

| Grupo | Caso | Suíte | Crítico | Código |
|---|---|---|---|---|
| páginas e totais | deve devolver 2 itens, total 5, 3 páginas e não ser a última quando a primeira página tem tamanho 2 | smoke + regressão |  | [list-medications.spec.ts:36](../tests/api/medications/list-medications.spec.ts#L36) |
| páginas e totais | deve devolver o item restante e indicar a última página quando a página 2 de tamanho 2 é pedida | regressão |  | [list-medications.spec.ts:62](../tests/api/medications/list-medications.spec.ts#L62) |
| páginas e totais | deve devolver 200 com lista vazia quando a página pedida passa da última | regressão |  | [list-medications.spec.ts:82](../tests/api/medications/list-medications.spec.ts#L82) |
| páginas e totais | deve usar a página 0 e 10 itens por página quando nenhum parâmetro é enviado | regressão |  | [list-medications.spec.ts:101](../tests/api/medications/list-medications.spec.ts#L101) |
| páginas e totais | deve aceitar a listagem quando o tamanho da página é 1 | regressão |  | [list-medications.spec.ts:115](../tests/api/medications/list-medications.spec.ts#L115) |
| páginas e totais | deve aceitar a listagem quando o tamanho da página é 100 | regressão |  | [list-medications.spec.ts:115](../tests/api/medications/list-medications.spec.ts#L115) |
| ordem entre páginas | deve seguir a ordem alfabética do nome em todas as páginas quando a ordenação é a padrão | regressão |  | [list-medications.spec.ts:142](../tests/api/medications/list-medications.spec.ts#L142) |
| ordem entre páginas | deve listar cada medicamento uma única vez quando nomes iguais se espalham por várias páginas | regressão |  | [list-medications.spec.ts:158](../tests/api/medications/list-medications.spec.ts#L158) |
| busca | deve contar só os medicamentos da busca quando o termo tem outra caixa e espaços extras | regressão |  | [list-medications.spec.ts:181](../tests/api/medications/list-medications.spec.ts#L181) |
| busca | deve tratar "%" como texto quando aparece no termo da busca | regressão |  | [list-medications.spec.ts:203](../tests/api/medications/list-medications.spec.ts#L203) |
| busca | deve tratar "_" como texto quando aparece no termo da busca | regressão |  | [list-medications.spec.ts:203](../tests/api/medications/list-medications.spec.ts#L203) |
| parâmetros inválidos | deve recusar com 400 e "Paginação inválida. Use páginas de 1 a 100 itens." quando a página é negativa | regressão |  | [list-medications.spec.ts:256](../tests/api/medications/list-medications.spec.ts#L256) |
| parâmetros inválidos | deve recusar com 400 e "Paginação inválida. Use páginas de 1 a 100 itens." quando o tamanho da página é 0 | regressão |  | [list-medications.spec.ts:256](../tests/api/medications/list-medications.spec.ts#L256) |
| parâmetros inválidos | deve recusar com 400 e "Paginação inválida. Use páginas de 1 a 100 itens." quando o tamanho da página é 101 | regressão |  | [list-medications.spec.ts:256](../tests/api/medications/list-medications.spec.ts#L256) |
| parâmetros inválidos | deve recusar com 400 e "Ordenação inválida." quando o campo de ordenação não é permitido | regressão |  | [list-medications.spec.ts:256](../tests/api/medications/list-medications.spec.ts#L256) |
| parâmetros inválidos | deve recusar com 400 e "Ordenação inválida." quando a direção da ordenação não é asc nem desc | regressão |  | [list-medications.spec.ts:256](../tests/api/medications/list-medications.spec.ts#L256) |
| parâmetros inválidos | deve recusar com 400 e "Confira o formato dos dados informados." quando a página não é numérica | regressão |  | [list-medications.spec.ts:256](../tests/api/medications/list-medications.spec.ts#L256) |
| parâmetros inválidos | deve recusar com 400 e "Confira o formato dos dados informados." quando o tamanho da página é decimal | regressão |  | [list-medications.spec.ts:256](../tests/api/medications/list-medications.spec.ts#L256) |
| acesso | deve recusar com 401 quando a listagem é pedida sem token | regressão |  | [list-medications.spec.ts:274](../tests/api/medications/list-medications.spec.ts#L274) |

### Ambiente

| Grupo | Caso | Suíte | Crítico | Código |
|---|---|---|---|---|
| Disponibilidade da API | deve informar status UP quando o backend está disponível | smoke + regressão |  | [health.spec.ts:7](../tests/api/health.spec.ts#L7) |

## Interface web (UI)

### Cadastro de medicamentos — SCRUM-21

| Grupo | Caso | Suíte | Crítico | Código |
|---|---|---|---|---|
| acesso ao cadastro | deve exibir "Novo Medicamento" quando o ADMIN abre a lista | smoke + regressão | sim | [create-medication.spec.ts:11](../tests/e2e/medications/create-medication.spec.ts#L11) |
| acesso ao cadastro | não deve exibir "Novo Medicamento" quando o USER abre a lista | regressão | sim | [create-medication.spec.ts:24](../tests/e2e/medications/create-medication.spec.ts#L24) |
| formulário | deve apresentar os campos obrigatórios e as listas de opções quando o formulário abre | regressão |  | [create-medication.spec.ts:50](../tests/e2e/medications/create-medication.spec.ts#L50) |
| formulário | deve alertar e não enviar quando há campo obrigatório vazio | regressão |  | [create-medication.spec.ts:71](../tests/e2e/medications/create-medication.spec.ts#L71) |
| formulário | deve alertar e não enviar quando a dosagem é zero | regressão |  | [create-medication.spec.ts:90](../tests/e2e/medications/create-medication.spec.ts#L90) |
| salvar | deve exibir sucesso e mostrar o medicamento na lista quando todos os campos são válidos | smoke + regressão | sim | [create-medication.spec.ts:121](../tests/e2e/medications/create-medication.spec.ts#L121) |
| salvar | deve exibir "Medicamento já cadastrado." quando o medicamento já existe | regressão | sim | [create-medication.spec.ts:145](../tests/e2e/medications/create-medication.spec.ts#L145) |

### Cadastro de usuários — SCRUM-15

| Grupo | Caso | Suíte | Crítico | Código |
|---|---|---|---|---|
| formulário | deve apresentar Nome, E-mail, Senha, Confirmação de senha e Perfil obrigatórios quando o formulário abre | regressão |  | [create-user.spec.ts:16](../tests/e2e/users/create-user.spec.ts#L16) |
| formulário | deve oferecer os perfis User e Administrador quando o formulário abre | regressão |  | [create-user.spec.ts:31](../tests/e2e/users/create-user.spec.ts#L31) |
| formulário | deve exibir sucesso e mostrar o usuário na lista quando o ADMIN preenche dados válidos | smoke + regressão | sim | [create-user.spec.ts:40](../tests/e2e/users/create-user.spec.ts#L40) |
| formulário | deve alertar e não enviar quando um campo obrigatório está vazio | regressão |  | [create-user.spec.ts:58](../tests/e2e/users/create-user.spec.ts#L58) |
| formulário | deve exibir "As senhas precisam ser iguais." e não enviar quando a confirmação é diferente | regressão |  | [create-user.spec.ts:76](../tests/e2e/users/create-user.spec.ts#L76) |
| formulário | deve informar que o e-mail já está cadastrado quando o ADMIN usa um e-mail existente | regressão | sim | [create-user.spec.ts:91](../tests/e2e/users/create-user.spec.ts#L91) |

### Gestão de usuários — SCRUM-14

| Grupo | Caso | Suíte | Crítico | Código |
|---|---|---|---|---|
| acesso pelo dashboard | deve abrir a lista de usuários quando o ADMIN clica em "Usuários" no menu do dashboard | regressão | sim | [list-users.spec.ts:11](../tests/e2e/users/list-users.spec.ts#L11) |
| acesso pelo dashboard | não deve exibir o módulo Usuários quando o USER abre o dashboard | regressão | sim | [list-users.spec.ts:27](../tests/e2e/users/list-users.spec.ts#L27) |
| acesso pelo dashboard | deve exibir acesso negado quando o USER abre /usuarios pelo endereço | regressão | sim | [list-users.spec.ts:43](../tests/e2e/users/list-users.spec.ts#L43) |
| lista | deve exibir usuário, e-mail, acesso, status e os ícones de editar e excluir quando o ADMIN abre a lista | smoke + regressão | sim | [list-users.spec.ts:62](../tests/e2e/users/list-users.spec.ts#L62) |
| pesquisa na tela | deve exibir "Nenhum usuário encontrado." quando a busca não encontra usuários | regressão |  | [list-users.spec.ts:105](../tests/e2e/users/list-users.spec.ts#L105) |

### Gestão de usuários — SCRUM-16

| Grupo | Caso | Suíte | Crítico | Código |
|---|---|---|---|---|
| pesquisa na tela | deve mostrar somente o usuário correspondente quando o ADMIN pesquisa por parte do e-mail | regressão |  | [list-users.spec.ts:90](../tests/e2e/users/list-users.spec.ts#L90) |
| pesquisa na tela | deve impedir que o ADMIN exclua a si mesmo quando abre a própria linha | regressão |  | [list-users.spec.ts:117](../tests/e2e/users/list-users.spec.ts#L117) |
| edição na tela | deve abrir a edição com nome, e-mail, perfil e status do usuário quando o ADMIN clica no lápis | regressão |  | [manage-users.spec.ts:11](../tests/e2e/users/manage-users.spec.ts#L11) |
| edição na tela | deve atualizar a lista quando o ADMIN salva nome e status alterados | regressão | sim | [manage-users.spec.ts:29](../tests/e2e/users/manage-users.spec.ts#L29) |
| exclusão na tela | deve pedir confirmação e manter o usuário quando o ADMIN cancela a exclusão | regressão | sim | [manage-users.spec.ts:61](../tests/e2e/users/manage-users.spec.ts#L61) |
| exclusão na tela | deve remover o usuário da lista quando o ADMIN confirma a exclusão | regressão | sim | [manage-users.spec.ts:83](../tests/e2e/users/manage-users.spec.ts#L83) |

### Login — SCRUM-1

| Grupo | Caso | Suíte | Crítico | Código |
|---|---|---|---|---|
| tela | deve exibir a logo e o título quando o visitante abre a tela | smoke + regressão |  | [login.spec.ts:13](../tests/e2e/auth/login.spec.ts#L13) |
| tela | deve aceitar o e-mail e mascarar a senha quando o usuário digita | regressão |  | [login.spec.ts:22](../tests/e2e/auth/login.spec.ts#L22) |
| botão Entrar | deve ficar desabilitado quando os dois campos estão vazios | regressão |  | [login.spec.ts:48](../tests/e2e/auth/login.spec.ts#L48) |
| botão Entrar | deve ficar desabilitado quando só o e-mail está preenchido | regressão |  | [login.spec.ts:48](../tests/e2e/auth/login.spec.ts#L48) |
| botão Entrar | deve ficar desabilitado quando só a senha está preenchida | regressão |  | [login.spec.ts:48](../tests/e2e/auth/login.spec.ts#L48) |
| botão Entrar | deve ficar desabilitado quando a senha tem 5 caracteres | regressão |  | [login.spec.ts:48](../tests/e2e/auth/login.spec.ts#L48) |
| botão Entrar | deve ficar desabilitado quando o e-mail não tem domínio | regressão |  | [login.spec.ts:48](../tests/e2e/auth/login.spec.ts#L48) |
| botão Entrar | deve ficar habilitado quando o e-mail é válido e a senha tem 6 caracteres | regressão |  | [login.spec.ts:60](../tests/e2e/auth/login.spec.ts#L60) |
| botão Entrar | deve ficar habilitado quando o e-mail tem só o primeiro nome | regressão |  | [login.spec.ts:60](../tests/e2e/auth/login.spec.ts#L60) |
| botão Entrar | deve exibir "Entrando" quando a validação está em andamento | regressão |  | [login.spec.ts:67](../tests/e2e/auth/login.spec.ts#L67) |
| credenciais válidas | deve abrir o dashboard quando as credenciais são válidas | smoke + regressão | sim | [login.spec.ts:92](../tests/e2e/auth/login.spec.ts#L92) |
| credenciais inválidas | deve exibir erro e permanecer no login quando a senha está incorreta | regressão | sim | [login.spec.ts:117](../tests/e2e/auth/login.spec.ts#L117) |
| credenciais inválidas | deve exibir erro e permanecer no login quando o e-mail não está cadastrado | regressão | sim | [login.spec.ts:117](../tests/e2e/auth/login.spec.ts#L117) |
| credenciais inválidas | deve exibir erro e permanecer no login quando o e-mail tem só o primeiro nome | regressão | sim | [login.spec.ts:117](../tests/e2e/auth/login.spec.ts#L117) |
| usuário inativo | deve informar que a conta está inativa e permanecer no login quando o usuário está inativo | regressão | sim | [login.spec.ts:136](../tests/e2e/auth/login.spec.ts#L136) |

### Paginação de medicamentos — SCRUM-33

| Grupo | Caso | Suíte | Crítico | Código |
|---|---|---|---|---|
| navegação | deve mostrar 10 medicamentos, o total e a página 1 destacada quando a lista abre com 12 resultados | smoke + regressão |  | [list-medications.spec.ts:16](../tests/e2e/medications/list-medications.spec.ts#L16) |
| navegação | deve mostrar a página seguinte e voltar à anterior quando uso Próxima e Anterior | regressão |  | [list-medications.spec.ts:32](../tests/e2e/medications/list-medications.spec.ts#L32) |
| navegação | deve desabilitar Anterior na primeira página e Próxima na última quando há 2 páginas | regressão |  | [list-medications.spec.ts:53](../tests/e2e/medications/list-medications.spec.ts#L53) |
| navegação | deve ir à página clicada e mostrar só a primeira, a vizinha e a última quando há 5 páginas | regressão |  | [list-medications.spec.ts:73](../tests/e2e/medications/list-medications.spec.ts#L73) |
| mudança de filtro | deve voltar à página 1 e mostrar os 12 itens quando mudo para 20 itens por página | regressão |  | [list-medications.spec.ts:104](../tests/e2e/medications/list-medications.spec.ts#L104) |
| mudança de filtro | deve voltar à página 1 e atualizar o total quando a busca muda estando na página 2 | regressão |  | [list-medications.spec.ts:121](../tests/e2e/medications/list-medications.spec.ts#L121) |
| estados da lista | deve mostrar "Nenhum medicamento encontrado.", 0 resultados e a navegação desabilitada quando a busca não encontra nada | regressão |  | [list-medications.spec.ts:149](../tests/e2e/medications/list-medications.spec.ts#L149) |
| estados da lista | deve mostrar a mensagem de erro da API quando a listagem falha | regressão |  | [list-medications.spec.ts:161](../tests/e2e/medications/list-medications.spec.ts#L161) |

### Ambiente

| Grupo | Caso | Suíte | Crítico | Código |
|---|---|---|---|---|
| Disponibilidade da aplicação | deve exibir a tela de acesso quando o visitante abre /login | smoke + regressão |  | [app-shell.spec.ts:7](../tests/e2e/app-shell.spec.ts#L7) |

## Desempenho (k6)

Nenhum caso implementado.
