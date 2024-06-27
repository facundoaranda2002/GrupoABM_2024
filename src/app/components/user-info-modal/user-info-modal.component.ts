import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ClienteService } from 'src/app/service/cliente.service';
import emailjs from '@emailjs/browser';

@Component({
  selector: 'app-user-info-modal',
  templateUrl: './user-info-modal.component.html',
  styleUrls: ['./user-info-modal.component.scss'],
})
export class UserInfoModalComponent implements OnInit {

  @Input() user: any;
  mensajes: any;
  constructor(private modalController: ModalController, private data: ClienteService) { }

  ngOnInit() {
    this.mensajes = ["Ha sido aceptado por un supervisor. Ahora su cuenta se encuentra registrada. Intente ingresar",
      "Lamentamos informarle que un supervisor a decidido rechazar su cuenta."]
  }

  public async onDecideClick(validated: boolean | null) {
    if (validated != null) {
      let userUID = await this.data.GetUserUIDByUserEmail(this.user.mail);
      let estaValidado;
      let template;
      if (validated)
        estaValidado = 'aceptado';
      else
        estaValidado = 'rechazado';
      if (userUID !== null)
        this.data.actualizarEstadoCliente(userUID, estaValidado)
      let mensaje = "";
      if (estaValidado === 'aceptado') {
        mensaje = this.mensajes[0];
        template = "template_8roq68a";
      }
      else {
        mensaje = this.mensajes[1];
        template = "template_qs6co4o";
      }
      emailjs.init("zy9ZbGaMjTB6ScJGM");
      await emailjs.send("service_ldf8519", template, {
        from_name: 'Grupo ABM',
        to_name: this.user.nombre,
        to_email: this.user.mail,
        subject: 'Estado de tu cuenta para el restaurante del grupo ABM',
        message: mensaje,
      });
    }

    this.modalController.dismiss();
  }

}
