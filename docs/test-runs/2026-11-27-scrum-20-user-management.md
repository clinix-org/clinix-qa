# SCRUM-15, SCRUM-14, SCRUM-16 — Gestão de usuários (épico SCRUM-20) — 2026-11-27

Veredito proposto: BLOQUEADO — e-mail duplicado sem mensagem na tela (critério de aceite da SCRUM-15, Qase CLINIX-7)
Responsável: responsável pelo QA
Motivo da execução: história e reteste no mesmo dia, após as decisões do responsável
Ambiente: PostgreSQL 18 em Docker local (containers do projeto na `develop`, tela 8091) e H2 em memória (cópia local da API, suíte de API), Chromium do Playwright 1.65.1
Backend: develop @ 7522778 | Frontend: develop @ ef2ad24 | QA: test/user-management (a partir de develop @ 83ae151, ainda sem commit)

## Primeira execução (critérios como escritos nas histórias)
| Tipo | Executados | Passou | Falhou | Não executado |
|---|---|---|---|---|
| API — gestão de usuários (PostgreSQL) | 35 | 34 | 1 | 0 |
| UI — gestão de usuários (PostgreSQL, tela 8091) | 17 | 12 | 5 | 0 |
| API — suíte completa (H2, inclui o setup) | 85 | 83 | 2 | 0 |
| Suíte completa (PostgreSQL, tela 8091, inclui o setup) | 133 | 125 | 8 | 0 |

Falharam 6 testes, registrados no Qase como CLINIX-5 a CLINIX-10: exclusão física (API e tela), e-mail duplicado sem mensagem, sem "Gestão de usuários" no dashboard, perfil "User" em vez de "Colaborador" e "Nenhum usuario encontrado." sem acento. Qase: execuções 7 (API, 34/35) e 8 (UI, 12/17).

## Decisões do responsável (2026-11-27)
- Excluir remove o usuário de verdade; para tirar o acesso sem apagar, edita-se o status para Inativo. CLINIX-5 e CLINIX-6 marcados como inválidos.
- O acesso pelo dashboard é o menu "Usuários" (só para ADMIN). CLINIX-8 inválido.
- O perfil colaborador se chama "User". CLINIX-9 inválido.
- Acento em "Nenhum usuario encontrado." não é defeito; o responsável trata o texto direto com o DEV. CLINIX-10 inválido; o teste aceita com ou sem acento.
As histórias SCRUM-14, SCRUM-15 e SCRUM-16 ainda trazem o texto antigo; a atualização está com o PO.

## Reteste (após as decisões)
| Tipo | Executados | Passou | Falhou | Não executado |
|---|---|---|---|---|
| API — gestão de usuários (PostgreSQL) | 35 | 35 | 0 | 0 |
| UI — gestão de usuários (PostgreSQL, tela 8091) | 17 | 16 | 1 | 0 |
| Suíte completa (PostgreSQL, tela 8091, inclui o setup) | 133 | 130 | 3 | 0 |
| Manual/exploratório | 0 | 0 | 0 | 0 |

A suíte completa deu o mesmo resultado nas 3 rodadas seguidas (130/133). As 3 falhas são defeitos conhecidos e marcados: CLINIX-7 (e-mail duplicado sem mensagem) e os 2 testes do login de usuário inativo (CLINIX-1, SCRUM-1).
Prova de falha: na primeira execução, cópias temporárias do backend (11 alterações) e do frontend (10); no reteste, backend com a exclusão trocada por inativação, que reprovou o novo teste de exclusão (detalhes no checklist).
Qase: execuções 9 (API, 35/35) e 10 (UI, 16/17). O `qase_ci_report` voltou a responder sucesso sem gravar os resultados; foram gravados com `qase_result_record` e conferidos na releitura.
Checklist: `../features/users.md` | Catálogo: `../test-catalog.md`
Defeitos (Qase): CLINIX-7 aberto (major). CLINIX-5, 6, 8, 9 e 10 inválidos por decisão do responsável.
Não testado e por quê: log do sistema (`system_logs`), sem tela ou API para ler (decisão pendente); cores do status (checagem visual manual); UI em H2 (a tela 8091 usa o backend do container); exploratório; Firefox/WebKit; carga (k6, só a pedido)
Riscos restantes: histórias desatualizadas em relação às decisões; regra do log sem verificação ponta a ponta; e-mail de usuário excluído permanece no texto do log (LGPD, para o PO avaliar); autodesativação do ADMIN sem regra escrita
Evidência: execução local, `BASE_URL=http://localhost:8091 npx playwright test` (3 vezes em cada etapa) e `API_URL=<API em H2> npx playwright test --project=api`
