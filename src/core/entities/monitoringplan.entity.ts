import {Site} from './site.entity';

export interface MonitoringPlan {
  id: string;
  key: string;
  code: string;
  name: string;
  actors: any[];
  dre?: Site;
  ugel?: Site;
  ugels: Site[];
  site: Site;
  period: number;
  description: string;
  periodMin: number;
  periodMax: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isFinish: boolean;
  public: boolean;
  enuType: string;
  typeDescription: string;
  idLogicalFramework: string;
  nameLogicalFramework: string;
  logicalFramework: string;
  stage: number;
  stageDescription: string;
  mode: string;
  modeDescription: string;
}
