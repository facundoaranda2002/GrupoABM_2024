import { Component, ElementRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ModalController,
  IonSelect,
  Platform,
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
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { ClienteService } from 'src/app/service/cliente.service';
import { PhotoService } from 'src/app/service/photo.service';
import { BarcodeScanner, LensFacing } from '@capacitor-mlkit/barcode-scanning';
import { BarcodeScanningModalComponent } from './barcode-scanning-modal.component';
import Swal from 'sweetalert2';
import { switchMap } from 'rxjs';
import { Cliente } from 'src/app/clases/cliente';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
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
    BarcodeScanningModalComponent,
  ],
})
export class RegisterPage implements OnInit {
  constructor() { }

  authService = inject(AuthService);
  router = inject(Router);
  elementRef = inject(ElementRef);
  fb = inject(FormBuilder);
  isToastOpen = false;
  platform = inject(Platform);
  clienteService = inject(ClienteService);
  photoService = inject(PhotoService);
  private modalController: ModalController = inject(ModalController);

  qrCodeImageUrl: string | undefined;
  nombreRegistrar: string = '';
  mailRegistrar: string = '';
  passwordRegistrar: string = '';
  scanResoult = '';

  ngOnInit() {
    if (this.platform.is('capacitor')) {
      BarcodeScanner.isSupported().then();
      BarcodeScanner.checkPermissions().then();
      BarcodeScanner.removeAllListeners();
    }

    this.authService.actual().subscribe((email) => {
      if (email) {
        console.log('Usuario logueado con email:', email);
        console.log(
          'Usuario logueado con this.authService.email:',
          this.authService.email
        );
      } else {
        console.log('Usuario deslogueado.');
      }
    });
  }

  cambiarTipo() { }

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
      this.form.patchValue({ DNI: this.scanResoult }); // Actualiza el campo DNI en el formulario
    }
  }

  form = this.fb.nonNullable.group({

    tipo: ['anonimo', Validators.required],
    mail: ['', [Validators.required, Validators.email]],
    nombre: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
    apellido: [''],
    DNI: [''],
    password: ['', Validators.required],
    foto: [''],


    // nombre: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
    // apellido: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
    // DNI: [
    //   '',
    //   [
    //     Validators.required,
    //     Validators.pattern('^[0-9]{8}$'),
    //     Validators.maxLength(8),
    //   ],
    // ],
    // foto: ['', Validators.required],
    // password: ['', Validators.required],
    // tipo: ['', Validators.required],
    // mail: ['', [Validators.required, Validators.email]],
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

    // Ajustar dinámicamente los validadores antes de verificar la validez del formulario
    const tipo = this.form.get('tipo')?.value;
    if (tipo === 'anonimo') {
      this.form.get('apellido')?.clearValidators();
      this.form.get('apellido')?.updateValueAndValidity();
      this.form.get('DNI')?.clearValidators();
      this.form.get('DNI')?.updateValueAndValidity();
      this.form.get('foto')?.clearValidators();
      this.form.get('foto')?.updateValueAndValidity();
    } else {
      this.form.get('apellido')?.setValidators([
        Validators.required,
        Validators.pattern('^[a-zA-Z ]*$'),
      ]);
      this.form.get('apellido')?.updateValueAndValidity();
      this.form.get('DNI')?.setValidators([
        Validators.required,
        Validators.pattern('^[0-9]{8}$'),
        Validators.maxLength(8),
      ]);
      this.form.get('DNI')?.updateValueAndValidity();
      this.form.get('foto')?.setValidators([Validators.required]);
      this.form.get('foto')?.updateValueAndValidity();
    }


    if (this.form.valid) {
      try {
        const cliente = await this.cargarCliente();
        if (cliente) {
          // Se guarda el cliente en la base de datos
          this.alta(cliente);
          this.Toast.fire({
            icon: 'success',
            title: 'Alta de cliente exitosa',
            color: '#ffffff',
          });
        } else {
          console.error('Error al crear el cliente.');
          this.Toast.fire({
            icon: 'error',
            title: 'Error al crear el cliente.',
            color: '#ffffff',
          });
        }
      } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error);
        this.Toast.fire({
          icon: 'error',
          title: 'Error al obtener el perfil del usuario.',
          color: '#ffffff',
        });
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
    this.authService
      .register(
        this.mailRegistrar,
        this.nombreRegistrar,
        this.passwordRegistrar
      )
      .pipe(
        switchMap(() => {
          // Una vez registrado, guarda los datos adicionales en Firestore
          return this.clienteService.AltaCliente(user);
        })
      )
      .subscribe({
        next: () => {
          // Éxito: ambas operaciones completadas correctamente
          console.log('Usuario registrado y datos guardados correctamente');
          // Aquí podrías mostrar un mensaje de éxito o redirigir a otra página
        },
        error: (error) => {
          // Manejo de errores
          console.error('Error al registrar usuario o guardar datos:', error);
          // Aquí podrías mostrar un mensaje de error al usuario
        },
      });
  }

  async takePhoto() {
    const photo = await this.photoService.addClientPhoto();
    if (photo && photo.name) {
      this.form.patchValue({ foto: photo.name });
    }
  }

  goRegister() {
    this.router.navigateByUrl('/register');
  }
  goLogin() {
    this.router.navigateByUrl('/login');
  }
  goHome() {
    this.router.navigateByUrl('/home');
  }
  goMenu() {
    this.router.navigateByUrl('/menu');
  }
  logout(): void {
    this.authService.logout();
  }
}
