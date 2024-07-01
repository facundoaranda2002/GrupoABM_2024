import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonImg,
  IonButtons,
  IonTabButton,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { MenuComidaService } from 'src/app/service/menu-comida.service';
import { MenuComida } from 'src/app/clases/menuComida';

@Component({
  selector: 'app-menu-comidas',
  templateUrl: './menu-comidas.page.html',
  styleUrls: ['./menu-comidas.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonButton,
    IonTabButton,
    IonButtons,
    IonImg,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class MenuComidasPage implements OnInit {
  constructor() {}
  menuService = inject(MenuComidaService);

  arrayMenu: MenuComida[] = [];
  categoria: string = 'todo';

  ngOnInit() {
    this.menuService.getMenuComidas().subscribe((data) => {
      this.arrayMenu = data;
    });
  }

  onClick() {
    const auxComida = new MenuComida();
    auxComida.descripcion = 'a';
    auxComida.img = 'a';
    auxComida.nombre = 'a';
    auxComida.precio = 1;
    auxComida.sector = 'a';
    auxComida.tiempoEstimado = 'a';
    console.log(auxComida);
    this.menuService.saveMenuComida(auxComida);
  }
  clickCategoria(categoria: string) {
    this.categoria = categoria;
  }
}
