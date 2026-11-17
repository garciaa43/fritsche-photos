import { Component, ElementRef, ViewChild, signal, OnDestroy } from '@angular/core';
import type { Foto } from '../../data/modelos';
@Component({
  selector: 'app-lightbox',
  template: `
    <dialog #modal (click)="fundo($event)" (close)="restaurar()" (keydown)="teclado($event)" aria-label="Visualizador de fotos">
      <button class="fechar" (click)="fechar()" aria-label="Fechar foto">Fechar ×</button>
      @if (atual(); as foto) {
        <img [src]="foto.src" [alt]="foto.alt" />
        <div class="controles">
          <button (click)="mover(-1)" [disabled]="fotos.length < 2" aria-label="Foto anterior">←</button>
          <span aria-live="polite">{{ indice() + 1 }} / {{ fotos.length }}</span>
          <button (click)="mover(1)" [disabled]="fotos.length < 2" aria-label="Próxima foto">→</button>
        </div>
      }
    </dialog>`,
  styles: `
    dialog { position:fixed; inset:0; width:100%; height:100dvh; max-width:none; max-height:none;
      margin:0; border:0; padding:64px 20px 72px; background:rgba(0,0,0,.96); color:white; }
    dialog::backdrop { background:#000; } img { width:100%; height:100%; object-fit:contain; }
    .fechar { position:absolute; top:18px; right:24px; padding:8px; }
    .controles { position:absolute; bottom:16px; left:0; width:100%; display:flex; align-items:center; justify-content:center; gap:24px; }
    .controles button { min-width:44px; min-height:44px; font-size:24px; }
    button:disabled { opacity:.3; } button { cursor:pointer; }`
})
export class Lightbox implements OnDestroy {
  @ViewChild('modal') modal!: ElementRef<HTMLDialogElement>;
  fotos: Foto[] = [];
  indice = signal(0);
  atual = signal<Foto | null>(null);
  private overflow: string | null = null;
  abrir(fotos: Foto[], indice: number) {
    if (!fotos[indice]) return;
    this.fotos = fotos; this.indice.set(indice); this.atual.set(fotos[indice]);
    this.overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this.modal.nativeElement.showModal();
  }
  fechar() { this.modal.nativeElement.close(); }
  restaurar() {
    if (this.overflow !== null) document.body.style.overflow = this.overflow;
    this.overflow = null;
  }
  mover(delta: number) {
    const indice = (this.indice() + delta + this.fotos.length) % this.fotos.length;
    this.indice.set(indice); this.atual.set(this.fotos[indice]);
  }
  teclado(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); this.mover(event.key === 'ArrowLeft' ? -1 : 1);
    }
  }
  fundo(event: MouseEvent) { if (event.target === this.modal.nativeElement) this.fechar(); }
  ngOnDestroy() { this.restaurar(); }
}
