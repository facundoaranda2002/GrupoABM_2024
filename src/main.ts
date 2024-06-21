import { enableProdMode ,  InjectionToken} from '@angular/core';
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

export const TEST_DIALOG = new InjectionToken('TEST_DIALOG');

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
        projectId: 'ppsabm-1a5eb',
        appId: '1:281289826400:web:2464a5d247b327ff1f6305',
        storageBucket: 'ppsabm-1a5eb.appspot.com',
        apiKey: 'AIzaSyCAXNHPsnp00YhCanOtetVyCUZWZPO-sDA',
        authDomain: 'ppsabm-1a5eb.firebaseapp.com',
        messagingSenderId: '281289826400',

      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    { provide: TEST_DIALOG, useValue: 'test' }
  ],
});


