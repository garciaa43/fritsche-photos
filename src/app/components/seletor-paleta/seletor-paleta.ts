import { Component, signal } from '@angular/core';

// Seletor TEMPORÁRIO para comparar paletas. Depois de escolher, remova este
// componente (e a tag <app-seletor-paleta /> em app.html).
interface Paleta { id: string; nome: string; cores: string[]; }

const CHAVE = 'fritsche-paleta';

@Component({
  selector: 'app-seletor-paleta',
  template: `
    <div class="painel" [class.aberto]="aberto()">
      <button class="alternar" (click)="aberto.set(!aberto())" [attr.aria-expanded]="aberto()">
        <span class="bolinha" [style.background]="atual().cores[5]"></span>
        {{ aberto() ? 'Fechar' : 'Paleta: ' + atual().nome }}
      </button>
      @if (aberto()) {
        <ul>
          @for (p of paletas; track p.id) {
            <li>
              <button (click)="escolher(p.id)" [class.ativa]="p.id === atual().id" [attr.aria-pressed]="p.id === atual().id">
                <span class="amostras">
                  @for (c of p.cores; track $index) { <span [style.background]="c"></span> }
                </span>
                <span class="nome">{{ p.nome }}</span>
              </button>
            </li>
          }
        </ul>
      }
    </div>`,
  styles: `
    :host { position:fixed; right:16px; bottom:16px; z-index:1000; font-family:Arial,Helvetica,sans-serif; }
    .painel { background:#1b1b1b; color:#f2f2f2; border:1px solid #3a3a3a; border-radius:12px;
      box-shadow:0 10px 40px rgba(0,0,0,.45); overflow:hidden; max-width:calc(100vw - 32px); }
    button { cursor:pointer; color:inherit; background:none; border:0; text-align:left; }
    .alternar { display:flex; align-items:center; gap:10px; width:100%; padding:12px 16px; font-size:13px; }
    .bolinha { width:12px; height:12px; border-radius:50%; border:1px solid #555; flex-shrink:0; }
    ul { list-style:none; margin:0; padding:4px 8px 10px; border-top:1px solid #333; }
    li button { display:flex; align-items:center; gap:12px; width:100%; padding:8px; border-radius:8px; font-size:13px; }
    li button:hover { background:#2a2a2a; }
    li button.ativa { background:#333; outline:1px solid #666; }
    .amostras { display:flex; border-radius:4px; overflow:hidden; border:1px solid #444; flex-shrink:0; }
    .amostras span { width:18px; height:24px; }
  `,
})
export class SeletorPaleta {
  paletas: Paleta[] = [
    { id:'original',      nome:'Original (atual)', cores:['#000000','#121212','#2a2a2a','#f5f5f5','#8f8f8f','#ffffff'] },
    { id:'grafite-ambar', nome:'Grafite & Âmbar',  cores:['#0e0f12','#17191e','#2a2d34','#f2f0ec','#8a8f98','#e8a33d'] },
    { id:'noite-urbana',  nome:'Noite Urbana',     cores:['#0b0b0d','#151518','#26262b','#ffffff','#9a9aa2','#d7ff3a'] },
    { id:'azul-profundo', nome:'Azul Profundo',    cores:['#0b1220','#121b2e','#22304a','#e9eef6','#8494ae','#f2c14e'] },
    { id:'papel-tinta',   nome:'Papel & Tinta',    cores:['#f4f1ea','#eae5da','#d6d0c4','#161514','#6e6a62','#c2412d'] },
    { id:'carvao-verde',  nome:'Carvão & Verde',   cores:['#101311','#1a1f1b','#2b322d','#eef1ec','#8c968e','#7fb069'] },
  ];
  aberto = signal(false);
  atual = signal<Paleta>(this.paletas[0]);

  constructor() {
    const daUrl = new URLSearchParams(location.search).get('paleta');
    let salva: string | null = null;
    try { salva = localStorage.getItem(CHAVE); } catch {}
    this.escolher(daUrl ?? salva ?? 'original', false);
  }

  escolher(id: string, salvar = true) {
    const p = this.paletas.find(x => x.id === id) ?? this.paletas[0];
    this.atual.set(p);
    document.documentElement.dataset['paleta'] = p.id;
    if (salvar) { try { localStorage.setItem(CHAVE, p.id); } catch {} }
  }
}
