import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
} from '@ionic/angular/standalone';
import {
  messageInterface,
  messageInterfaceId,
} from 'src/app/interface/message.interface';
import { AuthService } from 'src/app/service/auth.service';
import { Router } from '@angular/router';
import { ChatService } from 'src/app/service/chat.service';
import { firstValueFrom } from 'rxjs';
import { Usuario } from 'src/app/clases/usuario';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgFor,
  ],
})
export class ChatPage implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  chat = inject(ChatService);
  fb = inject(FormBuilder);

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

  estaActivo = true;

  cambiarEstado() {
    this.estaActivo = !this.estaActivo;
  }

  messages?: messageInterfaceId[] = [];

  ngOnInit() {
    this.checkDatosUsuarioActual();
    this.chat.getMensajes().subscribe((messages) => {
      messages.sort((a, b) => {
        const timestampA =
          a.dateOrder.seconds * 1000 + a.dateOrder.nanoseconds / 1000000;
        const timestampB =
          b.dateOrder.seconds * 1000 + b.dateOrder.nanoseconds / 1000000;
        return timestampA - timestampB;
      });
      this.messages = messages;
    });
  }

  usuarioActual: Usuario | null = null;

  async checkDatosUsuarioActual() {
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

  form = this.fb.nonNullable.group({
    mensaje: ['', Validators.required],
  });

  enviarMensaje() {
    const value = this.form.getRawValue();
    if (this.form.valid && value.mensaje.length < 27) {
      let fecha = new Date();
      let nombreUsuario = '';
      let mailUsuario = '';
      if (this.usuarioActual != null) {
        nombreUsuario = this.usuarioActual.nombre;
        mailUsuario = this.usuarioActual.mail;
      }
      let message: messageInterface = {
        text: value.mensaje,
        userName: nombreUsuario,
        date: `${fecha.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })} - ${fecha.toLocaleTimeString()}`,
        dateOrder: fecha,
        mail: mailUsuario,
      };
      this.chat.saveMensaje(message);
      this.form.setValue({ mensaje: '' });
    }
  }
  agregarClase(mail: string) {
    let cadena: string = '';
    if (this.usuarioActual?.mail == mail) {
      cadena = 'enviado';
    } else {
      cadena = 'recibido';
    }

    return cadena;
  }
}
