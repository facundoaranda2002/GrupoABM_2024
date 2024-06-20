import { Component, OnInit, inject, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
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
} from '@ionic/angular/standalone';

import { Table } from '../../clases/table';
import { TableService } from '../../service/table.service';
import { PhotoService, UserPhoto } from '../../service/photo.service';
type TipoMesa = 'VIP' | 'discapacitados' | 'estandar';

import * as QRCode from 'qrcode';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-alta-mesa',
  templateUrl: './alta-mesa.page.html',
  standalone: true,
  imports: [
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
  styleUrls: ['./alta-mesa.page.scss'],
})
export class AltaMesaPage implements OnInit {
  ngOnInit() { }
  tempPhoto: string | undefined;

  router = inject(Router);
  tableService = inject(TableService);
  fb = inject(FormBuilder);
  elementRef = inject(ElementRef);
  photoService = inject(PhotoService);
  authService = inject(AuthService);

  qrCodeImageUrl: string | undefined;
  photoUrl: string | undefined;

  form = this.fb.nonNullable.group({
    numeroMesa: ['', Validators.required],
    comensales: ['', Validators.required],
    tipoMesa: ['', Validators.required],
    foto: ['', Validators.required],
  });

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

  async onSubmit(): Promise<void> {
    if (this.form.valid) {
      try {
        // const userEmail = await firstValueFrom(this.authService.actual());
        const userEmail = this.authService.currentUserSig()?.email;
        if (userEmail) {
          const perfil = await this.authService.getUser(userEmail);

          //Acá van los perfiles que pueden dar de alta una mesa
          if (
            perfil === 'supervisor' ||
            perfil === 'dueno' ||
            perfil === 'maitre'
          ) {
            const mesa = await this.cargartable();
            if (mesa) {
              // Se guarda la mesa en la base de datos
              this.alta(mesa);

              this.Toast.fire({
                icon: 'success',
                title: 'Alta de mesa exitosa',
                color: '#ffffff',
              });
            } else {
              console.error('Error al crear la mesa.');
            }
          } else {
            console.error('Usuario no autorizado para realizar esta acción.');
          }
        } else {
          console.error(
            'No se pudo obtener el correo electrónico del usuario.'
          );
        }
      } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error);
      }
    } else {
      console.error('Formulario inválido');
      this.Toast.fire({
        icon: 'error',
        title: 'Ingrese los datos correctos!',
        color: '#ffffff',
      });
    }
  }

  async cargartable(): Promise<Table | null> {
    const value = this.form.getRawValue();
    const mesa = new Table();
    // Convertir los valores de número a enteros
    mesa.numeroMesa = parseInt(value.numeroMesa, 10);
    mesa.comensales = parseInt(value.comensales, 10);
    // Validar tipoMesa
    switch (value.tipoMesa) {
      case 'VIP':
      case 'discapacitados':
      case 'estandar':
        mesa.tipoMesa = value.tipoMesa;
        break;
      default:
        mesa.tipoMesa = 'estandar';
    }
    mesa.foto = value.foto;

    this.photoUrl = await this.photoService.getPhotoUrl(value.foto);

    mesa.qr = await this.generateQRCode(
      `Mesa: ${mesa.numeroMesa}, Comensales: ${mesa.comensales}, Tipo: ${mesa.tipoMesa}, Foto: ${this.photoUrl}`
    );
    this.qrCodeImageUrl = mesa.qr;

    return mesa;
  }

  alta(user: Table) {
    this.tableService.AltaMesa(user);
  }

  atras() {
    this.router.navigateByUrl('/home');
  }

  async takePhoto() {
    const photo = await this.photoService.addNicePhoto();
    if (photo && photo.name) {
      this.form.patchValue({ foto: photo.name });
    }
  }

  async generateQRCode(data: string): Promise<string> {
    try {
      return await QRCode.toDataURL(data);
    } catch (err) {
      console.error(err);
      return '';
    }
  }
}
