import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonImg,
  IonSpinner,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuComida } from 'src/app/clases/menuComida';
import { MenuComidaService } from 'src/app/service/menu-comida.service';
import { PedidoService } from 'src/app/service/pedido.service';
import { Comida } from 'src/app/clases/comida';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detalle-comida',
  templateUrl: './detalle-comida.page.html',
  styleUrls: ['./detalle-comida.page.scss'],
  standalone: true,
  imports: [
    IonSpinner,
    IonImg,
    IonIcon,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class DetalleComidaPage implements OnInit {
  route = inject(ActivatedRoute);
  menuService = inject(MenuComidaService);
  router = inject(Router);
  pedidoService = inject(PedidoService);

  id?: string | null;
  comidaMenu?: any;

  numeroImagen: number = 1;

  cambiarNumero() {
    if (this.numeroImagen == 3) {
      this.numeroImagen = 1;
    } else {
      this.numeroImagen++;
    }
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.id = params.get('id');
    });
    this.menuService.getMenuComidas().subscribe((data) => {
      this.comidaMenu = data.find((comida) => comida.id == this.id);
    });
  }

  goMenuComidas() {
    this.router.navigateByUrl('/menu-comidas');
  }
  goHome() {
    this.router.navigateByUrl('/');
  }

  agregarComidaPedido(comidaMenu: MenuComida) {
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
