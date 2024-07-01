import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { MenuComida } from '../clases/menuComida';

const PATH = 'menu';

@Injectable({
  providedIn: 'root',
})
export class MenuComidaService {
  private _firestore = inject(Firestore);
  private _collection = collection(this._firestore, PATH);

  saveMenuComida(menuComida: MenuComida) {
    return addDoc(this._collection, { ...menuComida });
  }
  getMenuComidas() {
    return collectionData(this._collection, { idField: 'id' }) as Observable<
      MenuComida[]
    >;
  }
  async getMenuComidaId(id: string) {
    const q = query(this._collection, where('id', '==', id));
    const usersSnapshot = await getDocs(q);
    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      const userData = userDoc.data();
      return userData || null;
    } else {
      return null;
    }
  }
  updateMenuComida(id: string, menuComida: MenuComida) {
    const documet = doc(this._collection, id);
    return updateDoc(documet, { ...menuComida });
  }
  deleteMenuComida(id: string) {
    const documet = doc(this._collection, id);
    deleteDoc(documet);
  }
}
