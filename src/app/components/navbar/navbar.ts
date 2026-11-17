import { Component, inject } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
@Component({
  selector: 'app-navbar', imports: [RouterLink],
  templateUrl: './navbar.html', styleUrl: './navbar.css',
})
export class Navbar {
  private router = inject(Router);
  url = toSignal(this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map(() => this.router.url)
  ), {initialValue:this.router.url});
  ativo(id:string) { return this.url().endsWith('#' + id) || (id === 'trabalhos' && this.url().startsWith('/fotos')); }
  itens = [{nome:'Sobre', id:'sobre'}, {nome:'Fotos', id:'trabalhos'}, {nome:'Contato', id:'contato'}];
}
