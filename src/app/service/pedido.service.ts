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
import { Pedido } from '../clases/pedido';
import { Comida } from '../clases/comida';

const PATH = 'pedidos';

@Injectable({
  providedIn: 'root',
})
export class PedidoService {
  comidasPedidos: Comida[] = [];

  private _firestore = inject(Firestore);
  private _collection = collection(this._firestore, PATH);

  savePedido(pedido: Pedido) {
    return addDoc(this._collection, { ...pedido });
  }
  getPedidos() {
    return collectionData(this._collection, { idField: 'id' }) as Observable<
      Pedido[]
    >;
  }
  async getTurno(id: string) {
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
  updatePedido(id: string, pedido: Pedido) {
    const documet = doc(this._collection, id);
    return updateDoc(documet, { ...pedido });
  }
  deletePedido(id: string) {
    const documet = doc(this._collection, id);
    deleteDoc(documet);
  }

  agregarComida(comida: Comida): void {
    const comidaExistente = this.comidasPedidos.find(
      (c) => c.nombre.toLowerCase() === comida.nombre.toLowerCase()
    );
    if (comidaExistente) {
      comidaExistente.cantidad += comida.cantidad;
    } else {
      this.comidasPedidos.push({ ...comida });
    }
  }

  eliminarComida(comida: Comida): void {
    const comidaExistente = this.comidasPedidos.find(
      (c) => c.nombre.toLowerCase() === comida.nombre.toLowerCase()
    );
    if (comidaExistente) {
      if (comidaExistente.cantidad > 1) {
        comidaExistente.cantidad -= 1;
      } else {
        const index = this.comidasPedidos.indexOf(comidaExistente);
        if (index > -1) {
          this.comidasPedidos.splice(index, 1);
        }
      }
    }
  }
  eliminarTodoComida(comida: Comida): void {
    const comidaExistente = this.comidasPedidos.find(
      (c) => c.nombre.toLowerCase() === comida.nombre.toLowerCase()
    );
    if (comidaExistente) {
      const index = this.comidasPedidos.indexOf(comidaExistente);
      if (index > -1) {
        this.comidasPedidos.splice(index, 1);
      }
    }
  }

  calcularPrecioTotal(): number {
    return this.comidasPedidos.reduce(
      (total, comida) => total + comida.precio * comida.cantidad,
      0
    );
  }

  contarTotalCantidad(): number {
    return this.comidasPedidos.reduce(
      (total, comida) => total + comida.cantidad,
      0
    );
  }
}
