export interface MonitoringInstrument {
  id: string;
  key: string;
  monitoringPlanId: string;
  monitorsEnums: string[];
  sampleEnum: string;
  sampleDescription: string;
  typeEnum: string;
  typeDescription: string;
  component: string;
  result: string;
  indicator: string;
  aspects: Aspect[];
  visits: VisitInstrument[];
  resources: any[];
  isGia: boolean;
  giaTypeEnum: null;
  giaTypeDescription: null;
  code: string;
  name: string;
  stage: number;
  stageDescription: string;
  modality: string;
  modalityDescription: string;
  level: string;
  levelDescription: null;
  cycle: string;
  cycleDescription: null;
  appliesToAllTeachers: boolean;
  isAutoevaluationOfTeachers: boolean;
  area: string;
  areaDescription: null;
  reference: string;
  isActive: boolean;
  startRules: boolean;
  published: boolean;
  creationDate: Date;
}

export interface Aspect {
  id: string;
  componentId: string;
  resultId: string;
  indicatorId: string;
  code: string;
  name: string;
  weighted: number;
}

export interface VisitInstrument {
  visitNumber: number;
  code: string;
  startDate: Date;
  endDate: Date;
  isCanceled: boolean;
}
