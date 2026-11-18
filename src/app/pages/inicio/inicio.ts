import { Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Lightbox } from '../../components/lightbox/lightbox';
import { ContarAte, Revelar } from '../../diretivas/rolagem';
import { ALBUNS, SOBRE, CONTATOS, INICIO, NUMEROS } from '../../data/conteudo';

const INTERVALO = 6500; // ms entre uma foto e outra na abertura (igual ao CSS de .indicador)

@Component({
  selector:'app-inicio', imports:[RouterLink, Lightbox, Revelar, ContarAte], templateUrl:'./inicio.html', styleUrl:'./inicio.css',
})
export class Inicio {
  inicio = INICIO;
  sobre = SOBRE;
  contatos = CONTATOS;
  numeros = NUMEROS;
  destaques = ALBUNS.slice(0, 6);

  abertura = INICIO.abertura.map(nome => nome.includes('/') ? encodeURI(nome) : this.imagem(nome));
  mosaico = INICIO.mosaico.map(nome => ({src:this.imagem(nome), alt:'Fotografia do portfólio — ' + nome}));
  fotoChamada = `url("${this.imagem(INICIO.chamada.foto)}")`;

  slide = signal(0);
  pausado = signal(false);
  private relogio?: ReturnType<typeof setInterval>;

  constructor() {
    afterNextRender(() => this.agendar());
    inject(DestroyRef).onDestroy(() => clearInterval(this.relogio));
  }
  private agendar() {
    clearInterval(this.relogio);
    if (this.pausado()) return;
    this.relogio = setInterval(() => this.slide.update(i => (i + 1) % this.abertura.length), INTERVALO);
  }
  irPara(i:number) { this.slide.set(i); this.agendar(); }
  alternarPausa() { this.pausado.update(p => !p); this.agendar(); }

  imagem(nome:string) {
    // Procura pelo nome do arquivo original (ex.: '14 005.jpg') e usa a versão grande.
    const foto = ALBUNS.flatMap(album => album.fotos).find(f => f.arquivo === nome);
    if (!foto) console.warn('Foto não encontrada nos álbuns:', nome);
    return foto?.src ?? '';
  }
}
