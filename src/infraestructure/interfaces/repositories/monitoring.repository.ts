import { Sample, VisitAnswer } from '../../../core/entities';
import { MonitoringLocalData, MonitoringDataFilter } from '../datasources/monitoring.datasource';

export interface MonitoringOfflineRepository {
  /**
   * Guarda datos de monitoreo localmente con toda la estructura completa
   */
  saveOfflineMonitoringData(
    userId: string,
    sample: Sample,
    visitAnswer: VisitAnswer,
    contextData?: {
      currentMonitoringInstrument?: any;
      currentMonitoringPlan?: any;
      aspectsData?: any;
    }
  ): Promise<{
    success: boolean;
    message: string;
    dataSize: number;
    id?: number;
  }>;

  /**
   * Obtiene datos de monitoreo offline por sample y visit
   */
  getOfflineMonitoringData(
    sampleId: string,
    visitAnswerId: string
  ): Promise<{
    success: boolean;
    data?: any;
    message: string;
  }>;

  /**
   * Obtiene todos los datos de monitoreo offline con filtros
   */
  getAllOfflineMonitoringData(
    filter?: MonitoringDataFilter
  ): Promise<{
    success: boolean;
    data: MonitoringLocalData[];
    message: string;
  }>;

  /**
   * Obtiene datos pendientes de sincronización
   */
  getPendingSyncData(): Promise<{
    success: boolean;
    data: MonitoringLocalData[];
    message: string;
  }>;

  /**
   * Marca datos como sincronizados
   */
  markAsSynced(sampleId: string, visitAnswerId: string): Promise<{
    success: boolean;
    message: string;
  }>;

  /**
   * Marca datos con error de sincronización
   */
  markSyncError(id: number): Promise<{
    success: boolean;
    message: string;
  }>;

  /**
   * Elimina datos offline
   */
  deleteOfflineData(id: number): Promise<{
    success: boolean;
    message: string;
  }>;

  /**
   * Limpia datos antiguos sincronizados
   */
  cleanOldData(daysOld?: number): Promise<{
    success: boolean;
    deletedCount: number;
    message: string;
  }>;

  /**
   * Obtiene estadísticas de almacenamiento offline
   */
  getOfflineStorageStats(): Promise<{
    success: boolean;
    stats: {
      totalRecords: number;
      pendingSync: number;
      syncedRecords: number;
      errorRecords: number;
      totalSizeKB: number;
    };
    message: string;
  }>;

  /**
   * Verifica si hay datos para un sample y visit específicos
   */
  hasOfflineData(
    sampleId: string,
    visitAnswerId: string
  ): Promise<{
    hasData: boolean;
    lastSyncedAt?: string | null;
    updatedAt?: string;
  }>;

  /**
   * Actualiza observation y commitments en los datos offline de SQLite
   */
  updateObservationAndCommitments(
    userId: string,
    sampleId: string,
    visitAnswerId: string,
    observation: string,
    commitments: string[]
  ): Promise<{
    success: boolean;
    message: string;
  }>;

  /**
   * Actualiza preExecutionData en los datos offline de SQLite
   */
  updatePreExecutionData(
    userId: string,
    sampleId: string,
    visitAnswerId: string,
    preExecutionData: any
  ): Promise<{
    success: boolean;
    message: string;
  }>;

  /**
   * Actualiza visitAnswerData con las propiedades de preExecutionData y elimina preExecutionData
   */
  updateVisitAnswerDataFromPreExecution(
    userId: string,
    sampleId: string,
    visitAnswerId: string,
    offline: boolean
  ): Promise<{
    success: boolean;
    message: string;
  }>;

  /**
   * Elimina datos offline por ID del registro
   */
  deleteOfflineDataById(
    recordId: number
  ): Promise<{
    success: boolean;
    message: string;
  }>;

  /**
   * Elimina datos offline por sampleId y visitAnswerId
   */
  deleteOfflineDataByVisit(
    sampleId: string,
    visitAnswerId: string
  ): Promise<{
    success: boolean;
    message: string;
  }>;
}
