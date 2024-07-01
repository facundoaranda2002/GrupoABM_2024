import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from './service/auth.service';
import { Router } from '@angular/router';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { PasoUnaVezService } from 'src/app/service/paso-una-vez.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  authService = inject(AuthService);
  router = inject(Router);
  asoUnaVezService = inject(PasoUnaVezService);
  auth = inject(AuthService);
  showBlackScreen: boolean = false;

  constructor(private platform: Platform) {
    this.initializeApp();
  }

  initializeApp() {
    setTimeout(() => {
      this.platform.ready().then(() => {
        this.asoUnaVezService.pasoUnaVez = true;
        if (this.auth.currentUserSig() || this.auth.obtenerAnonimo()) {
          // this.router.navigateByUrl('/home');
        } else {
          // this.router.navigateByUrl('/login');
        }
      });
    }, 5000);
  }

  ngOnInit(): void {
    // this.router.navigateByUrl('/');
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.authService.currentUserSig.set({
          email: user.email!,
          username: user.displayName!,
        });
      } else {
        this.authService.currentUserSig.set(null);
      }
      console.log(this.authService.currentUserSig());
    });
  }
}
