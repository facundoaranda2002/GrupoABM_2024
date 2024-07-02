export interface messageInterfaceId extends messageInterface {
  id: string;
}

export interface messageInterface {
  text: string;
  userName: string;
  date: string;
  dateOrder: any;
  mail: string;
}
