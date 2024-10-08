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
  orderBy,
  limit,
  addDoc,
  QuerySnapshot,
  deleteDoc,
} from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { firstValueFrom, Observable } from 'rxjs';
import { UserInterface } from '../interface/user-interface';
import { Usuario } from '../clases/usuario';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private auth: AuthService
  ) {}

  AltaCliente(user: Usuario) {
    const coleccion = collection(this.firestore, 'Usuarios');
    const documento = doc(coleccion);
    let obj = JSON.parse(JSON.stringify(user));
    return setDoc(documento, obj);
  }

  //agrega el numero de mesa al cliente
  async modificarMesaAsignada(
    email: string,
    nuevaMesa: number,
    nuevoQrMesaAsignada: string | undefined
  ): Promise<void> {
    const coleccion = collection(this.firestore, 'Usuarios');
    const q = query(coleccion, where('mail', '==', email));

    try {
      const perfil = await this.authService.getUser(email);
      if (perfil === 'cliente') {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const documento = querySnapshot.docs[0].ref;

          const fechaHoraActual = new Date(); // Obtener la fecha y hora actual
          // const mesaAsignada1: nuevaMesa
          await updateDoc(documento, {
            mesaAsignada: nuevaMesa,
            qrMesaAsignada: nuevoQrMesaAsignada,
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

  //obtengo el perfil cliente con listaDeEspera true, estaValidado aceptado y mail que coincida
  // async obtenerClienteEnListaEspera(listaDeEspera: boolean): Promise<UserInterface | null> {
  async obtenerClienteEnListaEspera(
    email: string | null
  ): Promise<UserInterface | null> {
    const usuariosCollection = collection(this.firestore, 'Usuarios');
    const q = query(
      usuariosCollection,
      where('listaDeEspera', '==', true),
      where('perfil', '==', 'cliente'),
      where('estaValidado', '==', 'aceptado'),
      where('mail', '==', email),
      limit(1)
    );
    try {
      console.log('Query online:', q);

      const querySnapshot = await getDocs(q);
      console.log('Query Snapshot online:', querySnapshot);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        console.log('User Data online:', userData);
        // return userData as UserInterface;

        // Mapear mail a email ya que la interfaz tiene email pero la base mail
        if (userData['mail'] && !userData['email']) {
          userData['email'] = userData['mail'];
        }

        return userData as UserInterface;
      } else {
        console.error('No hay usuarios conectados.');
        return null;
      }
    } catch (error) {
      console.error('Error al obtener el último perfil conectado:', error);
      throw error;
    }
  }

  //obtengo todas la mesas asignadas
  async obtenerMesasAsignadas(): Promise<UserInterface[]> {
    const usuariosCollection = collection(this.firestore, 'Usuarios');
    const q = query(usuariosCollection);

    try {
      const querySnapshot = await getDocs(q);

      const usuarios: UserInterface[] = [];

      querySnapshot.forEach((doc) => {
        const userData = doc.data() as UserInterface;
        if (
          userData.mesaAsignada !== undefined &&
          userData.mesaAsignada !== 0
        ) {
          usuarios.push(userData);
        }
      });

      return usuarios;
    } catch (error) {
      console.error('Error obteniendo usuarios y mesas asignadas:', error);
      throw error;
    }
  }

  public async obtenerUsuariosPendientes(): Promise<any | null> {
    const userCollection = collection(this.firestore, 'Usuarios');
    const q = query(userCollection, where('estaValidado', '==', 'pendiente'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const users = querySnapshot.docs.map((doc) => doc.data());

    return users;
  }

  public async actualizarEstadoCliente(
    userUID: string,
    validado: string
  ): Promise<void> {
    const userCollection = collection(this.firestore, 'Usuarios');
    const docRef = doc(userCollection, userUID);

    await updateDoc(docRef, {
      estaValidado: validado,
    });
  }

  public async actualizarEstadoClienteEncuesta(
    userUID: string,
    encuesta: boolean
  ): Promise<void> {
    const userCollection = collection(this.firestore, 'Usuarios');
    const docRef = doc(userCollection, userUID);

    await updateDoc(docRef, {
      estadoEncuesta: encuesta,
    });
  }

  public async GetUserUIDByUserEmail(
    userEmail: string
  ): Promise<string | null> {
    const userCollection = collection(this.firestore, 'Usuarios');
    const q = query(userCollection, where('mail', '==', userEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }
    const userDoc = querySnapshot.docs[0];
    return userDoc.id;
  }

  public async saveEncuesta(encuestaData: any) {
    const encuestaCollection = collection(this.firestore, 'encuestas');
    const docRef = await addDoc(encuestaCollection, encuestaData);

    return docRef.id;
  }

  async getVotosComida(): Promise<number[]> {
    const encuestaCollection = collection(this.firestore, 'encuestas');

    // Realizar la consulta para obtener los datos de la colección 'encuestas'
    const q = query(
      encuestaCollection,
      where('comida', '>=', 1),
      where('comida', '<=', 5)
    );
    const querySnapshot: QuerySnapshot<any> = await getDocs(q);

    // Inicializar un array para contar los votos en cada categoría (1 al 5)
    const conteoVotos = [0, 0, 0, 0, 0];

    // Contar los votos en cada categoría
    querySnapshot.forEach((doc) => {
      const voto = doc.data().comida;
      if (voto >= 1 && voto <= 5) {
        conteoVotos[voto - 1]++;
      }
    });

    return conteoVotos;
  }

  async getVotosServicio() {
    const encuestaCollection = collection(this.firestore, 'encuestas');

    // Realizar la consulta para obtener los datos de la colección 'encuestas'
    const q = query(
      encuestaCollection,
      where('servicio', '>=', 1),
      where('servicio', '<=', 5)
    );
    const querySnapshot: QuerySnapshot<any> = await getDocs(q);

    // Inicializar un array para contar los votos en cada categoría (1 al 5)
    const conteoVotos = [
      { name: '1', value: 0 },
      { name: '2', value: 0 },
      { name: '3', value: 0 },
      { name: '4', value: 0 },
      { name: '5', value: 0 },
    ];

    // Contar los votos en cada categoría
    querySnapshot.forEach((doc) => {
      const voto = doc.data().servicio;
      if (voto >= 1 && voto <= 5) {
        conteoVotos[voto - 1]['value']++;
      }
    });

    const votosFiltrados = conteoVotos.filter((voto) => voto.value > 0);

    return votosFiltrados;
  }

  async getVotosPrecio(): Promise<number[]> {
    const encuestaCollection = collection(this.firestore, 'encuestas');

    // Realizar la consulta para obtener los datos de la colección 'encuestas'
    const q = query(
      encuestaCollection,
      where('precio', '>=', 1),
      where('precio', '<=', 5)
    );
    const querySnapshot: QuerySnapshot<any> = await getDocs(q);

    // Inicializar un array para contar los votos en cada categoría (1 al 5)
    const conteoVotos = [0, 0, 0, 0, 0];

    // Contar los votos en cada categoría
    querySnapshot.forEach((doc) => {
      const voto = doc.data().precio;
      if (voto >= 1 && voto <= 5) {
        conteoVotos[voto - 1]++;
      }
    });

    return conteoVotos;
  }

  public async getCuentaFromUser(userMail: string): Promise<any | null> {
    console.log('Mail' + userMail);
    const userCollection = collection(this.firestore, 'pedidos');
    const q = query(userCollection, where('cliente', '==', userMail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const pedidos = querySnapshot.docs.map((doc) => doc.data());

    return pedidos;
  }

  public async pagarCuenta(userMail: string, status: string, monto: number) {
    const EstadoPedidoCollection = collection(this.firestore, 'pedidos');
    const querySnapshot = await getDocs(
      query(EstadoPedidoCollection, where('cliente', '==', userMail))
    );
    const docRef = querySnapshot.docs[0].ref;
    await updateDoc(docRef, {
      estadoPedido: status,
      precioTotal: monto,
    });
  }

  public escucharConfirmacionMozo(userMail: string): Observable<any[]> {
    const userCollection = collection(this.firestore, 'pedidos');
    const q = query(userCollection, where('cliente', '==', userMail));

    return new Observable<any[]>((observer) => {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const users = querySnapshot.docs.map((doc) => doc.data());
        if (users == null) {
          observer.next(users);
        }
      });

      return () => unsubscribe();
    });
  }

  public async liberarMesa(userMail: string) {
    //Eliminar pedido.
    let userCollection = collection(this.firestore, 'pedidos');
    let q = query(userCollection, where('cliente', '==', userMail));
    let querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      querySnapshot.docs.forEach((doc) => {
        deleteDoc(doc.ref);
      });
    }

    //Eliminar al usuario de la mesa
    userCollection = collection(this.firestore, 'Usuarios');
    q = query(userCollection, where('mail', '==', userMail));
    querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const Doc = querySnapshot.docs[0];
      const DocRef = doc(userCollection, Doc.id);

      await updateDoc(DocRef, {
        estadoEncuesta: false,
        listaDeEspera: false,
        mesaAsignada: 0,
      });
    }
  }

  public getPedidosPorPagar(): Observable<any[]> {
    const userCollection = collection(this.firestore, 'pedidos');
    const q = query(userCollection, where('estadoPedido', '==', 'pagando'));

    return new Observable<any[]>((observer) => {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const users = querySnapshot.docs.map((doc) => doc.data());
        observer.next(users);
      });

      return () => unsubscribe();
    });
  }

  public async cambiarEstadoPedido(userMail: string, estado: string) {
    const EstadoPedidoCollection = collection(this.firestore, 'pedidos');
    const querySnapshot = await getDocs(
      query(EstadoPedidoCollection, where('cliente', '==', userMail))
    );
    const docRef = querySnapshot.docs[0].ref;
    await updateDoc(docRef, {
      estadoPedido: estado,
    });
  }
}
