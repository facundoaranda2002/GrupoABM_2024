import { Routes } from '@angular/router';
import { logeadoGuard } from './guard/logeado.guard';
import { pasoUnaVezGuard } from './guard/paso-una-vez.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./page/home/home.page').then((m) => m.HomePage),
    canActivate: [logeadoGuard],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./page/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./page/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: '',
    loadComponent: () =>
      import('./page/splash/splash.page').then((m) => m.SplashPage),
    canActivate: [pasoUnaVezGuard],
  },

  //esto para ir directo al home
  // {
  //   path: '',
  //   loadComponent: () => import('./page/maitre/maitre.page').then(m => m.MaitrePage),
  //   canActivate: [pasoUnaVezGuard],
  // },
  {
    path: 'alta-mesa',
    loadComponent: () =>
      import('./page/alta-mesa/alta-mesa.page').then((m) => m.AltaMesaPage),
    canActivate: [logeadoGuard],
  },
  {
    path: 'alta-cliente',
    loadComponent: () =>
      import('./page/alta-cliente/alta-cliente.page').then(
        (m) => m.AltaClientePage
      ),
  },
  {
    path: 'menu',
    loadComponent: () =>
      import('./page/menu/menu.page').then((m) => m.MenuPage),
  },
  {
    path: 'maitre',
    loadComponent: () => import('./page/maitre/maitre.page').then(m => m.MaitrePage)
  },
  {
    path: '**',
    redirectTo: 'home',
  },
  {
    path: 'maitre',
    loadComponent: () => import('./page/maitre/maitre.page').then(m => m.MaitrePage)
  },

];
