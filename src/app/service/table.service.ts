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
  where,
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
    let obj = JSON.parse(JSON.stringify(user));

    return setDoc(documento, obj);
  }

  async getTable(email: string): Promise<any> {
    const usersCollection = collection(this.firestore, 'table');
    const q = query(usersCollection, where('mail', '==', email)); // Declaramos explícitamente el tipo de la consulta
    const usersSnapshot = await getDocs(q);
    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      const userData = userDoc.data();
      return userData || null;
    } else {
      return null;
    }
  }
}
