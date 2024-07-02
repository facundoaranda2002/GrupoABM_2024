import { Comida } from './comida';

export class Pedido {
  comidas: Comida[] = [];
  precioTotal: number = 0;
  tiempoTotalEstimado: string = '';
  estadoPedido: string = '';
  id?: string;
  cliente: string = '';
}
