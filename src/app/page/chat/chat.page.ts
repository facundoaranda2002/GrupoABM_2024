import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton } from '@ionic/angular/standalone';
import { messageInterface, messageInterfaceId } from 'src/app/interface/message.interface';
import { AuthService } from 'src/app/service/auth.service';
import { Router } from '@angular/router';
import { ChatService } from 'src/app/service/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, ReactiveFormsModule, NgFor]
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

  form = this.fb.nonNullable.group({
    mensaje: ['', Validators.required],
  });

  enviarMensaje() {
    const value = this.form.getRawValue();
    if (this.form.valid && value.mensaje.length < 27) {
      let fecha = new Date();
      let message: messageInterface = {
        text: value.mensaje,
        userName: this.authService.currentUserSig()?.username || '',
        date: `${fecha.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })} - ${fecha.toLocaleTimeString()}`,
        dateOrder: fecha,
      };
      this.chat.saveMensaje(message);
      this.form.setValue({ mensaje: '' });
    }
  }
  agregarClase(username: string) {
    let cadena: string = '';
    if (
      this.authService.currentUserSig()?.username == username
    ) {
      cadena = 'enviado';
    } else {
      cadena = 'recibido';
    }

    return cadena;
  }
}
