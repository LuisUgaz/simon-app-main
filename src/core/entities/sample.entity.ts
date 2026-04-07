import { Site } from './site.entity';

export interface Sample {
  idInstrument: string;
  idSampleType: string;
  sampleTypeDescription: string;
  documentType: number;
  documentNumber: string;
  firstName: string;
  lastName: string;
  middleName: string;
  site?: Site;
  dre: string;
  dreDescription: string;
  ugel: string;
  ugelDescription: string;
  idLevel: string;
  levelDescription: string;
  network: number;
  networkDescription?: string;
  modularCode?: string;
  anexo?: string;
  iieeName?: string;
  monitorType: string;
  monitorTypeDescription: string;
  monitorDocumentType: number;
  monitorDocumentNumber: string;
  monitorFirstName: string;
  monitorLastName: string;
  monitorMiddleName: string;
  monitorSite?: Site;
  visitType?: string;
  visitTypeDescription?: string;
  visits: VisitAnswer[];
  isActive: boolean;
  isCanceled: boolean;
  isReplaced: boolean;
  replacement?: string;
  fullName: string;
  lastNames: string;
  id: string;
  key: string;
  creationDate: Date;
  modificationDate?: Date;
  createdBy?: string;
  modifiedBy?: string;
  inKey?: string;
  autoReport?: boolean;
}

export interface Visit {
  id?: string | null;
  sampleId?: string;
  code: string;
  status: string;
  visitNumber: number;
  scheduledDate: Date;
  startTime: string;
  endTime: string;
  type: string;
  comment: string;
  isCanceled?: boolean;
}

export interface VisitAnswer {
  id: string;
  visitAnswerId?: string;
  sampleId: string;
  visitNumber: number;
  code: string;
  visitType: string;
  visitTypeDescription?: string;
  status: string;
  completedAspects?: string[];
  subjectFound: boolean;
  withReplacement: boolean;
  isRescheduled: boolean;
  scheduledDate: Date;
  startTime: string;
  endTime: string;
  additionalData?: string;
  isExecutionAdjustment: boolean;
  executionStartDate?: Date;
  executionStartTime?: string;
  executionEndDate?: Date;
  executionEndTime?: string;
  isCanceled: boolean;
  auxiliaryFirstName?: string;
  auxiliaryLastName?: string;
  auxiliaryMiddleName?: string;
  observation?: string;
  commitments?: string[];
  monitorType: string;
  monitorTypeDescription?: string;
  monitorDocumentType: number;
  monitorDocumentNumber: string;
  monitorFirstName: string;
  monitorLastName: string;
  monitorMiddleName: string;
  monitorSite?: Site;
  sample?: NestedSample;
  instrument?: NestedInstrument;
  plan?: NestedPlan;
  executionError?: any;
  binnacle?: BinnacleVisit[];
}

export interface BinnacleVisit {
  binnacleType: string;
  subjectFound: boolean;
  comment: string;
  rescheduled: boolean;
  visitType: string; // presential, virtual, phone
  meetingLink: string;
  visitDate: Date;
  // rescheduling
  reschedulingVisitType: any[];
  reschedulingVisitDate?: Date;
  reschedulingMeetingLink: string;
  // monitor data
  monitorType?: string;
  monitorTypeDescription: string;
  monitorDocumentType: number;
  monitorDocumentNumber: string;
  monitorFirstName: string;
  monitorLastName: string;
  monitorMiddleName: string;
  monitorSite: Site;
  auxiliaryFirstName: string;
  auxiliaryLastName: string;
  auxiliaryMiddleName: string;
  // audit
  creationDate: Date;
}

// Interfaces para estructuras anidadas en VisitAnswer

export interface NestedSample {
  idInstrument: string;
  idSampleType: string;
  sampleTypeDescription: string;
  documentType: number;
  documentNumber: string;
  firstName: string;
  lastName: string;
  middleName: string;
  site?: {
    code: string;
    anexo: string;
    name: string;
    type: number;
    typeDescription: string;
  };
  dre: string;
  dreDescription: string;
  ugel: string;
  ugelDescription: string;
  idLevel: string;
  levelDescription: string;
  network: number;
  networkDescription?: string;
  modularCode?: string;
  localCode?: string;
  anexo?: string;
  iieeName?: string;
  monitorType: string;
  monitorTypeDescription: string;
  monitorDocumentType: number;
  monitorDocumentNumber: string;
  monitorFirstName: string;
  monitorLastName: string;
  monitorMiddleName: string;
  monitorSite?: {
    code: string;
    anexo: string;
    name: string;
    type: number;
    typeDescription?: string;
  };
  visitType?: string;
  visitTypeDescription?: string;
  visits: NestedVisit[];
  isActive: boolean;
  isCanceled: boolean;
  isReplaced: boolean;
  replacement?: string;
  id: string;
  key: string;
  creationDate: Date;
  modificationDate?: Date;
  createdBy?: string;
  modifiedBy?: string;
  inKey?: string;
}

export interface NestedVisit {
  sampleId: string;
  visitNumber: number;
  code: string;
  visitType: string;
  visitTypeDescription?: string;
  status: string;
  completedAspects?: string[];
  subjectFound: boolean;
  withReplacement: boolean;
  isRescheduled: boolean;
  scheduledDate: Date;
  startTime: string;
  endTime: string;
  additionalData?: string;
  isExecutionAdjustment: boolean;
  executionStartDate?: Date;
  executionStartTime?: string;
  executionEndDate?: Date;
  executionEndTime?: string;
  isCanceled: boolean;
  auxiliaryFirstName?: string;
  auxiliaryLastName?: string;
  auxiliaryMiddleName?: string;
  observation?: string;
  commitments?: string[];
  monitorType: string;
  monitorTypeDescription?: string;
  monitorDocumentType: number;
  monitorDocumentNumber?: string;
  monitorFirstName?: string;
  monitorLastName?: string;
  monitorMiddleName?: string;
  monitorSite?: Site;
  binnacle?: BinnacleVisit[];
  executionError?: any;
  id: string;
  key: string;
  creationDate: Date;
  modificationDate?: Date;
  createdBy?: string;
  modifiedBy?: string;
  inKey?: string;
}

export interface NestedInstrument {
  version: number;
  monitoringPlanId: string;
  monitorsEnums: string[];
  monitors: any[];
  sampleEnum: string;
  sampleDescription: string;
  typeEnum: string;
  typeDescription: string;
  component: string;
  result: string;
  indicator: string;
  aspects: {
    id: string;
    componentId: string;
    resultId: string;
    indicatorId: string;
    code: string;
    name: string;
    weighted: number;
  }[];
  visits: {
    visitNumber: number;
    code: string;
    startDate: Date;
    endDate: Date;
    isCanceled: boolean;
  }[];
  resources: any[];
  isGia: boolean;
  giaTypeEnum?: string;
  giaTypeDescription?: string;
  code: string;
  name: string;
  stage: number;
  stageDescription: string;
  modality: string;
  modalityDescription: string;
  level: string;
  levelDescription?: string;
  cycle: string;
  cycleDescription?: string;
  area: string;
  areaDescription?: string;
  reference: string;
  isActive: boolean;
  published: boolean;
  id: string;
  key: string;
  creationDate: Date;
  modificationDate?: Date;
  createdBy?: string;
  modifiedBy?: string;
  inKey?: string;
}

export interface NestedPlan {
  code: string;
  name: string;
  enuType: string;
  typeDescription: string;
  dre?: Site;
  ugel?: Site;
  site?: Site;
  ugels: Site[];
  actors: {
    id: string;
    code: string;
    value: number;
    name: string;
  }[];
  idLogicalFramework: string;
  nameLogicalFramework?: string;
  description?: string;
  period: number;
  stage: number;
  stageDescription: string;
  mode: string;
  modeDescription: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isFinish: boolean;
  public: boolean;
  components: {
    id: string;
    code: string;
    name: string;
    results: {
      id: string;
      componentId: string;
      code: string;
      name: string;
      indicators: {
        id: string;
        componentId: string;
        resultId: string;
        code: string;
        name: string;
        aspects: {
          id: string;
          componentId: string;
          resultId: string;
          indicatorId: string;
          code: string;
          name: string;
          weighted: number;
        }[];
      }[];
    }[];
  }[];
  id: string;
  key: string;
  creationDate: Date;
  modificationDate?: Date;
  createdBy?: string;
  modifiedBy?: string;
  inKey?: string;
}

// Entidades para Items de Instrumento por Aspecto

export interface ItemOption {
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
  format: string | null;
}

export interface ItemConfiguration {
  multipleAnswers: boolean;
  multipleOptions: boolean;
  instructions: boolean;
  typeOption: string;
  skipQuestion: boolean;
  otherOption: boolean;
  score: boolean;
  textArea: boolean;
  intervalScore: boolean;
}

export interface ItemResolve {
  order: number;
  title: string;
  options: ItemOption[];
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

export interface ItemType {
  type: string;
  name: string;
  configuration: ItemConfiguration;
  resolve: ItemResolve;
  answer: any;
}

export interface OptionRule {
  code: string;
}

export interface Rule {
  codeQuestion: string;
  options: OptionRule[];
}

export interface ItemRule {
  required: boolean;
  itsDependent: boolean;
  rules: Rule[];
}

export interface InstrumentItem {
  id: string;
  instrumentId: string;
  itemId: string;
  aspectId: string;
  title: string;
  code: string;
  tags: string[];
  order: number;
  configuration: ItemType;
  rules: ItemRule;
}

// Interfaces en español para compatibilidad

export interface OpcionItem {
  codigo: string;
  titulo: string;
  conDescripcion: boolean;
  descripcion: string;
  valor: string;
  puntaje: number;
  puntajeMinimo: string | null;
  puntajeMaximo: string | null;
  orden: number;
  esCorrecto: boolean;
  esOtro: boolean;
  formato: string | null;
}

export interface ConfiguracionItem {
  respuestasMultiples: boolean;
  opcionesMultiples: boolean;
  instrucciones: boolean;
  tipoOpcion: string;
  saltarPregunta: boolean;
  opcionOtro: boolean;
  puntaje: boolean;
  areaTexto: boolean;
  intervaloPuntaje: boolean;
}

export interface ResolucionItem {
  orden: number;
  titulo: string;
  opciones: OpcionItem[];
  conInstrucciones: boolean;
  instrucciones: string;
  conRespuestasMultiples: boolean;
  conOpcionesMultiples: boolean;
  tipoOpcion: string;
  conSaltarPregunta: boolean;
  conOpcionOtro: boolean;
  esAreaTexto: boolean;
  conSoloFecha: boolean;
  formatoOpcionOtro: string;
  conPuntaje: boolean;
}

export interface TipoItem {
  tipo: string;
  nombre: string;
  configuracion: ConfiguracionItem;
  resolucion: ResolucionItem;
  respuesta: any;
}

export interface ReglaItem {
  requerido: boolean;
  esDependiente: boolean;
  reglas: any[];
}

export interface ItemInstrumento {
  id: string;
  idInstrumento: string;
  idItem: string;
  idAspecto: string;
  titulo: string;
  codigo: string;
  etiquetas: string[];
  orden: number;
  configuracion: TipoItem;
  reglas: ReglaItem;
}
