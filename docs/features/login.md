# Login — SCRUM-1
Risco: Alto | Base: critérios da SCRUM-1 e respostas do responsável em 2026-11-25 (botão, e-mail) | Oráculo: critérios; 423 para inativo é proposta, a confirmar | Técnicas: partição e valor limite (senha 5, 6 e 7)

| OK | Comportamento esperado | Técnica | Onde | Suíte/CI |
|---|---|---|---|---|
| [x] | Deve exibir a logo e o título quando o visitante abre a tela | Partição | UI | smoke/PR |
| [x] | Deve aceitar o e-mail e mascarar a senha quando o usuário digita | Partição | UI | regression/noturno |
| [x] | Deve ficar desabilitado quando: os dois campos estão vazios; só o e-mail; só a senha; senha com 5 caracteres; e-mail sem domínio | Partição e limite | UI (5) | regression/noturno |
| [x] | Deve ficar habilitado quando: e-mail válido e senha com 6 caracteres; e-mail só com o primeiro nome | Limite | UI (2) | regression/noturno |
| [x] | Deve exibir "Entrando" quando a validação está em andamento | Estados | UI | regression/noturno |
| [x] | Deve abrir o dashboard quando as credenciais são válidas | Partição | UI | smoke/PR |
| [x] | Deve exibir erro e permanecer no login quando: a senha está incorreta; o e-mail não está cadastrado; o e-mail tem só o primeiro nome | Partição | UI (3) | regression/noturno |
| [ ] | Deve exibir mensagem e permanecer no login quando o usuário está inativo | Estados | UI | regression/noturno — **falha** |
| [x] | Deve retornar token aceito em /auth/me quando as credenciais são válidas | Partição | API | smoke/PR |
| [x] | Deve recusar com a mesma mensagem quando: a senha está incorreta; o e-mail não está cadastrado | Partição | API (2) | regression/noturno |
| [x] | Deve recusar o acesso quando a senha tem 5 ou 7 dígitos | Limite | API (2) | regression/noturno |
| [x] | Deve indicar o campo obrigatório quando falta o e-mail ou a senha | Partição | API (2) | regression/noturno |
| [ ] | Deve recusar com conta inativa e sem token quando o usuário está inativo | Estados | API | regression/noturno — **falha** |

Fora do escopo: cadastro, recuperação de senha e auditoria (história); carga (k6, depois).
Exploratório: não realizado.
Riscos restantes / dúvidas: mensagem do usuário inativo; senha com mais de 6 caracteres na tela; tecla Enter; Firefox e WebKit.
Veredito: BLOQUEADO — 2026-11-25, backend `a86f0b5`, frontend `53158c9`; ver `../test-runs/2026-11-25-scrum-1-login.md`
