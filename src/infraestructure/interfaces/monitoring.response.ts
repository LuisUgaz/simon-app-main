import {SiteResponse, SitesResponse} from './auth.response';
import { Enum } from './base.response';

export interface InstitutionResponse {
  codigoSede: string;
  codigoModular: string;
  anexo: string;
  nombre: string;
  tipoGestion: string;
  dscTipoGestion: string;
  nivel: string;
  descripcionNivel: string;
  direccion: string;
  codigoUbigeo: string;
  codigoIgel: string;
  codigoLocal: string;
  codigoDre: string;
  nombreDre: string;
  codigoUgel: string;
  nombreUgel: string;
}

export interface MonitoringPlanResponse {
  id: string;
  key: string;
  codigo: string;
  nombre: string;
  actores: any[];
  dre?: SitesResponse;
  ugel?: SitesResponse;
  ugels: SitesResponse[];
  sede: SitesResponse;
  periodo: number;
  descripcion: string;
  periodoMinimo: number;
  periodoMaximo: number;
  fechaInicio: Date;
  fechaFin: Date;
  esActivo: boolean;
  esCulminado: boolean;
  publicado: boolean;
  enuTipo: string;
  tipoDescripcion: string;
  idMarcoLogico: string;
  marcoLogicoNombre: string;
  marcoLogico: string;
  etapa: number;
  etapaDescripcion: string;
  modalidad: string;
  modalidadDescripcion: string;
}

export interface MonitoringInstrumentResponse {
  id: string;
  key: string;
  idPlanMonitoreo: string;
  enuMonitores: string[];
  enuMuestra: string;
  muestraDescripcion: string;
  enuTipo: string;
  tipoDescripcion: string;
  componente: string;
  resultado: string;
  indicador: string;
  aspectos: AspectResponse[];
  visitas: VisitResponse[];
  recursos: any[];
  esGia: boolean;
  enuTipoGia: null;
  tipoGiaDescripcion: null;
  codigo: string;
  nombre: string;
  etapa: number;
  etapaDescripcion: string;
  modalidad: string;
  modalidadDescripcion: string;
  nivel: string;
  nivelDescripcion: null;
  ciclo: string;
  cicloDescripcion: null;
  area: string;
  areaDescripcion: null;
  referencia: string;
  esActivo: boolean;
  inicioReglas: boolean;
  publicado: boolean;
  fechaCreacion: Date;
  aplicaTodosDocentes: boolean;
  esAutoevaluacionDelDocentes: boolean;
}

export interface AspectResponse {
  id: string;
  idComponente: string;
  idResultado: string;
  idIndicador: string;
  codigo: string;
  nombre: string;
  ponderado: number;
}

export interface VisitResponse {
  numeroVisita: number;
  codigo: string;
  fechaInicio: Date;
  fechaFin: Date;
  esAnulado: boolean;
}

export interface SampleResponse {
  idInstrumento: string;
  idTipoMuestra: string;
  tipoMuestraDescripcion: string;
  tipoDocumento: number;
  numeroDocumento: string;
  nombres: string;
  primerApellido: string;
  segundoApellido: string;
  sede: SitesResponse;
  dre: string;
  dreDescripcion: string;
  ugel: string;
  ugelDescripcion: string;
  idNivel: string;
  nivelDescripcion: string;
  red: number;
  redDescripcion?: string;
  codigoModular?: string;
  anexo?: string;
  iieeNombre?: string;
  enuTipoMonitor: string;
  tipoMonitorDescripcion: string;
  monitorTipoDocumento: number;
  monitorNumeroDocumento: string;
  monitorNombres: string;
  monitorPrimerApellido: string;
  monitorSegundoApellido: string;
  monitorSede: SitesResponse;
  visitas: VisitAnswerResponse[];
  esActivo: boolean;
  esAnulado: boolean;
  esReemplazado: boolean;
  reemplazo?: string;
  nombreCompleto: string;
  apellidos: string;
  id: string;
  key: string;
  fechaCreacion: Date;
  fechaModificacion: Date;
  usuarioCreacion?: string;
  usuarioModificacion?: string;
  inKey?: string;
}

export interface VisitAnswerResponse {
  id: string;
  idMuestra: string;
  numeroVisita: number;
  codigo: string;
  enuTipoVisita: string;
  tipoVisitaDescripcion?: string;
  enuEstado: string;
  aspectosCompletados?: string[];
  seEncontroSujetoDeMonitoreo: boolean;
  conReemplazo: boolean;
  esReprogramada: boolean;
  fechaProgramacion: Date;
  horaInicio: string;
  horaFin: string;
  datoAdicional?: string;
  esReintegroDeEjecucion: boolean;
  fechaInicioEjecucion?: Date;
  horaInicioEjecucion?: string;
  fechaCierreEjecucion?: Date;
  horaFinCierreEjecucion?: string;
  esAnulado: boolean;
  nombresAuxiliar?: string;
  primerApellidoAuxiliar?: string;
  segundoApellidoAuxiliar?: string;
  observacion?: string;
  compromisos?: string[];
  enuTipoMonitor: string;
  tipoMonitorDescripcion?: string;
  monitorTipoDocumento: number;
  monitorNumeroDocumento: string;
  monitorNombres: string;
  monitorPrimerApellido: string;
  monitorSegundoApellido: string;
  monitorSede?: SitesResponse;
  muestra?: NestedSampleResponse;
  instrumento?: NestedInstrumentResponse;
  plan?: NestedPlanResponse;
  errorEjecucion?: any;
  bitacora?: BitacoraVisita[];
}

export interface BitacoraVisita {
  tipoBitacora: string;
  seEncontroSujetoDeMonitoreo: boolean;
  comentario: string;
  reprogramado: boolean;
  tipoVisita: string; // presencial, virtual, telefónica
  linkReunion: string;
  fechaVisita: Date;
  // reprogramación
  tipoVisitaReprogramacion: Enum[];
  fechaVisitaReprogramacion?: Date;
  linkReunionReProgramacion: string;
  // datos de monitor
  enuTipoMonitor?: string;
  tipoMonitorDescripcion: string;
  monitorTipoDocumento: number;
  monitorNumeroDocumento: string;
  monitorNombres: string;
  monitorPrimerApellido: string;
  monitorSegundoApellido: string;
  monitorSede: SiteResponse;
  nombresAuxiliar: string;
  primerApellidoAuxiliar: string;
  segundoApellidoAuxiliar: string;
  // auditoria
  fechaCreacion: Date;
}

// Interfaces para estructuras anidadas en VisitAnswerResponse

export interface NestedSampleResponse {
  idInstrumento: string;
  idTipoMuestra: string;
  tipoMuestraDescripcion: string;
  tipoDocumento: number;
  numeroDocumento: string;
  nombres: string;
  primerApellido: string;
  segundoApellido: string;
  sede: {
    codigoSede: string;
    anexo: string;
    nombreSede: string;
    tipoSede: number;
    tipoSedeDescripcion: string;
  };
  dre: string;
  dreDescripcion: string;
  ugel: string;
  ugelDescripcion: string;
  idNivel: string;
  nivelDescripcion: string;
  red: number;
  redDescripcion?: string;
  codigoModular?: string;
  codigoLocal?: string;
  anexo?: string;
  iieeNombre?: string;
  enuTipoMonitor: string;
  tipoMonitorDescripcion: string;
  monitorTipoDocumento: number;
  monitorNumeroDocumento: string;
  monitorNombres: string;
  monitorPrimerApellido: string;
  monitorSegundoApellido: string;
  monitorSede: {
    codigoSede: string;
    anexo: string;
    nombreSede: string;
    tipoSede: number;
    tipoSedeDescripcion?: string;
  };
  visitas: NestedVisitResponse[];
  esActivo: boolean;
  esAnulado: boolean;
  esReemplazado: boolean;
  reemplazo?: string;
  id: string;
  key: string;
  fechaCreacion: Date;
  fechaModificacion?: Date;
  usuarioCreacion?: string;
  usuarioModificacion?: string;
  inKey?: string;
}

export interface NestedVisitResponse {
  idMuestra: string;
  numeroVisita: number;
  codigo: string;
  enuTipoVisita: string;
  tipoVisitaDescripcion?: string;
  enuEstado: string;
  aspectosCompletados?: string[];
  seEncontroSujetoDeMonitoreo: boolean;
  conReemplazo: boolean;
  esReprogramada: boolean;
  fechaProgramacion: Date;
  horaInicio: string;
  horaFin: string;
  datoAdicional?: string;
  esReintegroDeEjecucion: boolean;
  fechaInicioEjecucion?: Date;
  horaInicioEjecucion?: string;
  fechaCierreEjecucion?: Date;
  horaFinCierreEjecucion?: string;
  esAnulado: boolean;
  nombresAuxiliar?: string;
  primerApellidoAuxiliar?: string;
  segundoApellidoAuxiliar?: string;
  observacion?: string;
  compromisos?: string[];
  enuTipoMonitor: string;
  tipoMonitorDescripcion?: string;
  monitorTipoDocumento: number;
  monitorNumeroDocumento?: string;
  monitorNombres?: string;
  monitorPrimerApellido?: string;
  monitorSegundoApellido?: string;
  monitorSede?: SitesResponse;
  bitacora?: BitacoraVisita[];
  errorEjecucion?: any;
  id: string;
  key: string;
  fechaCreacion: Date;
  fechaModificacion?: Date;
  usuarioCreacion?: string;
  usuarioModificacion?: string;
  inKey?: string;
}

export interface NestedInstrumentResponse {
  version: number;
  idPlanMonitoreo: string;
  enuMonitores: string[];
  monitores: any[];
  enuMuestra: string;
  muestraDescripcion: string;
  enuTipo: string;
  tipoDescripcion: string;
  componente: string;
  resultado: string;
  indicador: string;
  aspectos: AspectResponse[];
  visitas: VisitResponse[];
  recursos: any[];
  esGia: boolean;
  enuTipoGia?: string;
  tipoGiaDescripcion?: string;
  codigo: string;
  nombre: string;
  etapa: number;
  etapaDescripcion: string;
  modalidad: string;
  modalidadDescripcion: string;
  nivel: string;
  nivelDescripcion?: string;
  ciclo: string;
  cicloDescripcion?: string;
  area: string;
  areaDescripcion?: string;
  referencia: string;
  esActivo: boolean;
  publicado: boolean;
  id: string;
  key: string;
  fechaCreacion: Date;
  fechaModificacion?: Date;
  usuarioCreacion?: string;
  usuarioModificacion?: string;
  inKey?: string;
  aplicaTodosDocentes: boolean;
  esAutoevaluacionDelDocentes: boolean;
}

export interface NestedPlanResponse {
  codigo: string;
  nombre: string;
  enuTipo: string;
  tipoDescripcion: string;
  dre?: SitesResponse;
  ugel?: SitesResponse;
  sede?: SitesResponse;
  ugels: SitesResponse[];
  actores: {
    id: string;
    codigo: string;
    valor: number;
    nombre: string;
  }[];
  idMarcoLogico: string;
  marcoLogicoNombre?: string;
  descripcion?: string;
  periodo: number;
  etapa: number;
  etapaDescripcion: string;
  modalidad: string;
  modalidadDescripcion: string;
  fechaInicio: Date;
  fechaFin: Date;
  esActivo: boolean;
  esCulminado: boolean;
  publicado: boolean;
  componentes: {
    id: string;
    codigo: string;
    nombre: string;
    resultados: {
      id: string;
      idComponente: string;
      codigo: string;
      nombre: string;
      indicadores: {
        id: string;
        idComponente: string;
        idResultado: string;
        codigo: string;
        nombre: string;
        aspectos: AspectResponse[];
      }[];
    }[];
  }[];
  id: string;
  key: string;
  fechaCreacion: Date;
  fechaModificacion?: Date;
  usuarioCreacion?: string;
  usuarioModificacion?: string;
  inKey?: string;
}

// Interfaces para Items de Instrumento por Aspecto

export interface ItemOptionResponse {
  code: string;
  title: string;
  withDescription: boolean;
  description: string;
  value: string;
  score: number;
  scoreMin: string | null;
  scoreMax: string | null;
  order: number;
  isCorrect: boolean;
  isOther: boolean;
  formart: string | null;
}

export interface ItemConfigurationResponse {
  multipleAswers: boolean;
  multipleOptions: boolean;
  instructions: boolean;
  typeOption: string;
  skipQuestion: boolean;
  otherOption: boolean;
  score: boolean;
  textArea: boolean;
  intervalScore: boolean;
}

export interface ItemResolveResponse {
  order: number;
  title: string;
  options: ItemOptionResponse[];
  withInstructions: boolean;
  instructions: string;
  withMultipleAnswers: boolean;
  withMultipleOptions: boolean;
  typeOption: string;
  withSkipQuestion: boolean;
  withOtherOption: boolean;
  isTextArea: boolean;
  withOnlyDate: boolean;
  formatOtherOption: string;
  withScore: boolean;
}

export interface ItemTypeResponse {
  type: string;
  name: string;
  configuration: ItemConfigurationResponse;
  resolve: ItemResolveResponse;
  answer: any;
}

export interface ItemRuleResponse {
  required: boolean;
  itsDependent: boolean;
  rules: any[];
}

export interface InstrumentItemResponse {
  id: string;
  idInstrumento: string;
  idItem: string;
  idAspecto: string;
  titulo: string;
  codigo: string;
  etiquetas: string[];
  orden: number;
  configuracion: ItemTypeResponse;
  reglas: ItemRuleResponse;
}