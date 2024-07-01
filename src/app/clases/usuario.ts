export class Usuario {
  mail: string = '';
  nombre: string = '';
  apellido: string = '';
  DNI: number = 0;
  foto: string = '';
  tipo: string = '';
  qrDNI: string = '';
  password: string = '';
  perfil: string = '';
  estaValidado: string = '';
  listaDeEspera: boolean = false;
  mesaAsignada: number = 0;/* JM Creó esto para que al crear un cliente anonimo este este campo*/
  estadoEncuesta: boolean = false;/*FA creo esto para saber si el cliente completó o no la encuesta*/
}
