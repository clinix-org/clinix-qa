// Resume o junit.xml em Markdown para a página da execução.
import { existsSync, readFileSync } from 'node:fs';

const file = 'test-results/junit.xml';
if (!existsSync(file)) {
  console.log('## Resultado\n\nOs testes não chegaram a executar.');
} else {
  const xml = readFileSync(file, 'utf8');
  const root = xml.match(/<testsuites[^>]*>/)?.[0] ?? '';
  const read = (name) => Number(root.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] ?? 0);
  const [total, failed, skipped] = [
    read('tests'),
    read('failures') + read('errors'),
    read('skipped'),
  ];
  const failures = [
    ...xml.matchAll(/<testcase name="([^"]*)"[^>]*>(?:(?!<\/testcase>)[\s\S])*?<failure/g),
  ];

  console.log(`## ${failed ? '❌ Falhou' : '✅ Passou'}\n`);
  console.log('| Total | Passou | Falhou | Não executado |\n|---|---|---|---|');
  console.log(`| ${total} | ${total - failed - skipped} | ${failed} | ${skipped} |\n`);
  if (failures.length) console.log(['### Falhas', ...failures.map((f) => `- ${f[1]}`)].join('\n'));
}
