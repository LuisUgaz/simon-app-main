export interface AuthResponse {
  loginDate: string;
  fullName: string;
  token: string;
  refreshToken: string
  dataUser: {
    apellidoMaterno: string;
    apellidoPaterno: string;
    nombres: string;
    numeroDocumento: string;
    tipoDocumento: string;
  }
}

export interface JWTBody {
  APELLIDO_MATERNO: string;
  APELLIDO_PATERNO: string;
  ID_INICIO_SESION: string;
  ID_USUARIO: string;
  KV: string;
  NOMBRES: string;
  ULTIMO_INICIO_SESION: string;
  USUARIO_AUDITORIA: string;
  USUARIO_ID_TIPO_DOCUMENTO: string;
  USUARIO_NUMERO_DOCUMENTO: string;
  agw: string;
  aud: string;
  exp: number;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': string[];
  iss: string;
  rolPrincipal: string;
  rolesite: string[];
}

export interface RolesListResponse {
  menuResponses: {
    codigo: string;
    codigoModulo: string;
    idMenu: number;
    idMenuPadre: number;
    nivelMenu: number;
    nombreIcono: string;
    ordenMenu: number;
    urlMenu: string;
    valido: boolean;
  }[];
  rolUsuario: {
    anexo: string;
    codigoRol: string;
    codigoSede: string;
    encrypt: string;
    id: number;
    nombreRol: string;
    nombreSede: string;
    principal: boolean;
    tipoSede: string;
    tipoSedeIndice: number;
  }[];
}

export interface SitesResponse {
  codigoRol: string;
  codigoSede: string;
  anexo: string;
  encrypt: string;
  nombreRol: string;
  nombreSede: string;
  tipoSedeDescripcion?: null | string;
  principal: boolean;
  tipoSede: string | number;
  tipoSedeIndice: number;
}

export interface SiteResponse {
  codigoSede: string;
  anexo: string;
  nombreSede: string;
  tipoSede: string;
  tipoSedeIndice: number;
  tipoSedeDescripcion: string;
}