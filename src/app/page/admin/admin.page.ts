import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular'; // Importa IonicModule y ModalController
import { ClienteService } from 'src/app/service/cliente.service';
import { AuthService } from 'src/app/service/auth.service';
import { Router } from '@angular/router';
import { UserInfoModalComponent } from 'src/app/components/user-info-modal/user-info-modal.component';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule, // Asegúrate de incluir IonicModule aquí
  ],
})
export class AdminPage implements OnInit {
  public usersNotAccepted: any[] = [];

  constructor(
    public data: ClienteService,
    public modalController: ModalController,
    private router: Router,
    private auth: AuthService
  ) {}

  async ngOnInit() {
    this.usersNotAccepted = await this.data.obtenerUsuariosPendientes();
  }

  public async onUserClick(mail: string) {
    let user = await this.auth.getUserActual(mail);
    console.log(user['id']);
    const modal = await this.modalController.create({
      component: UserInfoModalComponent,
      componentProps: {
        user: user,
      },
    });
    modal.onDidDismiss().then(async () => {
      this.usersNotAccepted = await this.data.obtenerUsuariosPendientes();
    });
    await modal.present();
  }

  volver() {
    this.router.navigateByUrl('/home');
  }
}
