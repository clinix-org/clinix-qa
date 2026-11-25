// Lê o resultado do Playwright e gera o resumo e o cartão do README.
// Uso: node scripts/results.mjs summary | card <pasta>
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const file = 'test-results/results.json';
const [mode, outDir] = process.argv.slice(2);
const types = [
  { project: 'api', label: 'API' },
  { project: 'e2e', label: 'Interface web (UI)' },
];
const empty = () => ({ total: 0, passed: 0, failed: 0, error: 0, blocked: 0 });

function classify(test) {
  if (test.status === 'skipped') return 'blocked';
  if (test.status !== 'unexpected') return 'passed';
  const last = test.results.at(-1);
  const messages = (last?.errors ?? []).map((e) => e.message ?? '').join('\n');
  // Verificação reprovada cita expect(); o resto é falha de ambiente, massa ou código.
  return messages.replace(/\u001b\[[0-9;]*m/g, '').includes('expect(') ? 'failed' : 'error';
}

function collect(suites, path = []) {
  return suites.flatMap((suite) => [
    ...(suite.specs ?? []).flatMap((spec) =>
      spec.tests.map((t) => ({
        project: t.projectName,
        result: classify(t),
        title: [...path, spec.title].join(' › '),
      })),
    ),
    ...(suite.suites ?? []).flatMap((child) => collect([child], [...path, child.title])),
  ]);
}

if (!existsSync(file)) {
  if (mode === 'card') throw new Error('Sem resultados: o cartão não será publicado.');
  console.log('## Resultado\n\nOs testes não chegaram a executar.');
  process.exit(0);
}

const tests = collect(JSON.parse(readFileSync(file, 'utf8')).suites);
const rows = types.map(({ project, label }) => {
  const count = empty();
  for (const t of tests.filter((x) => x.project === project)) {
    count.total += 1;
    count[t.result] += 1;
  }
  return { label, ...count };
});
const sum = rows.reduce((acc, row) => {
  for (const key of Object.keys(acc)) acc[key] += row[key];
  return acc;
}, empty());
const setupOk = tests.filter((t) => t.project === 'setup').every((t) => t.result === 'passed');
const ok = sum.total > 0 && sum.passed === sum.total && setupOk;
const rate = (r) => (r.total ? `${Math.floor((100 * r.passed) / r.total)}%` : '–');

if (mode === 'summary') {
  console.log(`## ${ok ? '✅ Passou' : '❌ Falhou'}\n`);
  console.log('| Tipo | Total | Aprovados | Reprovados | Erros | Bloqueados | Sucesso |');
  console.log('|---|---|---|---|---|---|---|');
  for (const r of [...rows, { label: '**Total**', ...sum }]) {
    console.log(
      `| ${r.label} | ${r.total} | ${r.passed} | ${r.failed} | ${r.error} | ${r.blocked} | ${rate(r)} |`,
    );
  }
  const bad = tests.filter((t) => t.result === 'failed' || t.result === 'error');
  if (bad.length) console.log(['\n### Falhas', ...bad.map((t) => `- ${t.title}`)].join('\n'));
} else if (mode === 'card') {
  const { BACKEND_SHA = '?', FRONTEND_SHA = '?', QA_SHA = '?', DATABASE = '?' } = process.env;
  const when = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date());
  const escape = (v) =>
    String(v).replace(
      /[&<>"]/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
    );
  const columns = [
    ['total', 'Total', 330, 'ink'],
    ['passed', 'Aprovados', 435, 'good'],
    ['failed', 'Reprovados', 545, 'bad'],
    ['error', 'Erros', 640, 'warn'],
    ['blocked', 'Bloqueados', 735, 'mute'],
  ];
  const text = (x, y, value, cls, anchor = 'middle') =>
    `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}">${escape(value)}</text>`;
  const line = (y) => `<line x1="24" x2="876" y1="${y}" y2="${y}" class="rule"/>`;
  const cells = (row, y, weight) =>
    columns
      .map(([key, , x, cls]) => text(x, y, row[key], `${weight} ${row[key] ? cls : 'mute'}`))
      .join('') + text(840, y, rate(row), `${weight} ink`);
  const barWidth = sum.total ? (852 * sum.passed) / sum.total : 0;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 350" width="900" height="350" role="img" aria-label="${escape(`${sum.passed} de ${sum.total} testes aprovados, ${sum.failed} reprovados, ${sum.error} erros, ${sum.blocked} bloqueados`)}">
<style>
text{font:14px -apple-system,"Segoe UI",Helvetica,Arial,sans-serif}
.title{font-size:19px;font-weight:600}.b{font-weight:600}.head{font-size:12px}
.bg{fill:#fff;stroke:#d1d9e0}.rule{stroke:#d1d9e0}.track{fill:#cf222e}.none{fill:#d1d9e0}
.ink,.title{fill:#1f2328}.mute,.head{fill:#59636e}.good{fill:#1a7f37}.bad{fill:#cf222e}.warn{fill:#9a6700}
@media(prefers-color-scheme:dark){.bg{fill:#0d1117;stroke:#3d444d}.rule{stroke:#3d444d}.track{fill:#f85149}.none{fill:#3d444d}
.ink,.title{fill:#f0f6fc}.mute,.head{fill:#9198a1}.good{fill:#3fb950}.bad{fill:#f85149}.warn{fill:#d29922}}
</style>
<rect x=".5" y=".5" width="899" height="349" rx="10" class="bg"/>
${text(24, 42, `${sum.passed} de ${sum.total} testes aprovados`, 'title', 'start')}
${text(876, 42, ok ? '● Aprovado' : '● Reprovado', `b ${ok ? 'good' : 'bad'}`, 'end')}
<rect x="24" y="60" width="852" height="8" rx="4" class="${sum.total ? 'track' : 'none'}"/>
<rect x="24" y="60" width="${barWidth.toFixed(1)}" height="8" rx="4" class="good"/>
${text(24, 108, 'Tipo', 'head', 'start')}${columns.map(([, label, x]) => text(x, 108, label, 'head')).join('')}${text(840, 108, 'Sucesso', 'head')}
${line(122)}
${rows.map((r, i) => text(24, 150 + i * 42, r.label, 'b ink', 'start') + cells(r, 150 + i * 42, '') + line(164 + i * 42)).join('\n')}
${text(24, 234, 'Desempenho (k6)', 'b ink', 'start')}${columns.map(([, , x]) => text(x, 234, '–', 'mute')).join('')}${text(840, 234, 'Planejado', 'mute')}
${line(248)}
${text(24, 276, 'Total', 'b ink', 'start')}${cells(sum, 276, 'b')}
${line(296)}
${text(24, 324, `${when} (Brasília) · ${DATABASE} · backend ${BACKEND_SHA} · frontend ${FRONTEND_SHA} · qa ${QA_SHA}`, 'head', 'start')}
</svg>
`;
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'results.svg'), svg);
  writeFileSync(
    join(outDir, 'results.json'),
    `${JSON.stringify({ when: new Date().toISOString(), ok, total: sum, types: rows, database: DATABASE, backend: BACKEND_SHA, frontend: FRONTEND_SHA, qa: QA_SHA }, null, 2)}\n`,
  );
} else {
  throw new Error('Informe summary ou card <pasta>.');
}
