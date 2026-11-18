// npm run publicar
//
// Gera o site e envia para o GitHub Pages (branch gh-pages):
//   https://garciaa43.github.io/fritsche-photos/
// A branch gh-pages é refeita do zero a cada publicação (só guarda o site
// pronto), então o repositório não cresce com o histórico das fotos.
import { spawnSync } from 'node:child_process';
import { copyFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = path.join(raiz, 'dist', 'fritsche-photos', 'browser');

function rodar(cmd, args, cwd = raiz) {
  const r = spawnSync(cmd, args, { cwd, stdio: 'inherit' });
  if (r.status !== 0) { console.error(`\nFalhou: ${cmd} ${args.join(' ')}`); process.exit(r.status ?? 1); }
}
const ler = args => spawnSync('git', args, { cwd: raiz, encoding: 'utf8' }).stdout.trim();

const remoto = ler(['remote', 'get-url', 'origin']);
const versao = ler(['rev-parse', '--short', 'HEAD']);
if (ler(['status', '--porcelain', '--', 'src', 'public', 'scripts'])) {
  console.warn('Aviso: há alterações não commitadas. Elas serão publicadas mesmo assim.\n');
}

console.log('1/3 Gerando o site...');
rodar(process.execPath, [path.join(raiz, 'node_modules', '@angular', 'cli', 'bin', 'ng.js'), 'build', '--base-href', '/fritsche-photos/']);
await copyFile(path.join(site, 'index.html'), path.join(site, '404.html')); // abre /fotos etc. direto
await writeFile(path.join(site, '.nojekyll'), '');

console.log('\n2/3 Preparando a publicação...');
rodar('git', ['init', '-q', '-b', 'gh-pages'], site);
rodar('git', ['add', '-A'], site);
rodar('git', ['commit', '-q', '-m', `Publica site (main ${versao})`], site);

console.log(`\n3/3 Enviando para ${remoto} (gh-pages)...`);
rodar('git', ['push', '--force', remoto, 'gh-pages'], site);
console.log('\nPronto! Em 1 ou 2 minutos: https://garciaa43.github.io/fritsche-photos/');
