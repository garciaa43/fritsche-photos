import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ALBUNS } from '../../data/conteudo';
import { Galeria } from '../../components/galeria/galeria';

@Component({
  selector: 'app-fotos',
  imports: [RouterLink, Galeria],
  templateUrl: './fotos.html',
  styleUrl: './fotos.css',
})
export class Fotos {
  categoria = signal('Todos');

  categorias = [
    'Todos',
    ...new Set(ALBUNS.map((album) => album.categoria)),
  ];

  albunsFiltrados = computed(() => {
    if (this.categoria() === 'Todos') {
      return ALBUNS;
    }

    return ALBUNS.filter(
      (album) => album.categoria === this.categoria(),
    );
  });

  fotosVisiveis = computed(() =>
    this.albunsFiltrados().flatMap((album) => album.fotos),
  );

  selecionar(categoria: string) {
    this.categoria.set(categoria);
  }

  formatarData(data: string) {
    return data
      ? data.split('-').reverse().join('/')
      : 'A definir';
  }
}