# Performance targets

O time não tem meta. Estas são metas **provisórias do QA**, a calibrar com o primeiro baseline; não são SLO do produto.

| Métrica | Meta | Origem |
|---|---|---|
| LCP / INP / CLS (p75) | até 2,5 s / 200 ms / 0,1 | Core Web Vitals, web.dev |
| Erros HTTP | abaixo de 1% | valor de exemplo da documentação do k6 |
| API de leitura, p95 | abaixo de 500 ms | escolha do QA, dentro do limite de 1 s da Nielsen Norman |
| Login, p95 | abaixo de 1 s | escolha do QA: hash de senha custa CPU; limite de 1 s da Nielsen Norman |
| Escrita, p95 | abaixo de 800 ms | escolha do QA |

- Perfil inicial: smoke com 2 VUs por 30 s; load com 20 VUs por 5 min. É hipótese: não há dado de uso real.
- Web Vitals são medidos em campo; em laboratório servem como tendência (INP exige interação).
- Estouro na CI é alerta até haver 5 baselines estáveis. Depois, propor gate e aguardar OK.
