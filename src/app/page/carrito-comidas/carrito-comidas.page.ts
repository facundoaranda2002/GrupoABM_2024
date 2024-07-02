import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonImg,
  IonButton,
  IonButtons,
  IonIcon,
  IonList,
  IonItemSliding,
  IonItem,
  IonItemOptions,
  IonItemOption,
  IonLabel,
} from '@ionic/angular/standalone';
import { MenuComidaService } from 'src/app/service/menu-comida.service';
import { Router } from '@angular/router';
import { PedidoService } from 'src/app/service/pedido.service';
import { Comida } from 'src/app/clases/comida';
import { MenuComida } from 'src/app/clases/menuComida';
import { Pedido } from 'src/app/clases/pedido';
import { AuthService } from 'src/app/service/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-carrito-comidas',
  templateUrl: './carrito-comidas.page.html',
  styleUrls: ['./carrito-comidas.page.scss'],
  standalone: true,
  imports: [
    IonLabel,
    IonItemOption,
    IonItemOptions,
    IonItem,
    IonItemSliding,
    IonList,
    IonIcon,
    IonButtons,
    IonButton,
    IonImg,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class CarritoComidasPage implements OnInit {
  pedidoService = inject(PedidoService);
  router = inject(Router);
  authService = inject(AuthService);

  agregarComidaPedido(comida: Comida) {
    this.pedidoService.agregarComida(comida);
  }

  removerComidaPedido(comida: Comida) {
    this.pedidoService.eliminarComida(comida);
  }

  removerTodaComidaPedido(comida: Comida) {
    this.pedidoService.eliminarTodoComida(comida);
    this.Toast.fire({
      icon: 'success',
      title: `Comida Eliminada`,
      color: '#ffffff',
    });
  }

  goMenuComidas() {
    this.router.navigateByUrl('/menu-comidas');
  }

  agregarPedido() {
    let email;
    if (this.authService.currentUserSig()) {
      email = this.authService.currentUserSig()?.email;
    } else {
      email = this.authService.obtenerAnonimo();
    }
    console.log(email);
    if (email) {
      const auxPedido: Pedido = new Pedido();
      auxPedido.cliente = email;
      auxPedido.comidas = this.pedidoService.comidasPedidos;
      auxPedido.estadoPedido = 'pendiente';
      auxPedido.precioTotal = this.pedidoService.calcularPrecioTotal();
      auxPedido.tiempoTotalEstimado =
        this.pedidoService.calcularEstimacionTotal();
      this.pedidoService.savePedido(auxPedido);
    }
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

  ngOnInit() {}
}
