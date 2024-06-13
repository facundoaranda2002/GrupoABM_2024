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

  constructor() { }

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

  //Init - Destroy
  ngOnInit() { }
}
