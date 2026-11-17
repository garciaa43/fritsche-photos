import { Routes } from '@angular/router';
export const routes: Routes = [
  {path:'', pathMatch:'full', title:'Fritsche Photos', loadComponent:()=>import('./pages/inicio/inicio').then(m=>m.Inicio)},
  {path:'fotos', title:'Trabalhos | Fritsche Photos', loadComponent:()=>import('./pages/fotos/fotos').then(m=>m.Fotos)},
  {path:'fotos/:slug', title:'Álbum | Fritsche Photos', loadComponent:()=>import('./pages/album/album').then(m=>m.AlbumPage)},
  {path:'sobre', redirectTo:'/#sobre', pathMatch:'full'},
  {path:'contato', redirectTo:'/#contato', pathMatch:'full'},
  {path:'**', redirectTo:''},
];
