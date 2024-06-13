import { Usuario } from "./usuario";

export class Especialista extends Usuario {

  fotos: Array<any> = [];
  especialidades: any = [];
  cuentaValidadaEmail: boolean = false;
  cuentaHabilitada: boolean = false;
  tipo = "Especialista"

}
