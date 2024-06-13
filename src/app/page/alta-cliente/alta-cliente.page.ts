import { Component, OnInit, inject, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  ModalController, IonSelect,
  Platform,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonIcon,
  IonNavLink, IonItem, IonSelectOption, IonLabel,
  IonAlert, IonList, IonRow, IonGrid, IonCol, IonImg,
  IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonText, IonFabButton, IonFab, IonToast, IonFabList, IonInput
} from '@ionic/angular/standalone';

import { Cliente } from '../../clases/cliente';
import { ClienteService } from '../../service/cliente.service';
import { PhotoService, UserPhoto } from '../../service/photo.service';

import * as QRCode from 'qrcode';
import { firstValueFrom, switchMap } from 'rxjs';
import { Observer } from 'rxjs';
import Swal from 'sweetalert2'
import { BarcodeScanningModalComponent } from './barcode-scanning-modal.component';
import { BarcodeScanner, LensFacing } from '@capacitor-mlkit/barcode-scanning';

@Component({
  selector: 'app-alta-cliente',
  templateUrl: './alta-cliente.page.html',
  styleUrls: ['./alta-cliente.page.scss'],
  standalone: true,
  imports: [IonInput, IonFabList, IonToast, IonList, IonSelectOption, IonLabel,
    IonAlert, IonRow, IonGrid, IonItem, IonCol, IonImg, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonText, IonFabButton, IonFab,
    IonNavLink, IonSelect,
    IonIcon,
    IonButtons,
    IonButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    ReactiveFormsModule, BarcodeScanningModalComponent
  ],
})
export class AltaClientePage implements OnInit {


  scanResoult = '';

  platform = inject(Platform);
  router = inject(Router);
  clienteService = inject(ClienteService);
  fb = inject(FormBuilder);
  elementRef = inject(ElementRef);
  photoService = inject(PhotoService);
  authService = inject(AuthService);

  qrCodeImageUrl: string | undefined;
  nombreRegistrar: string = ""
  mailRegistrar: string = ""
  passwordRegistrar: string = ""

  private modalController: ModalController = inject(ModalController);

  ngOnInit(): void {
    if (this.platform.is('capacitor')) {
      BarcodeScanner.isSupported().then();
      BarcodeScanner.checkPermissions().then();
      BarcodeScanner.removeAllListeners();
    }

    this.authService.actual().subscribe(email => {
      if (email) {
        console.log('Usuario logueado con email:', email);
        console.log('Usuario logueado con this.authService.email:', this.authService.email);
      } else {
        console.log('Usuario deslogueado.');
      }
    });
  }

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
      this.form.patchValue({ DNI: this.scanResoult });  // Actualiza el campo DNI en el formulario
    }
  }

  form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    DNI: ['', Validators.required],
    foto: ['', Validators.required],
    password: ['', Validators.required],
    tipo: ['', Validators.required],
    mail: ['', Validators.required],
  });

  private Toast = Swal.mixin({
    toast: true,
    position: 'top',
    background: '#008b3c91',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })

  async onSubmit(): Promise<void> {
    if (this.form.valid) {
      try {
        const userEmail = this.authService.email;
        if (userEmail) {
          const perfil = await this.authService.getUser(userEmail);

          console.error('Perfil actual. ', perfil);

          if (perfil === 'cliente' || perfil === 'maitre' || perfil === 'admin') {
            const cliente = await this.cargarCliente();
            if (cliente) {
              // Se guarda el cliente en la base de datos
              this.alta(cliente);

              this.Toast.fire({
                icon: 'success',
                title: 'Alta de cliente exitosa',
                color: '#ffffff',
              })

            } else {
              console.error('Error al crear el cliente.');
              this.Toast.fire({
                icon: 'error',
                title: 'Error al crear el cliente.',
                color: '#ffffff',
              })
            }
          } else {
            console.error('Usuario no autorizado para realizar esta acción.');
            this.Toast.fire({
              icon: 'error',
              title: 'Usuario no autorizado para realizar esta acción.',
              color: '#ffffff',
            })
          }
        } else {
          console.error('No se pudo obtener el correo electrónico del usuario.');
          this.Toast.fire({
            icon: 'error',
            title: 'No se pudo obtener el correo electrónico del usuario.',
            color: '#ffffff',
          })
        }
      } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error);
        this.Toast.fire({
          icon: 'error',
          title: 'Error al obtener el perfil del usuario.',
          color: '#ffffff',
        })
      }
    } else {
      console.error('Formulario inválido');
      this.Toast.fire({ icon: 'error', title: "Ingrese los datos correctos!", color: '#ffffff' })
    }
  }

  async cargarCliente(): Promise<Cliente | null> {
    const value = this.form.getRawValue();
    const cliente = new Cliente();

    switch (value.tipo) {
      case 'anonimo':
        // cliente.perfil = value.perfil;
        cliente.tipo = value.tipo;
        cliente.nombre = value.nombre;
        cliente.foto = value.foto;
        cliente.password = value.password;
        cliente.mail = value.mail;

        this.nombreRegistrar = cliente.nombre;
        this.mailRegistrar = cliente.mail;
        this.passwordRegistrar = cliente.password;

        // Generar QR Code solo si es necesario
        //cliente.qrDNI = await this.generateQRCode(`${value.nombre}`); // Cambiar a lo que necesites para el QR de anónimo
        break;
      default:
        cliente.tipo = 'registrado';
        cliente.nombre = value.nombre;
        cliente.apellido = value.apellido;
        cliente.DNI = parseInt(value.DNI, 10);
        cliente.foto = value.foto;
        cliente.password = value.password;
        cliente.mail = value.mail;

        this.nombreRegistrar = cliente.nombre;
        this.mailRegistrar = cliente.mail;
        this.passwordRegistrar = cliente.password;

        // Generar QR Code
        //cliente.qrDNI = await this.generateQRCode(`${cliente.DNI}`);
        break;
    }

    // Set QR Code Image URL
    this.qrCodeImageUrl = cliente.qrDNI;

    // Get photo URL
    // this.photoUrl = await this.photoService.getPhotoUrl(value.foto);

    return cliente;
  }

  alta(user: Cliente) {

    // Registra al usuario en Firebase Authentication
    this.authService.register(this.mailRegistrar, this.nombreRegistrar, this.passwordRegistrar).pipe(
      switchMap(() => {
        // Una vez registrado, guarda los datos adicionales en Firestore
        return this.clienteService.AltaCliente(user);
      })
    ).subscribe({
      next: () => {
        // Éxito: ambas operaciones completadas correctamente
        console.log('Usuario registrado y datos guardados correctamente');
        // Aquí podrías mostrar un mensaje de éxito o redirigir a otra página
      },
      error: (error) => {
        // Manejo de errores
        console.error('Error al registrar usuario o guardar datos:', error);
        // Aquí podrías mostrar un mensaje de error al usuario
      }
    });
  }

  async takePhoto() {
    const photo = await this.photoService.addClientPhoto();
    if (photo && photo.name) {
      this.form.patchValue({ foto: photo.name });
    }
  }

  atras() {
    this.router.navigateByUrl('/home');
  }
}

