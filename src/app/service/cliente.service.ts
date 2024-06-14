import { Injectable } from '@angular/core';
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
} from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Cliente } from '../clases/cliente';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private auth: AuthService
  ) {}

  AltaCliente(user: Cliente) {
    const coleccion = collection(this.firestore, 'Usuarios');
    const documento = doc(coleccion);
    const id = documento.id;
    user.id = id;
    let obj = JSON.parse(JSON.stringify(user));
    return setDoc(documento, obj);
  }
}
