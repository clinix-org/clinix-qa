// Gera docs/test-catalog.md a partir do código: Playwright (API e UI) e scripts k6.
// Uso: node scripts/catalog.mjs          grava o catálogo
//      node scripts/catalog.mjs --check  falha se o catálogo estiver desatualizado (CI)
//      node scripts/catalog.mjs --json   imprime os casos em JSON (sincronização com o Qase)
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const OUT = 'docs/test-catalog.md';
const PERF_DIR = 'performance';
const TYPES = [
  { key: 'api', label: 'API' },
  { key: 'e2e', label: 'Interface web (UI)' },
  { key: 'k6', label: 'Desempenho (k6)' },
];

function listPlaywright() {
  // --list só lê os arquivos; nenhum teste executa nem acessa rede. Os valores abaixo
  // existem apenas para satisfazer as travas de src/config/env.ts durante a leitura.
  const stdout = execFileSync('npx', ['playwright', 'test', '--list', '--reporter=json'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    env: {
      ...process.env,
      BASE_URL: 'http://localhost:1',
      API_URL: 'http://localhost:1',
      QA_LOCAL_DB_CONFIRMED: 'true',
    },
  });
  const cases = [];
  const walk = (suite, groups) => {
    for (const spec of suite.specs ?? []) {
      for (const t of spec.tests) {
        if (t.projectName === 'setup') continue;
        const note = (type) => t.annotations.find((a) => a.type === type)?.description;
        cases.push({
          type: t.projectName,
          story: note('story') ?? null,
          feature: groups[0]?.split(' › ')[0] ?? '',
          group: groups.join(' › '),
          title: spec.title,
          tags: spec.tags,
          file: `tests/${spec.file}`,
          line: spec.line,
          environment: note('feature') === 'ambiente',
        });
      }
    }
    for (const child of suite.suites ?? []) {
      const isFile = child.title === child.file;
      walk(child, isFile ? groups : [...groups, child.title]);
    }
  };
  for (const suite of JSON.parse(stdout).suites) walk(suite, []);
  return cases;
}

// Cabeçalho dos scripts k6:  // story: SCRUM-xx  |  // feature: Login  |  // case: deve ... quando ...
function listK6() {
  if (!existsSync(PERF_DIR)) return [];
  const files = readdirSync(PERF_DIR, { recursive: true })
    .map(String)
    .filter((f) => /\.(js|ts)$/.test(f) && !f.split(/[\\/]/).includes('lib'))
    .sort();
  return files.flatMap((f) => {
    const file = join(PERF_DIR, f);
    const lines = readFileSync(file, 'utf8').split('\n');
    const header = (key) =>
      lines.map((l) => l.match(new RegExp(`^//\\s*${key}:\\s*(.+)$`))?.[1].trim()).filter(Boolean);
    return header('case').map((title) => ({
      type: 'k6',
      story: header('story')[0] ?? null,
      feature: header('feature')[0] ?? f,
      group: header('feature')[0] ?? f,
      title,
      tags: ['performance'],
      file,
      line: lines.findIndex((l) => l.includes(title)) + 1,
      environment: false,
    }));
  });
}

const cell = (v) => String(v).replace(/\|/g, '\\|');
const suiteOf = (c) => (c.tags.includes('smoke') ? 'smoke + regressão' : 'regressão');

function render(cases) {
  const count = (list) => ({
    total: list.length,
    smoke: list.filter((c) => c.tags.includes('smoke')).length,
    critical: list.filter((c) => c.tags.includes('critical')).length,
  });
  const out = [
    '# Catálogo de testes automatizados',
    '',
    '> Gerado por `npm run docs:catalog` a partir do código. Não edite à mão: altere o teste e gere de novo.',
    '> Resultado das execuções: `test-runs/`. Plano: `test-plan.md`. Checklist por funcionalidade: `features/`.',
    '',
    '| Tipo | Casos | Smoke (PR) | Críticos |',
    '|---|---|---|---|',
  ];
  for (const { key, label } of TYPES) {
    const n = count(cases.filter((c) => c.type === key));
    out.push(`| ${label} | ${n.total} | ${n.smoke} | ${n.critical} |`);
  }
  const all = count(cases);
  out.push(`| **Total** | **${all.total}** | **${all.smoke}** | **${all.critical}** |`);

  for (const { key, label } of TYPES) {
    const list = cases.filter((c) => c.type === key);
    out.push('', `## ${label}`, '');
    if (!list.length) {
      out.push('Nenhum caso implementado.');
      continue;
    }
    const sections = new Map();
    for (const c of list) {
      const name = c.environment ? 'Ambiente' : c.story ? `${c.feature} — ${c.story}` : c.feature;
      if (!sections.has(name)) sections.set(name, []);
      sections.get(name).push(c);
    }
    const names = [...sections.keys()].sort((a, b) =>
      a === 'Ambiente' ? 1 : b === 'Ambiente' ? -1 : a.localeCompare(b, 'pt-BR'),
    );
    for (const name of names) {
      out.push(
        `### ${name}`,
        '',
        '| Grupo | Caso | Suíte | Crítico | Código |',
        '|---|---|---|---|---|',
      );
      for (const c of sections.get(name)) {
        const group =
          c.group
            .split(' › ')
            .slice(c.environment ? 0 : 1)
            .join(' › ') || c.group;
        const link = `[${c.file.split('/').at(-1)}:${c.line}](${relative('docs', c.file)}#L${c.line})`;
        const critical = c.tags.includes('critical') ? 'sim' : '';
        out.push(`| ${cell(group)} | ${cell(c.title)} | ${suiteOf(c)} | ${critical} | ${link} |`);
      }
      out.push('');
    }
    out.pop();
  }
  return `${out.join('\n')}\n`;
}

const cases = [...listPlaywright(), ...listK6()];
const mode = process.argv[2];

if (mode === '--json') {
  console.log(JSON.stringify(cases, null, 2));
} else if (mode === '--check') {
  const current = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
  if (current !== render(cases)) {
    console.error(
      `${OUT} está desatualizado. Rode "npm run docs:catalog" e inclua o arquivo no commit.`,
    );
    process.exit(1);
  }
  console.log(`${OUT} em dia (${cases.length} casos).`);
} else if (!mode) {
  writeFileSync(OUT, render(cases));
  console.log(`${OUT} gerado (${cases.length} casos).`);
} else {
  throw new Error('Use sem argumento, --check ou --json.');
}
