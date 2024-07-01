import { Routes } from '@angular/router';
import { logeadoGuard } from './guard/logeado.guard';
import { pasoUnaVezGuard } from './guard/paso-una-vez.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./page/home/home.page').then((m) => m.HomePage),
    // canActivate: [logeadoGuard],
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
    path: 'maitre',
    loadComponent: () =>
      import('./page/maitre/maitre.page').then((m) => m.MaitrePage),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./page/admin/admin.page').then((m) => m.AdminPage),
  },
  {
    path: 'menu-comidas',
    loadComponent: () =>
      import('./page/menu-comidas/menu-comidas.page').then(
        (m) => m.MenuComidasPage
      ),
  },
  {
    path: '**',
    redirectTo: 'home',
  },  {
    path: 'carrito-compras',
    loadComponent: () => import('./page/carrito-compras/carrito-compras.page').then( m => m.CarritoComprasPage)
  },

<<<<<<< HEAD
];
=======
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
    path: 'maitre',
    loadComponent: () =>
      import('./page/maitre/maitre.page').then((m) => m.MaitrePage),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./page/admin/admin.page').then((m) => m.AdminPage),
  },
  {
    path: 'encuesta',
    loadComponent: () => import('./page/encuesta/encuesta.page').then(m => m.EncuestaPage)
  },
  {
    path: 'graficos',
    loadComponent: () => import('./page/graficos/graficos.page').then(m => m.GraficosPage)
  },
  {
    path: '**',
    redirectTo: 'home',
  },




];
>>>>>>> 7f12c4b6ba4ea1c6b8608a3a9517e77fe7940c8e
