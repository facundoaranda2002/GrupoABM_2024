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
  IonCard,
} from '@ionic/angular/standalone';
import { MenuComidaService } from 'src/app/service/menu-comida.service';
import { MenuComida } from 'src/app/clases/menuComida';
import { Router } from '@angular/router';
import { PedidoService } from 'src/app/service/pedido.service';
import { Comida } from 'src/app/clases/comida';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-menu-comidas',
  templateUrl: './menu-comidas.page.html',
  styleUrls: ['./menu-comidas.page.scss'],
  standalone: true,
  imports: [
    IonCard,
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
  router = inject(Router);
  pedidoService = inject(PedidoService);

  arrayMenu: MenuComida[] = [];
  categoria: string = 'todo';

  ngOnInit() {
    this.menuService.getMenuComidas().subscribe((data) => {
      this.arrayMenu = data;
    });
  }
  clickMenuComida(id: string | undefined) {
    this.router.navigate(['/detalle-comida', id]);
  }
  clickCategoria(categoria: string) {
    this.categoria = categoria;
  }
  agregarComidaPedido(comidaMenu: MenuComida) {
    console.log(comidaMenu);
    const auxComida: Comida = new Comida();
    auxComida.cantidad = 1;
    auxComida.descripcion = comidaMenu.descripcion;
    auxComida.estadoComida = 'pendiente';
    auxComida.img = comidaMenu.img;
    auxComida.nombre = comidaMenu.nombre;
    auxComida.precio = comidaMenu.precio;
    auxComida.sector = comidaMenu.sector;
    auxComida.tiempoEstimado = comidaMenu.tiempoEstimado;
    this.pedidoService.agregarComida(auxComida);
    this.Toast.fire({
      icon: 'success',
      title: `Comida agregada`,
      color: '#ffffff',
    });
  }

  goHome() {
    this.router.navigateByUrl('/home');
  }
  goCarritoComidas() {
    this.router.navigateByUrl('/carrito-comidas');
  }

  private Toast = Swal.mixin({
    toast: true,
    position: 'top',
    background: '#008b3c91',
    showConfirmButton: false,
    timer: 1000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });
}
