import { ALBUNS_GERADOS } from './albuns.generated';
import type { Album } from './modelos';

// Textos dos álbuns. A chave é o "slug" do álbum (nome da pasta em formato de
// endereço, veja albuns.generated.ts). Não são apagados ao rodar "npm run fotos".
const ajustes: Record<string, Partial<Album>> = {
  // '14-portilho-2025-11-09': { local: 'Nome do local', descricao: 'Texto do ensaio.' },
};
// Álbuns que ficam no meio da lista (em Trabalhos > Todos, nos filtros e na
// seleção da página inicial), em vez de na ordem dos números das pastas.
// Pedido do Fritz: Trackside não deve aparecer logo no começo.
const NO_MEIO = ['01-trackside-2025-05-10'];

function colocarNoMeio(albuns: Album[]) {
  const meio = albuns.filter(a => NO_MEIO.includes(a.slug));
  const resto = albuns.filter(a => !NO_MEIO.includes(a.slug));
  const metade = albuns.reduce((soma, a) => soma + a.fotos.length, 0) / 2;
  let soma = 0, i = 0;
  while (i < resto.length && soma + resto[i].fotos.length <= metade) soma += resto[i++].fotos.length;
  return [...resto.slice(0, i), ...meio, ...resto.slice(i)];
}

export const ALBUNS: Album[] = colocarNoMeio(ALBUNS_GERADOS.map(album => ({...album, ...ajustes[album.id]})));
export const SOBRE = {
  // Resumo do texto "Victor: minha história na fotografia".
  nome: 'Victor',
  titulo: 'Do skate para trás da câmera.',
  texto: 'A história de Victor com a fotografia começou no skate, gravando os amigos com a câmera do padrasto. Quando uma lesão no pé o afastou das pistas, fotografar virou o jeito de continuar perto daquele universo, e o interesse pelas imagens só cresceu.',
  historia: 'Por indicação do irmão, começou como assistente do fotógrafo Norton José, em Florianópolis. Entre aniversários, festas de 15 anos e casamentos, passou da iluminação para a câmera e fez da fotografia sua profissão, com ensaios e eventos próprios, inclusive em outras cidades.',
  retrato: 'sobre/victor.jpg', // Arquivo em public/sobre/.
};
// Botões da seção Contato. Campo vazio = botão escondido.
export const CONTATO = {
  // Número com país e DDD, só dígitos. Ex.: '5548999998888'.
  whatsapp: '554898676260',
  // Mensagem que já aparece escrita quando a pessoa abre a conversa.
  mensagem: 'Olá, Victor! Vi seu portfólio no site e gostaria de fazer um orçamento.',
  // Usuário do Instagram profissional, sem o @.
  instagram: 'fritsche_photos',
};

// Página inicial — nomes dos arquivos originais (os mesmos da pasta fritsche-originais).
export const INICIO = {
  // Fotos que trocam na abertura (tela cheia), escolhidas pelo Fritz. Prefira fotos horizontais.
  // Nome de arquivo = foto de public/images; caminho com "/" = arquivo avulso de public/.
  abertura: ['14 005.jpg', 'abertura/casal.jpg', '19 025 (Hiago) (1).jpg', 'abertura/ponte.jpg'],
  frase: 'Seu jeito. Sua história. Um novo olhar.',
  apresentacao: {
    titulo: 'Imagens que nascem do contato com pessoas, lugares e histórias.',
    texto: 'Eventos, ensaios e retratos feitos com atenção ao que acontece ao redor: os gestos, os encontros e os detalhes que fazem de cada momento uma história.',
  },
  // Linha de fotos logo depois do texto (6 fotos, na ordem do mosaico).
  mosaico: ['02 006 (Mavi).jpg', '04 004.jpg', '03 013.jpg', '06 014.jpg', '13 004 (Projeto M).jpg', '09 002.jpg'],
  // Faixa com foto de fundo e convite para contato.
  chamada: {
    foto: '07 012.jpg',
    linha: 'Precisa de um fotógrafo?',
    titulo: 'Eventos, ensaios e retratos.',
    botao: 'Entre em contato',
  },
};

// Contador da página inicial. TROCAR pelos números reais do Fritz.
export const NUMEROS: {rotulo:string; valor:number}[] = [
  { rotulo: 'Projetos realizados', valor: 194 },
  { rotulo: 'Seguidores', valor: 1573 },
];
