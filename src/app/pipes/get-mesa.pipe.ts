import { inject, Pipe, PipeTransform } from '@angular/core';
import { AuthService } from '../service/auth.service';

@Pipe({
  name: 'getMesa',
  standalone: true,
})
export class GetMesaPipe implements PipeTransform {
  authService = inject(AuthService);

  async transform(value: string) {
    const usuario = await this.authService.getUserActual(value);
    if (usuario) {
      return usuario.mesaAsignada;
    }
    return value;
  }
}
