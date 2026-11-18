import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
@Component({
  selector: 'app-navbar', imports: [RouterLink],
  templateUrl: './navbar.html', styleUrl: './navbar.css',
  host: { '(window:scroll)': 'medir()', '(window:resize)': 'medir()' },
})
export class Navbar {
  private router = inject(Router);
  url = toSignal(this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map(() => this.router.url)
  ), {initialValue: location.pathname + location.hash});
  private rolagem = signal(window.scrollY);
  private altura = signal(window.innerHeight);
  noInicio = computed(() => this.url().split(/[?#]/)[0] === '/');
  // Transparente enquanto a foto de abertura ocupa a tela.
  transparente = computed(() => this.noInicio() && this.rolagem() < this.altura() - 120);
  medir() { this.rolagem.set(window.scrollY); this.altura.set(window.innerHeight); }
  topo() { if (this.noInicio()) window.scrollTo({top:0, behavior:'smooth'}); }
  ativo(id:string) { return this.url().endsWith('#' + id) || (id === 'trabalhos' && this.url().startsWith('/fotos')); }
  itens = [{nome:'Sobre', id:'sobre'}, {nome:'Fotos', id:'trabalhos'}, {nome:'Contato', id:'contato'}];
}
