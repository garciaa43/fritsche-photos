import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { SeletorPaleta } from './components/seletor-paleta/seletor-paleta';

@Component({
  imports: [Navbar, RouterOutlet, SeletorPaleta],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
