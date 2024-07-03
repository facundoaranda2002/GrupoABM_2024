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
  pedidos$: Observable<Pedido[]> | undefined;

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
      if (pedido.estadoPedido == "pendiente") {
        // Actualizar el estado del pedido a 'En Proceso'
        pedido.estadoPedido = 'en proceso';
      } else if (pedido.estadoPedido == "en proceso") {
        pedido.estadoPedido = 'preparado';
      } else {
        pedido.estadoPedido = 'entregado';
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
}
