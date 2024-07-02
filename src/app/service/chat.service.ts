import { Injectable, inject } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  Firestore,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { messageInterface, messageInterfaceId } from '../interface/message.interface';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  firestore = inject(Firestore);

  saveMensaje(message: messageInterface) {
    const col = collection(this.firestore, 'chat');
    return addDoc(col, message);
  }

  getMensajes(): Observable<messageInterfaceId[]> {
    const col = collection(this.firestore, 'chat');
    return collectionData(col, { idField: 'id' }) as Observable<
      messageInterfaceId[]
    >;
  }
}
