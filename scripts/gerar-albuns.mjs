import { readdir, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pasta = path.join(raiz, 'public/images');
const destino = path.join(raiz, 'src/app/data/albuns.generated.ts');
const nomes = { '01': 'Trackside', '02': 'Projeto Mavi', '10': 'Baile do LZ',
  '11': 'Baile do LZ', '12': 'Clip JL', '13': 'Projeto M', '14': 'Portilho',
  '19': 'Hiago', '20': 'Bell' };
// Datas conhecidas das pastas. Os projetos sem data continuam como "A definir".
const datas = { '01':'2025-05-10', '02':'2025-04-17', '03':'2024-10-12',
  '04':'2024-11-21', '05':'2024-11-22', '06':'2024-12-05', '07':'2025-01-05',
  '08':'2025-01-11', '09':'2025-01-12', '10':'2025-03-15', '11':'2025-03-16',
  '12':'2025-04-10', '13':'2025-04-19', '14':'2025-11-09', '15':'2026-06-06',
  '16':'2026-09-06', '19':'2026-10-23', '20':'2026-10-23' };
async function percorrer(dir) {
  let entradas;
  try { entradas = await readdir(dir, { withFileTypes: true }); }
  catch (erro) { if (erro.code === 'ENOENT') return []; throw erro; }
  const resultado = [];
  for (const entrada of entradas) {
    if (entrada.name.startsWith('.')) continue;
    const arquivo = path.join(dir, entrada.name);
    if (entrada.isDirectory()) resultado.push(...await percorrer(arquivo));
    else if (/\.(jpe?g|png|webp|avif)$/i.test(entrada.name)) resultado.push(arquivo);
  }
  return resultado;
}
const arquivos = (await percorrer(pasta)).sort((a,b) =>
  a.length-b.length || a.localeCompare(b, 'pt-BR', {numeric:true}));
const grupos = new Map();
const vistos = new Set();
for (const arquivo of arquivos) {
  const nome = path.basename(arquivo);
  const match = /^(\d{2})[ _-]+\d+/.exec(nome);
  if (!match) continue;
  const id = match[1];
  // Se a foto da home também estiver dentro do álbum, usamos uma única entrada.
  const chave = `${id}/${nome.toLowerCase()}`;
  if (vistos.has(chave)) continue;
  vistos.add(chave);
  const relativo = path.relative(pasta, arquivo).split(path.sep).map(encodeURIComponent).join('/');
  const fotos = grupos.get(id) ?? [];
  fotos.push({src: `images/${relativo}`, alt: `${nomes[id] ?? `Projeto ${id}`} — ${nome}`});
  grupos.set(id, fotos);
}
const albuns = [...grupos].sort(([a],[b])=>a.localeCompare(b)).map(([id,fotos]) => {
  fotos.sort((a,b)=>a.src.localeCompare(b.src,'pt-BR',{numeric:true}));
  return { id, slug:`projeto-${id}`, titulo:nomes[id] ?? `Projeto ${id}`,
    categoria:nomes[id] ?? `Projeto ${id}`, data:datas[id] ?? '',
    local:'Lorem ipsum', descricao:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae nibh at nunc consequat viverra.',
    capa:fotos[0].src, fotos };
});
await mkdir(path.dirname(destino), {recursive:true});
await writeFile(destino, `// Gerado por scripts/gerar-albuns.mjs. Edite textos em conteudo.ts.\nimport type { Album } from './modelos';\nexport const ALBUNS_GERADOS: Album[] = ${JSON.stringify(albuns,null,2)};\n`);
console.log(`${albuns.length} álbuns / ${vistos.size} fotos cadastrados.`);
if (!albuns.length) console.log('Adicione as fotos em public/images e execute este script novamente.');
