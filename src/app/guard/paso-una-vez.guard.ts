import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { PasoUnaVezService } from '../service/paso-una-vez.service';

export const pasoUnaVezGuard: CanActivateFn = (route, state) => {
  const asoUnaVezService = inject(PasoUnaVezService);
  console.log(asoUnaVezService.pasoUnaVez);
  return !asoUnaVezService.pasoUnaVez;
};
