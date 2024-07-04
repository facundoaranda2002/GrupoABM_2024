import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { ClienteService } from 'src/app/service/cliente.service';
import { AuthService } from 'src/app/service/auth.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BarcodeScanningModalComponent } from './barcode-scanning-modal.component';
import { BarcodeScanner, LensFacing } from '@capacitor-mlkit/barcode-scanning';

@Component({
  selector: 'app-cuenta',
  templateUrl: './cuenta.page.html',
  styleUrls: ['./cuenta.page.scss'],
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
export class CuentaPage implements OnInit {
  pedidos: any;
  total: number = 0;
  propina: number = 0;
  totalFinal: any;
  public pagando: boolean = false;
  usuarioActual: any;
  private modalController: ModalController = inject(ModalController);
  scanResoult = '';

  constructor(
    private data: ClienteService,
    private auth: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.checkUser();

    const rawPedidos = await this.data.getCuentaFromUser(
      this.usuarioActual.mail
    );

    const productosAgrupados: {
      [nombreProducto: string]: { cantidad: number; precio: number };
    } = {};

    rawPedidos.forEach((pedido: { comidas: any[] }) => {
      pedido.comidas.forEach(
        (comida: { nombre: string; precio: number; cantidad: number }) => {
          const nombreProducto = comida.nombre;
          const cantidad = comida.cantidad || 1; // Asumimos que cada 'comida' en la lista es una unidad
          const precio = comida.precio;

          if (productosAgrupados[nombreProducto]) {
            // Si el producto ya existe, actualizar la cantidad
            productosAgrupados[nombreProducto].cantidad += cantidad;
          } else {
            // Si el producto no existe, agregarlo al objeto
            productosAgrupados[nombreProducto] = { cantidad, precio };
          }
        }
      );
    });

    // Crear un nuevo array con la información agrupada
    this.pedidos = Object.keys(productosAgrupados).map((nombreProducto) => {
      const cantidad = productosAgrupados[nombreProducto].cantidad;
      const precioUnitario = productosAgrupados[nombreProducto].precio;
      const totalPorProducto = cantidad * precioUnitario;

      // Calcular el total general sumando el total de cada producto
      this.total += totalPorProducto;
      this.totalFinal = this.total;

      return {
        NombreProducto: nombreProducto,
        Cantidad: cantidad,
        Precio: precioUnitario,
        TotalPorProducto: totalPorProducto,
      };
    });
  }

  async checkUser() {
    if (this.auth.currentUserSig()) {
      this.usuarioActual = await this.auth.getUserActual(
        this.auth.currentUserSig()?.email
      );
    } else {
      console.log(this.auth.obtenerAnonimo());
      if (this.auth.obtenerAnonimo()) {
        this.usuarioActual = await this.auth.getUserActual(
          this.auth.obtenerAnonimo()
        );
        console.log(this.usuarioActual);
      }
    }
  }

  async onPagar() {
    await this.data.pagarCuenta(this.usuarioActual.mail, 'pagando', this.total);
    this.pagando = true;
    this.router.navigateByUrl('/home');
  }

  async darPropina() {
    this.total = this.totalFinal;
    await this.startScan();

    if (this.scanResoult == 'Excelente') {
      this.propina = this.total * 0.2;
      this.total += this.propina;
    } else if (this.scanResoult == 'Muy Bueno') {
      this.propina = this.total * 0.15;
      this.total += this.propina;
    } else if (this.scanResoult == 'Bueno') {
      this.propina = this.total * 0.1;
      this.total += this.propina;
    } else if (this.scanResoult == 'Regular') {
      this.propina = this.total * 0.05;
      this.total += this.propina;
    } else {
      this.propina = 0;
      this.total += this.propina;
    }
  }

  async startScan() {
    const modal = await this.modalController.create({
      component: BarcodeScanningModalComponent,
      cssClass: 'barcode-scanning-modal',
      showBackdrop: false,
      componentProps: {
        formats: [],
        lensfacing: LensFacing.Back,
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      this.scanResoult = data?.barcode?.displayValue;
    }
  }
}
