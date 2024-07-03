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
type TipoMesa = 'VIP' | 'discapacitados' | 'estandar';

import * as QRCode from 'qrcode';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { BarcodeScanningModalComponent } from './barcode-scanning-modal.component';
import { BarcodeScanner, LensFacing } from '@capacitor-mlkit/barcode-scanning';
import { Usuario } from 'src/app/clases/usuario';
import { PedidoService } from 'src/app/service/pedido.service';
import { Pedido } from 'src/app/clases/pedido';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-maitre',
  templateUrl: './maitre.page.html',
  styleUrls: ['./maitre.page.scss'],
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
    BarcodeScanningModalComponent,
  ],
})
export class MaitrePage implements OnInit {
  // Inject
  platform = inject(Platform);
  router = inject(Router);
  tableService = inject(TableService);
  fb = inject(FormBuilder);
  elementRef = inject(ElementRef);
  photoService = inject(PhotoService);
  authService = inject(AuthService);
  clienteService = inject(ClienteService);
  modalController: ModalController = inject(ModalController);
  pedidoService = inject(PedidoService);
  http = inject(HttpClient);
  pedidos$: Observable<Pedido[]> | undefined;
  // Atributos
  usuarioAsignar?: any;
  isClientProfile: boolean = false;
  usuariosSinMesa: Usuario[] = [];
  qrCodeImageUrl: string | undefined;
  mesaAsignada: number | undefined; //esta variable la uso para mostrar la mesa asignada siendo cliente
  scanResoult = '';
  // numbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  numbers: number[] = [];
  mesasAsignadas: { mesaAsignada: number | undefined; asignada: boolean }[] =
    [];
  mesaYaAsignada: boolean = false; // Variable para controlar si la mesa ya está asignada, la usa cuando ingresa un cliente y escanea un qr asignado a otro cliente
  numeroMesaMaitre: number = 0; //sirve para mostrar el numero de mesa que asigna el maitre
  yaEscaneada: boolean = false;
  usuarioActual: Usuario | null = null;
  estadoEncuesta?: boolean = false;

  ngOnInit() {
    this.loadPedidos();
    this.numbers = this.generateNumbers(); // Genera los números disponibles
    this.loadMesasAsignadas();
    this.checkUserProfile();
    this.checkMesaAsignada();

    if (this.platform.is('capacitor')) {
      BarcodeScanner.isSupported().then();
      BarcodeScanner.checkPermissions().then();
      BarcodeScanner.removeAllListeners();
    }
    this.authService.getUsuarios().subscribe((data) => {
      this.usuariosSinMesa = data.filter((user) => {
        return (
          user.mesaAsignada == 0 &&
          user.perfil == 'cliente' &&
          user.listaDeEspera
        );
      });
    });

    this.estadoEncuesta = this.usuarioActual?.estadoEncuesta;
  }

  ionViewWillEnter() {
    this.checkUserProfile();
    this.checkMesaAsignada();
    this.estadoEncuesta = this.usuarioActual?.estadoEncuesta;
  }

  async onUserClick(mail: string) {
    let usuarioActual = await this.authService.getUserActual(mail);
    this.usuarioAsignar = usuarioActual;
  }

  form = this.fb.nonNullable.group({
    asignarMesa: [
      '',
      [Validators.required, Validators.min(1), Validators.max(10)],
    ],
  });

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
      console.log('MesaAsignada anonimo: ', this.mesaAsignada);
      // Extraer el número de mesa del texto del código QR
      const mesaNumero = this.extractMesaNumber(this.scanResoult);
      //const mesaNumero = 4; //esto para probar desde la pc, simula el dato devuelto del qr.
      //Comentar const mesaNumero = this.extractMesaNumber(this.scanResoult); para que funcione esta prueba
      this.yaEscaneada = true;
      //mesaAsignda es la mesa de la base
      // if (this.mesaAsignada !== parseInt(data?.barcode?.displayValue)) {
      if (this.mesaAsignada !== mesaNumero) {
        this.Toast.fire({
          icon: 'error',
          title: `Esta mesa la tiene asignada otro cliente, no la puede usar.`,
          color: '#ffffff',
        });
        this.router.navigateByUrl('/home');
        console.log(
          'El código QR escaneado no coincide con la mesa asignada al cliente.'
        );
        // Aquí podrías mostrar un mensaje de error o realizar alguna acción adicional.
        this.mesaYaAsignada = true;
      } else {
        this.Toast.fire({
          icon: 'success',
          title: 'Esta es su mesa asignada',
          color: '#ffffff',
        });

        console.log(
          'El código QR escaneado coincide con la mesa asignada al cliente.'
        );
        // Aquí podrías continuar con la lógica necesaria si el escaneo es correcto.
        this.mesaYaAsignada = false;
        // this.router.navigateByUrl('/menu-comidas');
        // this.recepcion = false;
      }
    }
  }
  goEncuesta() {
    this.router.navigateByUrl('/encuesta');
  }
  goMenu() {
    this.router.navigateByUrl('/menu-comidas');
  }

  // Método para extraer el número de mesa del texto del código QR
  extractMesaNumber(scanResult: string): number | null {
    const match = scanResult.match(/Mesa\s+(\d+)/i);
    return match ? parseInt(match[1], 10) : null;
  }

  //corrobora si el perfil actual es un cliente y si lo es muestra su mesa asignada
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
      } else {
        if (this.authService.obtenerAnonimo()) {
          const perfil = await this.authService.getUser(
            this.authService.obtenerAnonimo()
          );
          if (perfil === 'cliente') {
            this.isClientProfile = true;
            // await this.loadQrForClient(currentUserEmail);
            await this.loadMesaAsignada(this.authService.obtenerAnonimo());
          }
        }
      }
    } catch (error) {
      console.error('Error obteniendo perfil de usuario:', error);
    }
  }

  async checkMesaAsignada() {
    try {
      const currentUserEmail = await firstValueFrom(this.authService.actual());
      if (currentUserEmail) {
        const usuario = await this.authService.getUserActual(currentUserEmail);
        if (usuario.mesaAsignada != 0) {
          this.usuarioActual = usuario;
        }
      } else {
        if (this.authService.obtenerAnonimo()) {
          const usuario = await this.authService.getUserActual(
            this.authService.obtenerAnonimo()
          );
          if (usuario.mesaAsignada != 0) {
            this.usuarioActual = usuario;
          }
        }
      }
    } catch (error) {
      console.error('Error obteniendo perfil de usuario:', error);
    }
  }

  goChat() {
    this.router.navigateByUrl('/chat');
  }

  //carga la mesa asignada del usuario actual en mesaAsignada que debe ser cliente, trabaja con checkUserProfile()
  //mesaAsignada luego es usada en asignarNumeroMesa(number: number) para validar que sea == 0 y cargar su qr en la base
  async loadMesaAsignada(email: string | null) {
    try {
      const ultimoPerfil =
        // await this.clienteService.obtenerClienteEnListaEspera(true);
        await this.clienteService.obtenerClienteEnListaEspera(email);

      if (ultimoPerfil) {
        console.log('ultimoPerfil en loadMesaAsignada(): ', ultimoPerfil.email);
        console.log('mail de ultimoPerfil en loadMesaAsignada(): ', email);
      }

      if (ultimoPerfil && ultimoPerfil.email === email) {
        this.mesaAsignada = ultimoPerfil.mesaAsignada;
        console.log(' mesaAsignada en loadMesaAsignada(): ', this.mesaAsignada);
      } else {
        console.error(
          'No se encontró ningún perfil conectado o el email no coincide.'
        );
      }
    } catch (error) {
      console.error('Error al cargar QR para el cliente:', error);
    }
  }

  generateNumbers(): number[] {
    return [1, 2, 3, 4, 5]; // Números de mesa disponibles
  }

  //carga todas las mesas asignadas de la base en this.mesasAsignadas para trabajar con estaAsignada(number: number)
  // y bloquear las asignadas en la lista desplegable así ya no se pueden elegir
  async loadMesasAsignadas() {
    try {
      const mesas = await this.clienteService.obtenerMesasAsignadas();
      this.mesasAsignadas = mesas.map((mesa) => ({
        mesaAsignada: mesa.mesaAsignada,
        asignada: typeof mesa.mesaAsignada === 'number',
      }));
    } catch (error) {
      console.error('Error al cargar mesas asignadas:', error);
    }
  }

  //devuelve true si hay alguna mesa ya asignada a algun cliente para bloquear ese numero en la lista de mesas
  estaAsignada(number: number): boolean {
    return this.mesasAsignadas.some(
      (mesa) => mesa.mesaAsignada === number && mesa.asignada
    );
  }

  // Agrega el numero de mesa y el qr al cliente conectado, que tenga listaDeEspera en true
  async asignarNumeroMesa(number: number) {
    try {
      if (this.usuarioAsignar) {
        console.log(this.usuarioAsignar);
        if (this.usuarioAsignar.mail && this.usuarioAsignar.mesaAsignada == 0) {
          this.usuarioAsignar.qrMesaAsignada = await this.generateQRCode(
            `${number}`
          );
          this.qrCodeImageUrl = this.usuarioAsignar.qrMesaAsignada;

          await this.clienteService.modificarMesaAsignada(
            this.usuarioAsignar.mail,
            number,
            this.qrCodeImageUrl
          );
          console.log(`Número de mesa asignado: ${number}`);
          this.numeroMesaMaitre = number;

          this.Toast.fire({
            icon: 'success',
            title: `Número de mesa asignado: ${number}`,
            color: '#ffffff',
          });
        } else {
          this.Toast.fire({
            icon: 'error',
            title: 'El cliente ya tiene una mesa asignada.',
            color: '#ffffff',
          });
          console.error('El cliente ya tiene una mesa asignada.');
        }
      } else {
        this.Toast.fire({
          icon: 'error',
          title: 'El cliente no está en la lista de espera',
          color: '#ffffff',
        });
        console.error('El cliente no está en la lista de espera');
      }
    } catch (error) {
      this.Toast.fire({
        icon: 'error',
        title: 'Error al asignar número al perfil en lista de espera',
        color: '#ffffff',
      });
      console.error(
        'Error al asignar número al perfil en lista de espera:',
        error
      );
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

  // Carga los pedidos a pedidos$
  loadPedidos() {
    this.pedidos$ = this.pedidoService.getPedidos();
  }

  async cambiarEstadoPedido(pedido: Pedido) {
    // Verificar si pedido.id tiene un valor
    if (pedido.id) {
      pedido.estadoPedido = 'comiendo';
      try {
        // Llamar al servicio para actualizar el pedido en Firebase Firestore
        await this.pedidoService.updatePedido(pedido.id, pedido);

        // Mostrar el toast de éxito
        this.Toast.fire({
          icon: 'success',
          title: `Recepción Confirmada`,
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

  sendNotificationToRole(title: string, body: string, perfil: string) {
    const apiUrl = 'https://appiamb.onrender.com/notify-role';
    const payload = { title, body, perfil };
    console.log(payload);
    return this.http.post<any>(apiUrl, payload).subscribe((r) => {
      console.log(r);
    });
  }

  goCuenta() {
    this.router.navigateByUrl('/cuenta');
    this.sendNotificationToRole(
      'Cuenta solicitada',
      'Un cliente espera la cuenta',
      'mozo'
    );
  }
}
