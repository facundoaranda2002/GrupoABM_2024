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
import { Usuario } from 'src/app/clases/usuario';

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

  usuarioActual: Usuario | null = null;

  async checkDatosUsuarioActual() {
    if (this.authService.currentUserSig()) {
      this.usuarioActual = await this.authService.getUserActual(
        this.authService.currentUserSig()?.email
      );
    } else {
      console.log(this.authService.obtenerAnonimo());
      if (this.authService.obtenerAnonimo()) {
        this.usuarioActual = await this.authService.getUserActual(
          this.authService.obtenerAnonimo()
        );
        console.log(this.usuarioActual);
      }
    }
  }

  agregarPedido() {
    if (this.usuarioActual != null) {
      let mail = '';
      let mesa = 0;
      if (this.usuarioActual.mail) {
        mail = this.usuarioActual.mail;
      }
      if (this.usuarioActual.mesaAsignada) {
        mesa = this.usuarioActual.mesaAsignada;
      }
      const auxPedido: Pedido = new Pedido();
      auxPedido.cliente = mail;
      auxPedido.comidas = this.pedidoService.comidasPedidos;
      auxPedido.estadoPedido = 'pendiente';
      auxPedido.precioTotal = this.pedidoService.calcularPrecioTotal();
      auxPedido.tiempoTotalEstimado =
        this.pedidoService.calcularEstimacionTotal();
      auxPedido.numeroMesa = mesa;

      this.pedidoService.savePedido(auxPedido).then(() => {
        this.pedidoService.comidasPedidos = [];
        this.router.navigateByUrl('/maitre');
      });
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

  ngOnInit() {
    this.checkDatosUsuarioActual();
  }
}
