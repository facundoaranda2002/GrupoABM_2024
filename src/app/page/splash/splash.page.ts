import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { PasoUnaVezService } from 'src/app/service/paso-una-vez.service';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class SplashPage implements OnInit {
  router = inject(Router);
  auth = inject(AuthService);
  asoUnaVezService = inject(PasoUnaVezService);

  ngOnInit() {
    setTimeout(() => {
      this.asoUnaVezService.pasoUnaVez = true;
      if (this.auth.currentUserSig()) {
        this.router.navigateByUrl('/home');
      } else {
        this.router.navigateByUrl('/menu');
      }
    }, 4000);
  }
}
