import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'estado',
  standalone: true,
})
export class EstadoPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return '';
    }
    switch (value) {
      case 'pendiente':
        return 'Pendiente';
      case 'enProceso':
        return 'En Proceso';
      case 'entregado':
        return 'Entregado';
      case 'comiendo':
        return 'Comiendo';
      case 'terminado':
        return 'Terminado';
      case 'pagando':
        return 'Pagando';
      default:
        return value;
    }
  }
}
