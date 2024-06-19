export interface UserInterface {
  email: string;
  username: string;
  // Incluido temporalmente para facilitar el mapeo, esto está hecho porque difieren los nombres del correo,
  // en la base se llama mail y acá email, para no cambiar en todos lados hice esto.
  mail?: string;
  //agrego para conseguir ocionalmente el qr de la mesa asignada
  qrMesaAsignada?: string;
  //es el numero de la mesa asignada
  mesaAsignada?: number;
}
