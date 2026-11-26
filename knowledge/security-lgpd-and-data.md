# Security, LGPD and test data

- Banco local do projeto: H2 em memória ou PostgreSQL em Docker (ver `environments-and-test-data.md`). Antes de executar, confirmar que o alvo é localhost/rede do Compose; se não for, abortar.
- Cada teste cria dados próprios com prefixo `qa.` e sufixo único; remove no teardown o que criou.
- E-mails sintéticos `qa.<id>@clinix.com`: nunca enviar mensagem a eles. Nunca gerar CPF/CRM/telefone que possa ser de pessoa real.
- Faker sempre com seed registrada. Relógio controlado quando a data importar.
- O ADMIN vem do bootstrap do ambiente local; na CI, credencial gerada para a execução.
- Trace, vídeo e log podem conter senha e token: mascarar headers e usar contas descartáveis.

## Minimum security coverage
- [ ] Sem token, token malformado, expirado e adulterado
- [ ] USER em operação de ADMIN; usuário desativado com token ainda válido
- [ ] Resposta não expõe senha/hash, stack trace ou detalhe de banco
- [ ] CORS recusa origem não permitida
- [ ] Entradas maliciosas (XSS/injeção) tratadas como texto

Força bruta, DoS, varredura ativa ou ataque fora do localhost: somente com OK escrito e escopo definido.
Vulnerabilidade: avisar em privado. **Os repositórios do projeto são públicos**; não abrir issue pública.
