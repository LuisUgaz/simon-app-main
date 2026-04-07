export interface User {
  id: string;
  sessionId: string;
  names: string;
  fullName: string;
  firstLastName: string;
  secondLastName: string;
  idDocumentType: string;
  documentNumber: string;
  mainRole: string;
  rolesite?: {code: string; anexo: string}[];
  lastSession: string;
  loginDate: string;
}
