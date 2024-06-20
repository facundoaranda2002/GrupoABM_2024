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
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
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
  ],
})
export class HomePage implements OnInit {
  //Injecciones
  auth = inject(AuthService);
  authService = inject(AuthService);
  router = inject(Router);

  isClientProfile: boolean = false;

  constructor() {}

  ngOnInit() {
    this.checkUserProfile();
  }
  //
  async checkUserProfile() {
    try {
      const currentUserEmail = await firstValueFrom(this.authService.actual());
      console.log('currentUserEmail es: ', currentUserEmail);
      if (currentUserEmail) {
        const perfil = await this.authService.getUser(currentUserEmail);
        if (perfil === 'cliente') {
          this.isClientProfile = true;
          console.log('isClientProfile es: ', this.isClientProfile);
        }
        console.log('isClientProfile 2 es: ', this.isClientProfile);
      }
      console.log('isClientProfile es 3: ', this.isClientProfile);
    } catch (error) {
      console.error('Error obteniendo perfil de usuario:', error);
    }
  }

  //Form - Alert

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

  //Init - Destroy
  // ngOnInit() { }
}
