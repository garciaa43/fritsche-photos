import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ALBUNS } from '../../data/conteudo';
import { Lightbox } from '../../components/lightbox/lightbox';
@Component({selector:'app-album', imports:[RouterLink,Lightbox], templateUrl:'./album.html', styleUrl:'./album.css'})
export class AlbumPage {
  private params = toSignal(inject(ActivatedRoute).paramMap);
  album = computed(() => ALBUNS.find(a => a.slug === this.params()?.get('slug')));
  data(valor:string) { return valor ? valor.split('-').reverse().join('/') : 'A definir'; }
}
