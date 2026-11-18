export interface Foto {
  src: string;        // versão grande (foto ampliada)
  alt: string;
  mini?: string;      // miniatura (grades)
  arquivo?: string;   // nome do arquivo original
  largura?: number;
  altura?: number;
}
export interface Album {
  id: string; slug: string; titulo: string; categoria: string;
  data: string; local: string; descricao: string; capa: string; fotos: Foto[];
}
