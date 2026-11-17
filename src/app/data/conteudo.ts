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
