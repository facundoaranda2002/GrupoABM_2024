import { Injectable, inject, signal } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  UserCredential,
} from 'firebase/auth';

import {
  Firestore,
  Unsubscribe,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  DocumentData,
  where,
} from '@angular/fire/firestore';

import { Observable, from, of, BehaviorSubject } from 'rxjs';
import { UserInterface } from '../interface/user-interface';

import { map, switchMap } from 'rxjs/operators'; // Importa map
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  firebaseAuth = inject(Auth);
  firestore = inject(Firestore);
  user$ = user(this.firebaseAuth);
  currentUserSig = signal<UserInterface | null | undefined>(undefined);
  email: string = '';

  //Consigue el mail del usaurio actual
  actual(): Observable<string | null> {
    return this.user$.pipe(
      map((user) => (user ? user.email : null)) // Usa map para extraer el email o null si no hay usuario
    );
  }

  private saveEmail(email: string) {
    this.email = email; // Guardar el correo electrónico en la propiedad
  }

  //Busco en la colecció Usuarios si hay un mail cargado igual al que estoy usando para encontrar el perfil
  async getUser(email: string): Promise<string | null> {
    const usersCollection = collection(this.firestore, 'Usuarios');
    const q = query(usersCollection, where('mail', '==', email)); // Declaramos explícitamente el tipo de la consulta
    const usersSnapshot = await getDocs(q);
    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      const userData = userDoc.data();
      return userData['perfil'] || null;
    } else {
      return null;
    }
  }

  register(
    email: string,
    username: string,
    password: string
  ): Observable<void> {
    const promise = createUserWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    ).then((r) => updateProfile(r.user, { displayName: username }));
    return from(promise);
  }

  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
      /*agregue this.saveEmail(email); para guardar el mail con el que me logueo y poder cargar clientes*/
    ).then(() => {
      this.saveEmail(email);
    });
    return from(promise);
  }

  logout(): Observable<void> {
    const promise = signOut(this.firebaseAuth);
    return from(promise);
  }
}
