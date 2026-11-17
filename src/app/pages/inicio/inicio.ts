import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Lightbox } from '../../components/lightbox/lightbox';
import { ALBUNS, SOBRE, CONTATOS } from '../../data/conteudo';
@Component({
  selector:'app-inicio', imports:[RouterLink,Lightbox], templateUrl:'./inicio.html', styleUrl:'./inicio.css',
})
export class Inicio {
  sobre = SOBRE;
  contatos = CONTATOS;
  destaques = ALBUNS.slice(0, 6);
  pausado = signal(false);
  private nomes = [
    '02 006 (Mavi).jpg', '02 021 (Mavi).jpg', '03 013.jpg', '03 018.jpg', '03 019.jpg',
    '04 004.jpg', '06 014.jpg', '07 012.jpg', '07 024.jpg', '08 014.jpg', '09 002.jpg',
    '12 004 (Clip JL).jpg', '12 010 (Clip JL).jpg', '13 004 (Projeto M).jpg',
    '13 015 (Projeto M).jpg', '14 021.jpg', '14 030.jpg',
  ];
  faixas = [this.nomes.slice(0,9), this.nomes.slice(9)];
  fotosHero() { return this.nomes.map(nome => ({src:this.imagem(nome), alt:'Fotografia do portfólio — ' + nome})); }
  indiceFoto(nome:string) { return this.nomes.indexOf(nome); }
  imagem(nome:string) {
    const arquivo = ALBUNS.flatMap(album => album.fotos).find(foto =>
      decodeURIComponent(foto.src.split('/').pop() ?? '') === nome);
    return arquivo?.src ?? 'images/' + encodeURIComponent(nome);
  }
}
