import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { ClienteService } from 'src/app/service/cliente.service';
import { AuthService } from 'src/app/service/auth.service';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
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

  /*
  public async onUserClick(userName : string)
  {
    let user = await this.data.getUserByUserName(userName);

    console.log(user['id']);
    const modal = await this.modalController.create({
      component: UserInfoModalComponent,
      componentProps: {
        user: user,
      },
    });

    modal.onDidDismiss().then(async () => 
    {
      this.usersNotAccepted = await this.data.GetUsersNotAccepted();
    });
  
    await modal.present();
  }
    */

  volver() {
    this.router.navigateByUrl('/home');
  }
}
