import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../service/auth.service';

export const logeadoGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  if (auth.currentUserSig()) {
    return true;
  } else {
    return false;
  }
};
