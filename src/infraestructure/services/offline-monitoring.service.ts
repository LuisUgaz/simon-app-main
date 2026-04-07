import { MonitoringOfflineRepositoryImpl } from '../repositories/monitoring.repository.impl';

/**
 * Servicio singleton para gestionar la persistencia offline de monitoreo
 */
class OfflineMonitoringService {
  private static instance: OfflineMonitoringService;
  private repository: MonitoringOfflineRepositoryImpl;
  private isInitialized = false;

  private constructor() {
    this.repository = new MonitoringOfflineRepositoryImpl();
  }

  public static getInstance(): OfflineMonitoringService {
    if (!OfflineMonitoringService.instance) {
      OfflineMonitoringService.instance = new OfflineMonitoringService();
    }
    return OfflineMonitoringService.instance;
  }

  async initialize(): Promise<void> {
    if (!this.isInitialized) {
      await this.repository.initialize();
      this.isInitialized = true;
      console.log('✅ OfflineMonitoringService inicializado');
    }
  }

  getRepository(): MonitoringOfflineRepositoryImpl {
    return this.repository;
  }

  async close(): Promise<void> {
    if (this.isInitialized) {
      await this.repository.close();
      this.isInitialized = false;
      console.log('✅ OfflineMonitoringService cerrado');
    }
  }
}

export default OfflineMonitoringService;
