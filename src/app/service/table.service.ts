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

import { Table } from '../clases/table';

import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TableService {
  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private auth: AuthService
  ) {}

  AltaMesa(user: Table) {
    const coleccion = collection(this.firestore, 'table');
    const documento = doc(coleccion);
    const id = documento.id;

    user.id = id;
    let obj = JSON.parse(JSON.stringify(user));

    return setDoc(documento, obj);
  }
}
