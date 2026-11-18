import { DestroyRef, Directive, ElementRef, afterNextRender, computed, inject, input } from '@angular/core';

// Um único observador para todos os elementos animados da página.
let observador: IntersectionObserver | null = null;
function observadorCompartilhado() {
  observador ??= new IntersectionObserver(entradas => {
    for (const entrada of entradas) {
      if (!entrada.isIntersecting) continue;
      entrada.target.classList.add('visivel');
      observador!.unobserve(entrada.target);
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  return observador;
}

/**
 * Faz o elemento surgir suavemente quando entra na tela.
 * Uso: <div revelar> ou <div [revelar]="150"> (atraso em ms).
 */
@Directive({
  selector: '[revelar]',
  host: { class: 'revelar', '[style.--atraso]': 'atraso()' },
})
export class Revelar {
  revelar = input<number | ''>('');
  atraso = computed(() => (Number(this.revelar()) || 0) + 'ms');

  constructor() {
    const el: HTMLElement = inject(ElementRef).nativeElement;
    afterNextRender(() => {
      if (!('IntersectionObserver' in window)) { el.classList.add('visivel'); return; }
      observadorCompartilhado().observe(el);
    });
    inject(DestroyRef).onDestroy(() => observador?.unobserve(el));
  }
}

/** Conta de 0 até o valor quando o número aparece na tela. */
@Directive({ selector: '[contarAte]' })
export class ContarAte {
  contarAte = input.required<number>();

  constructor() {
    const el: HTMLElement = inject(ElementRef).nativeElement;
    let quadro = 0;
    let io: IntersectionObserver | undefined;
    const formatar = (n: number) => Math.round(n).toLocaleString('pt-BR');

    afterNextRender(() => {
      const alvo = this.contarAte();
      const semMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (semMovimento || !('IntersectionObserver' in window)) { el.textContent = formatar(alvo); return; }
      el.textContent = formatar(0);
      io = new IntersectionObserver(([entrada]) => {
        if (!entrada.isIntersecting) return;
        io!.disconnect();
        const inicio = performance.now();
        const duracao = 2200;
        const passo = (agora: number) => {
          const p = Math.min(1, (agora - inicio) / duracao);
          el.textContent = formatar(alvo * (1 - Math.pow(1 - p, 4)));
          if (p < 1) quadro = requestAnimationFrame(passo);
        };
        quadro = requestAnimationFrame(passo);
      }, { threshold: 0.6 });
      io.observe(el);
    });
    inject(DestroyRef).onDestroy(() => { io?.disconnect(); cancelAnimationFrame(quadro); });
  }
}
