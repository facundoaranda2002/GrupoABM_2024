import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, NavController, IonButton } from '@ionic/angular/standalone';
import { ClienteService } from 'src/app/service/cliente.service';

@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.page.html',
  styleUrls: ['./pagos.page.scss'],
  standalone: true,
  imports: [IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class PagosPage implements OnInit {

  public pagos : any;

  constructor(private navCtrl : NavController, private data : ClienteService) { }

  ngOnInit() 
  {
    this.data.getPedidosPorPagar().subscribe((x) =>
    {
      this.pagos = x;
    });
  }

  public async onBackClick()
  {
    this.navCtrl.back();
  }

  public async onAcceptClick(pedido : any)
  {
    await this.data.cambiarEstadoPedido(pedido.name, 'pagado');
  }

}
