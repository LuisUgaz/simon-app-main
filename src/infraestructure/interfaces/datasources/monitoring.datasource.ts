import { Sample, VisitAnswer } from '../../../core/entities';

export interface MonitoringLocalData {
  id?: number;
  userId: string;
  sampleId: string;
  visitAnswerId: string;
  data: string; // JSON string de todos los datos
  createdAt: string;
  updatedAt: string;
  syncStatus: 'pending' | 'synced' | 'error';
  dataSize: number; // Tamaño en KB
  sessionMetadata: string; // JSON string del metadata
  lastSyncedAt?: string | null;
}

export interface MonitoringDataFilter {
  userId?: string;
  sampleId?: string;
  visitAnswerId?: string;
  syncStatus?: 'pending' | 'synced' | 'error';
  createdAfter?: string;
  createdBefore?: string;
}

export interface MonitoringLocalDataSource {
  /**
   * Inicializa la base de datos y crea las tablas necesarias
   */
  initialize(): Promise<void>;

  /**
   * Guarda datos de monitoreo localmente
   */
  saveMonitoringData(
    userId: string,
    sample: Sample,
    visitAnswer: VisitAnswer,
    data: any,
    sessionMetadata: any
  ): Promise<{ success: boolean; id?: number; message: string }>;

  /**
   * Obtiene datos de monitoreo por ID
   */
  getMonitoringDataById(id: number): Promise<MonitoringLocalData | null>;

  /**
   * Obtiene datos de monitoreo por sampleId y visitAnswerId
   */
  getMonitoringData(
    sampleId: string,
    visitAnswerId: string
  ): Promise<MonitoringLocalData | null>;

  /**
   * Obtiene todos los datos de monitoreo con filtros opcionales
   */
  getAllMonitoringData(
    filter?: MonitoringDataFilter
  ): Promise<MonitoringLocalData[]>;

  /**
   * Actualiza el estado de sincronización
   */
  updateSyncStatus(
    id: number,
    status: 'pending' | 'synced' | 'error',
    lastSyncedAt?: string
  ): Promise<boolean>;

  /**
   * Elimina datos de monitoreo por ID
   */
  deleteMonitoringData(id: number): Promise<boolean>;

  /**
   * Elimina todos los datos sincronizados más antiguos que X días
   */
  cleanOldSyncedData(daysOld: number): Promise<number>;

  /**
   * Obtiene estadísticas de almacenamiento
   */
  getStorageStats(): Promise<{
    totalRecords: number;
    pendingSync: number;
    syncedRecords: number;
    errorRecords: number;
    totalSizeKB: number;
  }>;

  /**
   * Cierra la conexión a la base de datos
   */
  close(): Promise<void>;
}
