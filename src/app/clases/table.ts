type TipoMesa = 'VIP' | 'discapacitados' | 'estandar';

export class Table {
  numeroMesa: number = 0;
  comensales: number = 0;
  tipoMesa: TipoMesa = 'estandar';
  foto: string = '';
  qr: string = '';
  estaOcupada: boolean = false;
}
