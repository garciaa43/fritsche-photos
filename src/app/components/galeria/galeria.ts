import { Component, DestroyRef, ElementRef, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import type { Foto } from '../../data/modelos';
import { Lightbox } from '../lightbox/lightbox';
import { Revelar } from '../../diretivas/rolagem';

const POR_VEZ = 24;

/**
 * Grade de fotos em colunas (estilo "masonry") que carrega aos poucos.
 * As fotos são distribuídas na coluna mais baixa, usando a proporção de cada
 * uma, então carregar mais fotos só acrescenta embaixo — nada muda de lugar.
 */
@Component({
  selector: 'app-galeria',
  imports: [Lightbox, Revelar],
  template: `
    <div class="colunas">
      @for (coluna of colunas(); track $index) {
        <div class="coluna">
          @for (item of coluna; track item.foto.src) {
            <button type="button" class="foto" [revelar]="(item.indice % 3) * 80"
                    (click)="visor.abrir(fotos(), item.indice)" [attr.aria-label]="'Ampliar ' + item.foto.alt">
              <img [src]="item.foto.mini ?? item.foto.src" [alt]="item.foto.alt"
                   [attr.width]="item.foto.largura" [attr.height]="item.foto.altura"
                   loading="lazy" decoding="async" />
            </button>
          }
        </div>
      }
    </div>
    @if (limite() < fotos().length) {
      <div class="mais" #fim>
        <button type="button" (click)="carregarMais()">Carregar mais fotos</button>
      </div>
    }
    <app-lightbox #visor />`,
  styles: `
    :host { display:block; }
    .colunas { display:flex; align-items:flex-start; gap:var(--espaco,24px); }
    .coluna { flex:1; min-width:0; display:flex; flex-direction:column; gap:var(--espaco,24px); }
    .foto { display:block; width:100%; padding:0; border:0; overflow:hidden; background:var(--superficie); cursor:zoom-in; }
    .foto img { display:block; width:100%; height:auto; transition:transform 800ms var(--suave), opacity 500ms ease; }
    .foto:focus-visible { outline:2px solid var(--destaque); outline-offset:5px; }
    @media (hover:hover) { .foto:hover img { transform:scale(1.035); opacity:.9; } }
    .mais { display:flex; justify-content:center; padding:48px 0 8px; }
    .mais button { padding:14px 28px; border:1px solid var(--borda-forte); background:none; color:var(--texto);
      font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:.2em; cursor:pointer; }
    .mais button:hover { border-color:var(--destaque); color:var(--destaque); }
    @media (prefers-reduced-motion:reduce) { .foto img { transition:none; } }`,
})
export class Galeria {
  fotos = input.required<Foto[]>();
  limite = signal(POR_VEZ);
  private numColunas = signal(this.calcularColunas());
  private fim = viewChild<ElementRef<HTMLElement>>('fim');

  colunas = computed(() => {
    const n = this.numColunas();
    const colunas: {foto: Foto; indice: number}[][] = Array.from({length: n}, () => []);
    const alturas = new Array(n).fill(0);
    this.fotos().slice(0, this.limite()).forEach((foto, indice) => {
      const menor = alturas.indexOf(Math.min(...alturas));
      colunas[menor].push({foto, indice});
      alturas[menor] += (foto.altura && foto.largura) ? foto.altura / foto.largura : 1.25;
    });
    return colunas;
  });

  constructor() {
    // Trocou o filtro: volta a mostrar só o primeiro lote.
    effect(() => { this.fotos(); this.limite.set(POR_VEZ); });

    const aoRedimensionar = () => this.numColunas.set(this.calcularColunas());
    window.addEventListener('resize', aoRedimensionar, { passive: true });

    // Carrega o próximo lote quando o fim da grade se aproxima da tela.
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) this.carregarMais(); }, { rootMargin: '800px 0px' });
    effect(() => {
      const el = this.fim()?.nativeElement;
      this.limite();
      // Observa de novo a cada lote: o navegador avisa outra vez se o fim
      // continuar visível (tela grande ou rolagem rápida).
      io.disconnect();
      if (el) io.observe(el);
    });
    inject(DestroyRef).onDestroy(() => { io.disconnect(); window.removeEventListener('resize', aoRedimensionar); });
  }

  carregarMais() { this.limite.update(n => Math.min(n + POR_VEZ, this.fotos().length)); }

  private calcularColunas() {
    const w = window.innerWidth;
    return w > 1000 ? 3 : w > 600 ? 2 : 1;
  }
}
