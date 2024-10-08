import { Component, OnInit, inject, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { ClienteService } from 'src/app/service/cliente.service';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormsModule,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonIcon,
  IonNavLink,
  IonItem,
  IonSelectOption,
  IonLabel,
  IonSelect,
  IonAlert,
  IonList,
  IonRow,
  IonGrid,
  IonCol,
  IonImg,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonText,
  IonFabButton,
  IonFab,
  IonToast,
  IonFabList,
  IonInput,
  Platform,
  ModalController,
  IonCard,
  IonFooter,
} from '@ionic/angular/standalone';

import { TableService } from '../../service/table.service';
import { PhotoService } from '../../service/photo.service';
import { PedidoService } from 'src/app/service/pedido.service';
import { Observable } from 'rxjs';
import { Pedido } from '../../clases/pedido';

import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { Usuario } from 'src/app/clases/usuario';
import { Comida } from 'src/app/clases/comida';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-mozo',
  templateUrl: './mozo.page.html',
  styleUrls: ['./mozo.page.scss'],
  standalone: true,
  imports: [
    IonFooter,
    IonCard,
    IonInput,
    IonFabList,
    IonToast,
    IonList,
    IonSelectOption,
    IonLabel,
    IonAlert,
    IonRow,
    IonGrid,
    IonItem,
    IonCol,
    IonImg,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonText,
    IonFabButton,
    IonFab,
    IonNavLink,
    IonSelect,
    IonIcon,
    IonButtons,
    IonButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class MozoPage implements OnInit {
  pedidoService = inject(PedidoService);
  authService = inject(AuthService);
  http = inject(HttpClient);
  router = inject(Router);
  pedidos$: Observable<Pedido[]> | undefined;

  allComidas: Comida[] = [];
  isMozoProfile: boolean = false;
  isBartenderProfile: boolean = false;
  isCocineroProfile: boolean = false;

  ngOnInit() {
    this.loadPedidos();
    this.checkUserProfile();
  }

  async checkUserProfile() {
    try {
      const currentUserEmail = await firstValueFrom(this.authService.actual());
      if (currentUserEmail) {
        const perfil = await this.authService.getUser(currentUserEmail);
        if (perfil === 'mozo') {
          this.isMozoProfile = true;
        } else if (perfil === 'bartender') {
          this.isBartenderProfile = true;
        } else {
          this.isCocineroProfile = true;
        }
      }
    } catch (error) {
      console.error('Error obteniendo perfil de usuario:', error);
    }
  }

  loadPedidos() {
    this.pedidos$ = this.pedidoService.getPedidos();
  }

  async cambiarEstadoPedido(pedido: Pedido) {
    // Verificar si pedido.id tiene un valor
    if (pedido.id) {
      if (pedido.estadoPedido == 'pendiente') {
        // Actualizar el estado del pedido a 'enProceso'
        this.sendNotificationToRole(
          'Cocina',
          'Se agrego un pedido',
          'cocinero'
        );
        this.sendNotificationToRole('Bar', 'Se agrego un pedido', 'bartender');
        pedido.estadoPedido = 'enProceso';
        for (let comida of pedido.comidas) {
          // Actualizar el estado de la comida según la lógica necesaria
          if (comida.estadoComida === 'pendiente') {
            comida.estadoComida = 'enProceso';
          }
        }
      } else if (pedido.estadoPedido == 'preparado') {
        pedido.estadoPedido = 'entregado';

        for (let comida of pedido.comidas) {
          // Actualizar el estado de la comida según la lógica necesaria
          if (comida.estadoComida === 'preparado') {
            comida.estadoComida = 'entregado';
          }
        }
      }

      try {
        // Llamar al servicio para actualizar el pedido en Firebase Firestore
        await this.pedidoService.updatePedido(pedido.id, pedido);

        // Mostrar el toast de éxito
        this.Toast.fire({
          icon: 'success',
          title: `Pedido Confirmado`,
          color: '#ffffff',
        });
      } catch (error) {
        console.error('Error al cambiar el estado del pedido:', error);

        // Mostrar un toast de error si ocurre algún problema
        this.Toast.fire({
          icon: 'error',
          title: `Error al confirmar pedido`,
          color: '#ffffff',
        });
      }
    }
  }

  async cambiarEstadoComida(pedido: Pedido, comidaPedido: Comida) {
    // Verificar si pedido.id tiene un valor
    if (pedido.id) {
      if (pedido.estadoPedido == 'enProceso') {
        let flag = true;
        for (let comida of pedido.comidas) {
          if (comida == comidaPedido && comida.estadoComida === 'enProceso') {
            comida.estadoComida = 'preparado';
          }
          if (comida.estadoComida != 'preparado') {
            flag = false;
          }
        }
        if (flag) {
          pedido.estadoPedido = 'preparado';
          this.sendNotificationToRole(
            'Mozo',
            'Pedido Listo para servir',
            'mozo'
          );
        }
        try {
          // Llamar al servicio para actualizar el pedido en Firebase Firestore
          await this.pedidoService.updatePedido(pedido.id, pedido);
          // Mostrar el toast de éxito
          this.Toast.fire({
            icon: 'success',
            title: `Plato Confirmado`,
            color: '#ffffff',
          });
        } catch (error) {
          console.error('Error al cambiar el estado del pedido:', error);

          // Mostrar un toast de error si ocurre algún problema
          this.Toast.fire({
            icon: 'error',
            title: `Error al confirmar Plato`,
            color: '#ffffff',
          });
        }
      }
    }
  }
  private Toast = Swal.mixin({
    toast: true,
    position: 'top',
    background: '#008b3c91',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });

  sendNotificationToRole(title: string, body: string, perfil: string) {
    const apiUrl = 'https://appiamb.onrender.com/notify-role';
    const payload = { title, body, perfil };
    console.log(payload);
    return this.http.post<any>(apiUrl, payload).subscribe((r) => {
      console.log(r);
    });
  }

  goHome() {
    this.router.navigateByUrl('/home');
  }
}
