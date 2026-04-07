export interface BaseStatusResponse {
  statusCode: number;
  message: string;
  messages?: string[];
  success: boolean;
  value?: object;
}

export interface Enum {
  id: any;
  key: string;
  tipo: string;
  codigo: string;
  valor: number;
  nombre: string;
  orden: number;
  dataAux: string;
  esActivo: boolean;
}