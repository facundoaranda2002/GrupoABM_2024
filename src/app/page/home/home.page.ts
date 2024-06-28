import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonIcon,
  IonNavLink,
  IonAlert,
  ModalController,
  Platform,
  IonRow,
  IonCol,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { firstValueFrom } from 'rxjs';
import { BarcodeScanningModalComponent } from './barcode-scanning-modal.component';
import { BarcodeScanner, LensFacing } from '@capacitor-mlkit/barcode-scanning';
import { Usuario } from 'src/app/clases/usuario';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonCol,
    IonRow,
    IonAlert,
    IonNavLink,
    IonIcon,
    IonButtons,
    IonButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    BarcodeScanningModalComponent,
  ],
})
export class HomePage implements OnInit {
  //Injecciones
  auth = inject(AuthService);
  authService = inject(AuthService);
  router = inject(Router);

  profile: string = '';

  scanResoult = '';
  platform = inject(Platform);
  private modalController: ModalController = inject(ModalController);

  usuarioActual: any;

  constructor() {}

  ngOnInit() {
    setTimeout(() => {
      this.checkUserProfile();
    }, 2000);

    if (this.platform.is('capacitor')) {
      BarcodeScanner.isSupported().then();
      BarcodeScanner.checkPermissions().then();
      BarcodeScanner.removeAllListeners();
    }
    setTimeout(() => {
      this.estoyListaEspera();
    }, 2000);
  }
  //
  async checkUserProfile() {
    try {
      const currentUserEmail = await firstValueFrom(this.authService.actual());
      if (currentUserEmail) {
        const perfil = await this.authService.getUser(currentUserEmail);
        if (perfil) {
          this.profile = perfil;
          console.log('profile es: ', this.profile);
        } else {
          console.log('profile es 2: ', this.profile);
        }
      } else {
        console.log(this.authService.obtenerAnonimo());
      }
    } catch (error) {
      console.error('Error obteniendo perfil de usuario:', error);
    }
  }

  // Cliente Sala de espera
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
    }
  }
  async asignarSalaDeEspera() {
    await this.startScan();
    // Comprobar si el scan es correcto
    if (this.scanResoult == 'EntrarListaEspera') {
      // si es correcto compruevo que usuario esta (si es anonimo)
      let usuarioActual;
      if (this.authService.currentUserSig()?.email) {
        usuarioActual = await this.authService.getUserActual(
          this.authService.currentUserSig()?.email
        );
      } else {
        // logica si es anonimo
        usuarioActual = await this.authService.getUserActual(
          this.authService.obtenerAnonimo()
        );
      }
      const usuarioAux: Usuario = {
        mail: usuarioActual.mail,
        nombre: usuarioActual.nombre,
        apellido: usuarioActual.apellido,
        DNI: usuarioActual.DNI,
        foto: usuarioActual.foto,
        tipo: usuarioActual.tipo,
        qrDNI: usuarioActual.qrDNI,
        password: usuarioActual.password,
        perfil: usuarioActual.perfil,
        estaValidado: usuarioActual.estaValidado,
        listaDeEspera: true,
        mesaAsignada: usuarioActual.mesaAsignada,
        estadoEncuesta: usuarioActual.estadoEncuesta
      };
      this.authService
        .updateUsuarioCliente(usuarioActual.id, usuarioAux)
        .then(() => {
          console.log('modiificacion exitosa');
          this.estoyListaEspera();
        });
    } else {
      // Mensaje error de lector qr
    }
  }

  async estoyListaEspera() {
    // verifico si hay algun cliente
    if (
      this.authService.currentUserSig() ||
      this.authService.obtenerAnonimo()
    ) {
      let usuarioActual;
      if (this.authService.currentUserSig()?.email) {
        usuarioActual = await this.authService.getUserActual(
          this.authService.currentUserSig()?.email
        );
      } else {
        usuarioActual = await this.authService.getUserActual(
          this.authService.obtenerAnonimo()
        );
      }
      this.usuarioActual = usuarioActual;
    }
  }
  //Ruteo
  goRegister() {
    this.router.navigateByUrl('/register');
  }
  goLogin() {
    this.router.navigateByUrl('/login');
  }
  goHome() {
    this.router.navigateByUrl('/home');
  }
  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
    this.authService.removerAnonimo();
     // Limpiar el estado del componente
    this.profile = '';
    this.usuarioActual = null;
    this.scanResoult = '';
  }

  goRegisterTable() {
    this.router.navigateByUrl('/alta-mesa');
  }
  goRegisterClient() {
    this.router.navigateByUrl('/alta-cliente');
  }

  goRegisterMaitreAsignaMesa() {
    this.router.navigateByUrl('/maitre');
  }

  goAdminClientes() {
    this.router.navigateByUrl('/admin');
  }

  goEncuestas() {
    this.router.navigateByUrl('/encuesta');
  }

  goGraficos() {
    this.router.navigateByUrl('/graficos');
  }
}
