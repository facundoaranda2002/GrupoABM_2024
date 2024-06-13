import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideFirebaseApp(() =>
      initializeApp({
        apiKey: "AIzaSyDTsUdrugIcwnk4cMQqeNZ0B1E3g1XxMTQ",
        authDomain: "miproyectopps.firebaseapp.com",
        projectId: "miproyectopps",
        storageBucket: "miproyectopps.appspot.com",
        messagingSenderId: "406636064141",
        appId: "1:406636064141:web:c165d60b168d0d650661c4"
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
  ],
});

// projectId: 'ppsabm-1a5eb',
//         appId: '1:281289826400:web:2464a5d247b327ff1f6305',
//         storageBucket: 'ppsabm-1a5eb.appspot.com',
//         apiKey: 'AIzaSyCAXNHPsnp00YhCanOtetVyCUZWZPO-sDA',
//         authDomain: 'ppsabm-1a5eb.firebaseapp.com',
//         messagingSenderId: '281289826400',
