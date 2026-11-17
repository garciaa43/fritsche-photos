export interface Foto { src: string; alt: string; }
export interface Album {
  id: string; slug: string; titulo: string; categoria: string;
  data: string; local: string; descricao: string; capa: string; fotos: Foto[];
}
