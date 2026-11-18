import { ALBUNS_GERADOS } from './albuns.generated';
import type { Album } from './modelos';

// Ajustes permanentes: não são apagados quando o script atualiza as fotos.
const ajustes: Record<string, Partial<Album>> = {
  // '14': { titulo: 'Portilho', local: 'Nome do local', descricao: 'Texto do ensaio.' },
};
export const ALBUNS: Album[] = ALBUNS_GERADOS.map(album => ({...album, ...ajustes[album.id]}));
export const SOBRE = {
  titulo: 'Por trás de cada imagem, um olhar.',
  texto: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vitae justo nec neque volutpat tincidunt. Cada história terá seu espaço aqui.',
  historia: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer a magna vitae lorem finibus viverra. Sed consequat, neque vel tincidunt varius, lorem erat sollicitudin neque.',
  retrato: '', // Exemplo: 'images/fritz.jpg' — preencher apenas com a foto do fotógrafo.
};
export const CONTATOS: {nome:string; url:string}[] = [
  // { nome: 'Instagram', url: 'https://www.instagram.com/SEU_PERFIL/' },
  // { nome: 'E-mail', url: 'mailto:SEU_EMAIL' },
  // { nome: 'WhatsApp', url: 'https://wa.me/55DDDNUMERO' },
];

// Página inicial — nomes de arquivo de public/images.
export const INICIO = {
  // Fotos que trocam na abertura (tela cheia). Prefira fotos horizontais.
  abertura: ['07 024.jpg', '08 014.jpg', '01 008 (Trackside).jpg'],
  frase: 'Seu jeito. Sua história. Um novo olhar.',
  apresentacao: {
    titulo: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    texto: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vitae justo nec neque volutpat tincidunt, sed consequat neque vel tincidunt varius. Integer a magna vitae lorem finibus viverra.',
  },
  // Linha de fotos logo depois do texto (6 fotos, na ordem do mosaico).
  mosaico: ['02 006 (Mavi).jpg', '04 004.jpg', '03 013.jpg', '06 014.jpg', '13 004 (Projeto M).jpg', '09 002.jpg'],
  // Faixa com foto de fundo e convite para contato.
  chamada: {
    foto: '07 012.jpg',
    linha: 'Precisa de um ensaio?',
    titulo: 'Lorem ipsum dolor sit amet!',
    botao: 'Entre em contato',
  },
};

// Contador da página inicial. TROCAR pelos números reais do Fritz.
export const NUMEROS: {rotulo:string; valor:number}[] = [
  { rotulo: 'Projetos realizados', valor: 194 },
  { rotulo: 'Seguidores', valor: 1573 },
];
