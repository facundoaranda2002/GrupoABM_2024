import { Comida } from './comida';

export class Pedido {
  comidas: Comida[] = [];
  precioTotal: number = 0;
  tiempoTotalEstimado: number = 0;
  estadoPedido: string = '';
  id?: string;
  cliente: string = '';
  numeroMesa: number = 0;
}
