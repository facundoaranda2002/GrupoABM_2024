import { inject, Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  ActionPerformed,
  PushNotifications,
  PushNotificationSchema,
  Token,
} from '@capacitor/push-notifications';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { StorageService } from './storage.service';
import { AuthService } from './auth.service';
import { Usuario } from '../clases/usuario';

export const FCM_TOKEN = 'push_notification_token';

@Injectable({
  providedIn: 'root',
})
export class FcmService {
  private _redirect = new BehaviorSubject<any>(null);
  authService = inject(AuthService);

  get redirect() {
    return this._redirect.asObservable();
  }

  constructor(private storage: StorageService) {}

  // Para encontrar el usuario actual
  usuarioActual: any | null = null;
  async checkDatosUsuarioActual() {
    try {
      const currentUserEmail = await firstValueFrom(this.authService.actual());
      if (currentUserEmail) {
        const usuario = await this.authService.getUserActualId(
          currentUserEmail
        );
        if (usuario.mesaAsignada != 0) {
          this.usuarioActual = usuario;
        }
      } else {
        if (this.authService.obtenerAnonimo()) {
          const usuario = await this.authService.getUserActualId(
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

  initPush() {
    if (Capacitor.getPlatform() !== 'web') {
      this.registerPush();
      // this.getDeliveredNotifications();
    }
  }
  async registrarToken() {
    if (Capacitor.getPlatform() !== 'web') {
      await PushNotifications.register();
    }
  }

  private async registerPush() {
    try {
      await this.addListeners();
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        throw new Error('User denied permissions!');
      }

      await PushNotifications.register();
    } catch (e) {
      console.log(e);
    }
  }

  async getDeliveredNotifications() {
    const notificationList =
      await PushNotifications.getDeliveredNotifications();
    console.log('delivered notifications', notificationList);
  }

  addListeners() {
    PushNotifications.addListener('registration', async (token: Token) => {
      this.checkDatosUsuarioActual().then(() => {
        if (this.usuarioActual) {
          this.usuarioActual.token = token.value;
          const { id, ...rest } = this.usuarioActual;
          this.authService.updateUsuario(this.usuarioActual.id, rest);
        }
      });

      console.log('My token: ', token);
      const fcm_token = token?.value;
      let go = 1;
      const saved_token = JSON.parse(
        (await this.storage.getStorage(FCM_TOKEN)).value
      );
      if (saved_token) {
        if (fcm_token == saved_token) {
          console.log('same token');
          go = 0;
        } else {
          go = 2;
        }
      }
      if (go == 1) {
        // save token
        this.storage.setStorage(FCM_TOKEN, JSON.stringify(fcm_token));
      } else if (go == 2) {
        // update token
        const data = {
          expired_token: saved_token,
          refreshed_token: fcm_token,
        };
        this.storage.setStorage(FCM_TOKEN, fcm_token);
      }
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      console.log('Error: ' + JSON.stringify(error));
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      async (notification: PushNotificationSchema) => {
        console.log('Push received: ' + JSON.stringify(notification));
        const data = notification?.data;
        if (data?.redirect) this._redirect.next(data?.redirect);
      }
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      async (notification: ActionPerformed) => {
        const data = notification.notification.data;
        console.log(
          'Action performed: ' + JSON.stringify(notification.notification)
        );
        console.log('push data: ', data);
        if (data?.redirect) this._redirect.next(data?.redirect);
      }
    );
  }

  async removeFcmToken() {
    try {
      const saved_token = JSON.parse(
        (await this.storage.getStorage(FCM_TOKEN)).value
      );
      this.storage.removeStorage(saved_token);
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}
