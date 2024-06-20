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
  ModalController, IonCard
} from '@ionic/angular/standalone';

import { Table } from '../../clases/table';
import { TableService } from '../../service/table.service';
import { PhotoService, UserPhoto } from '../../service/photo.service';
type TipoMesa = 'VIP' | 'discapacitados' | 'estandar';

import * as QRCode from 'qrcode';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { BarcodeScanningModalComponent } from './barcode-scanning-modal.component';
import { BarcodeScanner, LensFacing } from '@capacitor-mlkit/barcode-scanning';

@Component({
  selector: 'app-maitre',
  templateUrl: './maitre.page.html',
  styleUrls: ['./maitre.page.scss'],
  standalone: true,
  imports: [IonCard,
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
    BarcodeScanningModalComponent
  ],
})
export class MaitrePage implements OnInit {

  ngOnInit() {
    this.numbers = this.generateNumbers(); // Genera los números disponibles
    this.loadMesasAsignadas();
    this.checkUserProfile();

    if (this.platform.is('capacitor')) {
      BarcodeScanner.isSupported().then();
      BarcodeScanner.checkPermissions().then();
      BarcodeScanner.removeAllListeners();
    }

  }

  platform = inject(Platform);
  router = inject(Router);
  tableService = inject(TableService);
  fb = inject(FormBuilder);
  elementRef = inject(ElementRef);
  photoService = inject(PhotoService);
  authService = inject(AuthService);
  clienteService = inject(ClienteService);
  private modalController: ModalController = inject(ModalController);


  qrCodeImageUrl: string | undefined;
  mesaAsignada: number | undefined;
  // photoUrl: string | undefined;
  scanResoult = '';

  // numbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  numbers: number[] = [];
  mesasAsignadas: { mesaAsignada: number | undefined, asignada: boolean }[] = [];
  mesaYaAsignada: boolean = false; // Variable para controlar si la mesa ya está asignada


  form = this.fb.nonNullable.group({
    asignarMesa: ['', [Validators.required, Validators.min(1), Validators.max(10)]],
  });

  isClientProfile: boolean = false;

  //escaneo
  async startScan() {
    const modal = await this.modalController.create({
      component: BarcodeScanningModalComponent,
      cssClass: 'barcode-scanning-modal',
      showBackdrop: false,
      componentProps: {
        formats: [],
        lensfacing: LensFacing.Back,
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      this.scanResoult = data?.barcode?.displayValue;
      // this.form.patchValue({ mesaAsignada: this.scanResoult }); // Actualiza el campo mesaAsignada en el formulario
      if (this.mesaAsignada !== parseInt(data?.barcode?.displayValue)) {
        // if (this.mesaAsignada !== 1) {

        console.log('El código QR escaneado no coincide con la mesa asignada al cliente.');
        // Aquí podrías mostrar un mensaje de error o realizar alguna acción adicional.
        this.mesaYaAsignada = true;
      } else {
        console.log('El código QR escaneado coincide con la mesa asignada al cliente.');
        // Aquí podrías continuar con la lógica necesaria si el escaneo es correcto.
        this.mesaYaAsignada = false;
      }
    }
  }

  //perfil actual
  async checkUserProfile() {
    try {
      const currentUserEmail = await firstValueFrom(this.authService.actual());
      if (currentUserEmail) {
        const perfil = await this.authService.getUser(currentUserEmail);
        if (perfil === 'cliente') {
          this.isClientProfile = true;
          // await this.loadQrForClient(currentUserEmail);
          await this.loadMesaAsignada(currentUserEmail);
        }
      }
    } catch (error) {
      console.error('Error obteniendo perfil de usuario:', error);
    }
  }

  async loadMesaAsignada(email: string) {
    try {
      const ultimoPerfil = await this.clienteService.obtenerClienteEnListaEspera(true);
      if (ultimoPerfil && ultimoPerfil.email === email) {
        this.mesaAsignada = ultimoPerfil.mesaAsignada;
        console.log(" mesaAsignada: ", this.mesaAsignada);
      } else {
        console.error('No se encontró ningún perfil conectado o el email no coincide.');
      }
    } catch (error) {
      console.error('Error al cargar QR para el cliente:', error);
    }
  }

  generateNumbers(): number[] {
    return [1, 2, 3, 4, 5]; // Números de mesa disponibles
  }

  //carga todas las mesas asignadas en this.mesasAsignadas
  async loadMesasAsignadas() {
    try {
      const mesas = await this.clienteService.obtenerMesasAsignadas();
      this.mesasAsignadas = mesas.map(mesa => ({
        mesaAsignada: mesa.mesaAsignada,
        asignada: typeof mesa.mesaAsignada === 'number'
      }));
    } catch (error) {
      console.error('Error al cargar mesas asignadas:', error);
    }
  }

  estaAsignada(number: number): boolean {
    return this.mesasAsignadas.some(mesa => mesa.mesaAsignada === number && mesa.asignada);
  }

  // Agrega el numero de mesa y el qr al cliente conectado, que tenga online en true
  async asignarNumeroMesa(number: number) {
    try {
      const ultimoPerfil = await this.clienteService.obtenerClienteEnListaEspera(true);
      if (ultimoPerfil) {
        console.log('Último perfil conectado:', ultimoPerfil);
        console.log('Último perfil conectado mail:', ultimoPerfil.email);

        if (ultimoPerfil.email && ultimoPerfil.mesaAsignada == 0) {
          ultimoPerfil.qrMesaAsignada = await this.generateQRCode(`${number}`);
          this.qrCodeImageUrl = ultimoPerfil.qrMesaAsignada;

          await this.clienteService.modificarMesaAsignada(ultimoPerfil.email, number, this.qrCodeImageUrl);
          console.log(`Número de mesa asignado: ${number}`);
        } else {
          console.error('El perfil conectado no tiene un correo electrónico o ya tiene una mesa asignada.');
        }
      } else {
        console.error('No se encontró ningún perfil conectado.');
      }
    } catch (error) {
      console.error('Error al asignar número al último perfil conectado:', error);
    }
  }


  //numero de mesa en nuemero
  getSelectedMesaNumero(): number {
    const value: string | null | undefined = this.form.get('asignarMesa')?.value;
    const selectedNumber = value !== null && value !== undefined ? parseInt(value, 10) : NaN;
    return selectedNumber;
  }

  //numero de mesa en string
  getSelectedMesaMensaje(): number | string {
    const value: string | null | undefined = this.form.get('asignarMesa')?.value;
    const selectedNumber = value !== null && value !== undefined ? parseInt(value, 10) : NaN;
    return isNaN(selectedNumber) ? 'Aún no hay mesa seleccionada' : selectedNumber;
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

  async onSubmit(): Promise<void> {
    if (this.form.valid) {
      try {

      } catch (error) {
        console.error('Error al asignar numero de mesa:', error);
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

  atras() {
    this.router.navigateByUrl('/home');
  }

  //genera código qr
  async generateQRCode(data: string): Promise<string> {
    try {
      return await QRCode.toDataURL(data);
    } catch (err) {
      console.error(err);
      return '';
    }
  }
}
