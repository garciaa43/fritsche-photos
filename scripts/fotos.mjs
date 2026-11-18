// npm run fotos
//
// Lê os originais (fora do projeto), gera as versões para a web em public/fotos/
// e monta a lista de álbuns em src/app/data/albuns.generated.ts.
//
// Pasta dos originais (padrão: ../fritsche-originais, ao lado do projeto):
//   fritsche-originais/
//     01 — Trackside — 2025-05-10/      <- número (ordem), nome e data opcionais
//       foto1.jpg ...
//     Casamento Ana e João/             <- sem número também funciona
//
// Só processa fotos novas ou alteradas. Fotos repetidas (a mesma imagem
// exportada duas vezes) entram uma vez só. Para usar outra pasta:
//   npm run fotos -- "D:\Fotos do Fritz"
import { readdir, readFile, writeFile, mkdir, stat, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGINAIS = path.resolve(process.argv[2] ?? process.env.FOTOS_ORIGINAIS ?? path.join(raiz, '..', 'fritsche-originais'));
const SAIDA = path.join(raiz, 'public', 'fotos');
const CACHE = path.join(raiz, 'scripts', 'fotos-cache.json');
const DESTINO_TS = path.join(raiz, 'src', 'app', 'data', 'albuns.generated.ts');
const EXTENSOES = /\.(jpe?g|png)$/i;

const slug = texto => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'foto';

// "11 — Baile do DJ LZ — 2025-03-16" -> ordem 11, título "Baile do DJ LZ", data 2025-03-16
function lerPasta(nome) {
  const data = /(\d{4}-\d{2}-\d{2})/.exec(nome)?.[1] ?? '';
  const numero = /^(\d+)/.exec(nome)?.[1];
  const titulo = nome.replace(/^\d+/, '').replace(data, '').replace(/[-—–_\s]+$/g, '')
    .replace(/^[-—–_\s]+/g, '').replace(/\s*[—–]\s*[—–]\s*/g, ' — ').trim() || nome;
  return { ordem: numero ? Number(numero) : Infinity, titulo, data, slug: slug(nome) };
}

// Impressão digital da imagem em si, sem os metadados: pula os segmentos do
// JPEG (o EXIF pode ter uma miniatura própria) até o início dos dados da foto.
async function impressaoDigital(arquivo) {
  const dados = await readFile(arquivo);
  let inicio = 0;
  if (dados[0] === 0xFF && dados[1] === 0xD8) {
    let i = 2;
    while (i + 4 <= dados.length && dados[i] === 0xFF) {
      if (dados[i + 1] === 0xDA) { inicio = i; break; }
      i += 2 + dados.readUInt16BE(i + 2);
    }
  }
  return createHash('sha1').update(dados.subarray(inicio)).digest('hex');
}

async function listarFotos(dir) {
  const resultado = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue;
    const caminho = path.join(dir, e.name);
    if (e.isDirectory()) resultado.push(...await listarFotos(caminho));
    else if (EXTENSOES.test(e.name)) resultado.push(caminho);
  }
  return resultado.sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }));
}

function redimensionar(trabalhos) {
  return new Promise(async (resolver, rejeitar) => {
    const lista = path.join(tmpdir(), `fritsche-fotos-${process.pid}.txt`);
    await writeFile(lista, trabalhos.map(t => [t.origem, t.grande, t.mini].join('|')).join('\r\n'), 'utf8');
    const ps = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File',
      path.join(raiz, 'scripts', 'redimensionar.ps1'), '-Lista', lista], { windowsHide: true });
    let resto = '', feitos = 0;
    ps.stdout.setEncoding('utf8');
    ps.stdout.on('data', pedaco => {
      const linhas = (resto + pedaco).split(/\r?\n/); resto = linhas.pop();
      for (const linha of linhas) {
        const [status, n, a, b] = linha.split('|');
        const t = trabalhos[Number(n)];
        if (!t) continue;
        feitos++;
        if (status === 'ok') { t.largura = Number(a); t.altura = Number(b); }
        else t.erro = a;
        process.stdout.write(`\r  ${feitos}/${trabalhos.length} fotos processadas`);
      }
    });
    ps.stderr.on('data', d => process.stderr.write(d));
    ps.on('error', rejeitar);
    ps.on('close', async () => { process.stdout.write('\n'); await rm(lista, { force: true }); resolver(); });
  });
}

async function arquivosEm(dir) {
  if (!existsSync(dir)) return [];
  const saida = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const caminho = path.join(dir, e.name);
    if (e.isDirectory()) saida.push(...await arquivosEm(caminho)); else saida.push(caminho);
  }
  return saida;
}

// ---------------------------------------------------------------------------
if (!existsSync(ORIGINAIS)) {
  console.error(`Pasta de originais não encontrada: ${ORIGINAIS}`);
  console.error('Crie a pasta com uma subpasta por álbum, ou informe outra: npm run fotos -- "C:\\caminho"');
  process.exit(1);
}
console.log(`Originais: ${ORIGINAIS}`);

const cache = existsSync(CACHE) ? JSON.parse(await readFile(CACHE, 'utf8')) : {};
const novoCache = {};
const pastas = (await readdir(ORIGINAIS, { withFileTypes: true }))
  .filter(e => e.isDirectory() && !e.name.startsWith('.'))
  .map(e => ({ nome: e.name, ...lerPasta(e.name) }))
  .sort((a, b) => a.ordem - b.ordem || a.titulo.localeCompare(b.titulo, 'pt-BR'));

const albuns = [], trabalhos = [], repetidas = [], usados = new Set();
for (const pasta of pastas) {
  const vistas = new Map(), nomesUsados = new Set(), fotos = [];
  for (const origem of await listarFotos(path.join(ORIGINAIS, pasta.nome))) {
    const chave = path.relative(ORIGINAIS, origem).split(path.sep).join('/');
    const info = await stat(origem);
    const antigo = cache[chave];
    const igual = antigo && antigo.tamanho === info.size && antigo.modificado === Math.round(info.mtimeMs);
    const digital = igual ? antigo.digital : await impressaoDigital(origem);
    if (vistas.has(digital)) { repetidas.push(`${chave}  =  ${vistas.get(digital)}`); continue; }
    vistas.set(digital, chave);

    let base = slug(path.parse(origem).name), n = 2;
    while (nomesUsados.has(base)) base = `${slug(path.parse(origem).name)}-${n++}`;
    nomesUsados.add(base);
    const rel = `${pasta.slug}/${base}`;
    const foto = { origem, chave, rel, grande: path.join(SAIDA, pasta.slug, `${base}-g.jpg`),
      mini: path.join(SAIDA, pasta.slug, `${base}-p.jpg`), tamanho: info.size,
      modificado: Math.round(info.mtimeMs), digital, arquivo: path.basename(origem) };
    usados.add(foto.grande); usados.add(foto.mini);
    if (igual && antigo.rel === rel && existsSync(foto.grande) && existsSync(foto.mini)) {
      foto.largura = antigo.largura; foto.altura = antigo.altura;
    } else trabalhos.push(foto);
    fotos.push(foto);
  }
  if (fotos.length) albuns.push({ ...pasta, fotos });
}

console.log(`${albuns.length} álbuns, ${albuns.reduce((s, a) => s + a.fotos.length, 0)} fotos. Novas ou alteradas: ${trabalhos.length}.`);
if (trabalhos.length) await redimensionar(trabalhos);
const erros = trabalhos.filter(t => t.erro || !t.largura);
for (const e of erros) console.warn(`  ERRO em ${e.chave}: ${e.erro ?? 'sem resposta'}`);

// Remove versões web de fotos que saíram dos originais.
let removidas = 0;
for (const arquivo of await arquivosEm(SAIDA)) {
  if (!usados.has(arquivo)) { await rm(arquivo); removidas++; }
}

const dados = albuns.map(album => {
  const fotos = album.fotos.filter(f => f.largura).map((f, i) => {
    novoCache[f.chave] = { tamanho: f.tamanho, modificado: f.modificado, digital: f.digital,
      rel: f.rel, largura: f.largura, altura: f.altura };
    return { src: `fotos/${f.rel}-g.jpg`, mini: `fotos/${f.rel}-p.jpg`, arquivo: f.arquivo,
      largura: f.largura, altura: f.altura, alt: `${album.titulo} — foto ${i + 1}` };
  });
  return { id: album.slug, slug: album.slug, titulo: album.titulo, categoria: album.titulo,
    data: album.data, local: 'Lorem ipsum',
    descricao: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae nibh at nunc consequat viverra.',
    capa: fotos[0]?.mini ?? '', fotos };
}).filter(a => a.fotos.length);

await mkdir(path.dirname(DESTINO_TS), { recursive: true });
await writeFile(DESTINO_TS, `// Gerado por "npm run fotos" (scripts/fotos.mjs). Não edite à mão:\n` +
  `// textos dos álbuns ficam em conteudo.ts.\nimport type { Album } from './modelos';\n` +
  `export const ALBUNS_GERADOS: Album[] = [\n${dados.map(a => '  ' + JSON.stringify(a)).join(',\n')}\n];\n`);
await writeFile(CACHE, JSON.stringify(novoCache, null, 1) + '\n');

if (repetidas.length) console.log(`${repetidas.length} fotos repetidas ignoradas:\n  ${repetidas.join('\n  ')}`);
if (removidas) console.log(`${removidas} arquivos antigos removidos de public/fotos.`);
console.log(`Pronto: ${dados.length} álbuns / ${dados.reduce((s, a) => s + a.fotos.length, 0)} fotos no site.`);
if (erros.length) process.exitCode = 1;
