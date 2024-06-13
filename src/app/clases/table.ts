// import { Usuario } from "./usuario";

// export class Paciente extends Usuario {

type TipoMesa = 'VIP' | 'discapacitados' | 'estandar';

export class Table {


  id?: string;
  numeroMesa: number = 0;
  comensales: number = 0;
  tipoMesa: TipoMesa = "estandar";
  // foto: Array<any> = [];
  foto: string = "";
  qr: string = "";


  // obraSocial?:any;
  // fotos:Array<any> = [];
  // cuentaValidadaEmail:boolean = false;
  // tipo = "Paciente"

}
