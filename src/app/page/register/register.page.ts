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
import { Usuario } from 'src/app/clases/usuario';

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
  constructor() {}

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
  mailRegistrar: string = '';
  passwordRegistrar: string = '';
  scanResult = '';

  private nombres: string[] = [
    'juan',
    'maria',
    'pedro',
    'laura',
    'carlos',
    'ana',
    'luis',
    'jose',
    'sofia',
    'elena',
  ];
  private dominios: string[] = [
    'example.com',
    'correo.com',
    'mail.com',
    'test.com',
    'demo.com',
    'prueba.com',
  ];

  ngOnInit() {
    // Permisos
    if (this.platform.is('capacitor')) {
      BarcodeScanner.isSupported().then();
      BarcodeScanner.checkPermissions().then();
      BarcodeScanner.removeAllListeners();
    }
  }
  // Scanea
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
      // this.scanResoult = data?.barcode?.displayValue;
      this.scanResult =
        data?.barcode?.displayValue || 'No se pudo escanear el DNI';

      // LLamo a parseScanResult para separar y luego asignar esos valores a patchValue
      const { apellido, nombre, dni } = this.parseScanResult(this.scanResult);
      this.form.patchValue({ apellido, nombre, DNI: dni });

      // this.form.patchValue({ DNI: this.scanResult });
    }
  }

  // Separa y devuelve el nombre, apellido, DNI del string devuelto por el qr de DNI
  parseScanResult(scanResult: string): {
    apellido: string;
    nombre: string;
    dni: string;
  } {
    const parts = scanResult.split('@');
    const apellido = parts[1];
    const nombre = parts[2];
    const dni = parts[4];

    return { apellido, nombre, dni };
  }
  // Form
  form = this.fb.nonNullable.group({
    tipo: ['anonimo', Validators.required],
    mail: ['', [Validators.required, Validators.email]],
    nombre: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
    apellido: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
    DNI: [
      '',
      [
        Validators.required,
        Validators.pattern('^[0-9]{8}$'),
        Validators.maxLength(8),
      ],
    ],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmpassword: ['', [Validators.required]],
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
    // Ajustar dinámicamente los validadores antes de verificar la validez del formulario
    const tipo = this.form.get('tipo')?.value;
    if (tipo === 'anonimo') {
      this.form.get('apellido')?.clearValidators();
      this.form.get('apellido')?.updateValueAndValidity();
      this.form.get('DNI')?.clearValidators();
      this.form.get('DNI')?.updateValueAndValidity();
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
      this.form.get('mail')?.clearValidators();
      this.form.get('mail')?.updateValueAndValidity();
      this.form.get('confirmpassword')?.clearValidators();
      this.form.get('confirmpassword')?.updateValueAndValidity();
    }

    if (this.form.valid) {
      if (
        (tipo == 'registrado' &&
          this.form.getRawValue().confirmpassword ==
            this.form.getRawValue().password) ||
        tipo == 'anonimo'
      ) {
        try {
          const cliente = await this.cargarCliente();
          if (cliente) {
            // Se guarda el cliente en la base de datos
            if (this.form.getRawValue().tipo == 'anonimo') {
              this.altaAnonimo(cliente).then(() => {});
              this.authService.agregarAnonimo(cliente.mail);
              this.router.navigateByUrl('/home');
            } else {
              this.alta(cliente);
              this.router.navigateByUrl('/login');
            }

            this.Toast.fire({
              icon: 'success',
              title: 'Alta de cliente exitosa',
              color: '#ffffff',
            });
            this.authService.logout();
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
        this.Toast.fire({
          icon: 'error',
          title: 'Las contraseñas no coiciden.',
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

  async cargarCliente(): Promise<Usuario | null> {
    const value = this.form.getRawValue();
    const cliente = new Usuario();
    switch (value.tipo) {
      case 'anonimo':
        cliente.mail = this.generarEmailAleatorio();
        cliente.nombre = value.nombre;
        cliente.apellido = '';
        cliente.DNI = 0;
        cliente.foto = await this.photoService.getPhotoUrlClient(value.foto);
        cliente.tipo = value.tipo;
        cliente.qrDNI = '';
        cliente.password = '';
        cliente.perfil = 'cliente';
        cliente.estaValidado = 'aceptado';
        cliente.listaDeEspera = false;
        cliente.mesaAsignada = 0;
        cliente.estadoEncuesta = false;
        break;
      default:
        cliente.mail = value.mail;
        cliente.nombre = value.nombre;
        cliente.apellido = value.apellido;
        cliente.DNI = parseInt(value.DNI, 10);
        cliente.foto = await this.photoService.getPhotoUrlClient(value.foto);
        cliente.tipo = value.tipo;
        cliente.qrDNI = '';
        cliente.password = value.password;
        cliente.perfil = 'cliente';
        cliente.estaValidado = 'pendiente';
        cliente.listaDeEspera = false;
        cliente.mesaAsignada = 0; /* JM Creó esto para que al crear un cliente anonimo este este campo*/
        cliente.estadoEncuesta = false;
        // Carga Register
        this.mailRegistrar = cliente.mail;
        this.passwordRegistrar = cliente.password;
        break;
    }
    // Set QR Code Image URL
    this.qrCodeImageUrl = cliente.qrDNI;
    // Get photo URL
    // this.photoUrl = await this.photoService.getPhotoUrl(value.foto);
    return cliente;
  }

  alta(user: Usuario) {
    // Registra al usuario en Firebase Authentication
    this.authService
      .register(this.mailRegistrar, this.passwordRegistrar)
      .pipe(
        switchMap(() => {
          // Una vez registrado, guarda los datos adicionales en Firestore
          return this.clienteService.AltaCliente(user);
        })
      )
      .subscribe({
        next: () => {
          // Éxito: ambas operaciones completadas correctamente
          this.authService.logout();
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
  altaAnonimo(user: Usuario) {
    return this.clienteService
      .AltaCliente(user)
      .then(() => {
        console.log('Alta ok');
      })
      .catch(() => {
        console.log('No Alta ok');
      });
  }

  async takePhoto() {
    const photo = await this.photoService.addClientPhoto();
    if (photo && photo.name) {
      this.form.patchValue({ foto: photo.name });
      this.Toast.fire({
        icon: 'success',
        title: 'Foto Subida',
        color: '#ffffff',
      });
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
  logout(): void {
    this.authService.logout();
  }

  generarEmailAleatorio(): string {
    const nombre =
      this.nombres[Math.floor(Math.random() * this.nombres.length)];
    const dominio =
      this.dominios[Math.floor(Math.random() * this.dominios.length)];
    const numero = Math.floor(1000 + Math.random() * 9000).toString(); // Genera un número de 4 dígitos

    return `${nombre}${numero}@${dominio}`;
  }
}
