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
  writeBatch,
} from '@angular/fire/firestore';

import { Observable, from, of, BehaviorSubject } from 'rxjs';
import { UserInterface } from '../interface/user-interface';

import { map, switchMap } from 'rxjs/operators'; // Importa map
import { Usuario } from '../clases/usuario';
// import { ClienteService } from './cliente.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  firebaseAuth = inject(Auth);
  firestore = inject(Firestore);
  user$ = user(this.firebaseAuth);
  currentUserSig = signal<UserInterface | null | undefined>(undefined);
  email: string = '';
  // clienteService = inject(ClienteService);

  //Consigue el mail del usaurio actual
  actual(): Observable<string | null> {
    return this.user$.pipe(
      map((user) => (user ? user.email : null)) // Usa map para extraer el email o null si no hay usuario
    );
  }

  //Busco en la colección Usuarios si hay un mail cargado igual al que estoy usando para encontrar el perfil
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

  //Busco en la colección Usuarios si hay un mail cargado igual al que estoy usando para encontrarlo y retornarlo
  async getUserActual(email: string | undefined | null): Promise<any> {
    const usersCollection = collection(this.firestore, 'Usuarios');
    const q = query(usersCollection, where('mail', '==', email));
    const usersSnapshot = await getDocs(q);

    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      const userData = userDoc.data();
      return { ...userData, id: userDoc.id }; // Incluimos el ID del documento en el objeto retornado
    } else {
      return null; // Si no se encuentra el usuario, retornamos null
    }
  }

  register(email: string, password: string): Observable<UserCredential> {
    const promise = createUserWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    );
    return from(promise);
  }

  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
      /*agregue this.saveEmail(email); para guardar el mail con el que me logueo y poder cargar clientes*/
    ).then(() => {});
    return from(promise);
  }

  logout(): Observable<void> {
    const promise = signOut(this.firebaseAuth);
    return from(promise);
  }

  // Actualizar estado online y ultima conexión si el usuario tiene un perfil cliente
  private async updateUserOnlineStatus(
    email: string,
    online: string
  ): Promise<void> {
    const coleccion = collection(this.firestore, 'Usuarios');
    const q = query(coleccion, where('mail', '==', email));

    try {
      const perfil = await this.getUser(email);
      if (perfil === 'cliente') {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const documento = querySnapshot.docs[0].ref;

          const fechaHoraActual = new Date(); // Obtener la fecha y hora actual

          await updateDoc(documento, {
            online: online,
            ultimaConexion: fechaHoraActual,
          });
        } else {
          console.error(`Document with email ${email} does not exist.`);
          throw new Error(`Document with email ${email} does not exist.`);
        }
      } else {
        console.log(
          `El usuario con email ${email} no es un cliente, no se actualizó el estado online.`
        );
      }
    } catch (error) {
      console.error('Error updating online status:', error);
      throw error;
    }
  }

  //esto agrega el campo online en false a todos los usuarios
  async agregarCampoOnline(): Promise<void> {
    const coleccion = collection(this.firestore, 'Usuarios');
    const querySnapshot = await getDocs(coleccion);

    const batch = writeBatch(this.firestore);

    querySnapshot.forEach((doc) => {
      const docRef = doc.ref;
      batch.update(docRef, { online: 'false' });
      //este campo opcional agrega mesaAsignada en 0 a todos los usuarios
      // batch.update(docRef, { mesaAsignada: 0 });
    });

    try {
      await batch.commit();
      console.log('Campo "online" agregado a todos los usuarios exitosamente.');
    } catch (error) {
      console.error('Error al actualizar el estado "online":', error);
      throw error;
    }
  }

  updateUsuarioCliente(id: string, cliente: Usuario) {
    return updateDoc(this.document(id), { ...cliente });
  }
  private document(id: string) {
    const usersCollection = collection(this.firestore, 'Usuarios');
    return doc(usersCollection, `${id}`);
  }

  agregarAnonimo(mail: string) {
    localStorage.setItem('Mail', mail);
  }
  obtenerAnonimo() {
    if (localStorage.getItem('Mail')) {
      return localStorage.getItem('Mail');
    } else {
      return null;
    }
  }
  removerAnonimo() {
    if (localStorage.getItem('Mail')) {
      return localStorage.removeItem('Mail');
    } else {
      return null;
    }
  }
}
