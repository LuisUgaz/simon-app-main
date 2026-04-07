import { Sample, VisitAnswer } from '../../core/entities';
import { MonitoringOfflineRepository } from '../interfaces/repositories/monitoring.repository';
import {
  MonitoringLocalData,
  MonitoringDataFilter,
} from '../interfaces/datasources/monitoring.datasource';
import { SQLiteMonitoringDataSource } from '../datasources/sqlite/monitoring.datasource.impl';
import { ENUMS } from '../../core/constants';

export class MonitoringOfflineRepositoryImpl
  implements MonitoringOfflineRepository {
  private dataSource: SQLiteMonitoringDataSource;

  constructor() {
    this.dataSource = new SQLiteMonitoringDataSource();
  }

  /**
   * Inicializa el repositorio y el datasource
   */
  async initialize(): Promise<void> {
    await this.dataSource.initialize();
  }

  async saveOfflineMonitoringData(
    userId: string,
    sample: Sample,
    visitAnswer: VisitAnswer,
    contextData?: {
      currentMonitoringInstrument?: any;
      currentMonitoringPlan?: any;
      aspectsData?: any;
      aspectsResponseData?: any;
    },
  ): Promise<{
    success: boolean;
    message: string;
    dataSize: number;
    id?: number;
  }> {
    try {
      // Obtener los datos del contexto de monitoreo
      const monitoringData = await this.buildMonitoringData(
        sample,
        visitAnswer,
        contextData,
      );

      const sessionMetadata = {
        savedAt: new Date().toISOString(),
        dataVersion: '1.0',
        totalDataPoints: this.calculateDataPoints(monitoringData),
      };

      const result = await this.dataSource.saveMonitoringData(
        userId,
        sample,
        visitAnswer,
        monitoringData,
        sessionMetadata,
      );

      if (result.success) {
        // Calcular el tamaño en KB
        const dataString = JSON.stringify(monitoringData);
        const dataSizeInBytes = new Blob([dataString]).size;
        const dataSizeInKB = Math.round((dataSizeInBytes / 1024) * 100) / 100;

        console.log(
          `✅ Datos de monitoreo persistidos offline. ID: ${result.id}, Tamaño: ${dataSizeInKB} KB`,
        );

        return {
          success: true,
          message: result.message,
          dataSize: dataSizeInKB,
          id: result.id,
        };
      } else {
        return {
          success: false,
          message: result.message,
          dataSize: 0,
        };
      }
    } catch (error) {
      console.error('❌ Error en repositorio guardando datos offline:', error);
      return {
        success: false,
        message: `Error inesperado: ${error}`,
        dataSize: 0,
      };
    }
  }

  async getOfflineMonitoringData(
    sampleId: string,
    visitAnswerId: string,
  ): Promise<{
    success: boolean;
    data?: any;
    message: string;
  }> {
    try {
      const result = await this.dataSource.getMonitoringData(
        sampleId,
        visitAnswerId,
      );

      if (result) {
        const parsedData = JSON.parse(result.data);
        return {
          success: true,
          data: parsedData,
          message: 'Datos obtenidos correctamente',
        };
      } else {
        return {
          success: false,
          message: 'No se encontraron datos offline para este sample y visita',
        };
      }
    } catch (error) {
      console.error('❌ Error obteniendo datos offline:', error);
      return {
        success: false,
        message: `Error al obtener datos: ${error}`,
      };
    }
  }

  async getAllOfflineMonitoringData(filter?: MonitoringDataFilter): Promise<{
    success: boolean;
    data: MonitoringLocalData[];
    message: string;
  }> {
    try {
      const data = await this.dataSource.getAllMonitoringData(filter);
      return {
        success: true,
        data,
        message: `${data.length} registros obtenidos`,
      };
    } catch (error) {
      console.error('❌ Error obteniendo todos los datos offline:', error);
      return {
        success: false,
        data: [],
        message: `Error al obtener datos: ${error}`,
      };
    }
  }

  async getPendingSyncData(): Promise<{
    success: boolean;
    data: MonitoringLocalData[];
    message: string;
  }> {
    try {
      const data = await this.dataSource.getAllMonitoringData({
        syncStatus: 'pending',
      });
      return {
        success: true,
        data,
        message: `${data.length} registros pendientes de sincronización`,
      };
    } catch (error) {
      console.error('❌ Error obteniendo datos pendientes:', error);
      return {
        success: false,
        data: [],
        message: `Error al obtener datos pendientes: ${error}`,
      };
    }
  }

  async markAsSynced(sampleId: string, visitAnswerId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const monitoringData = await this.dataSource.getMonitoringData(sampleId, visitAnswerId);

      if (!monitoringData) {
        return {
          success: false,
          message: 'No se encontraron datos para marcar como sincronizados',
        };
      }

      const now = new Date().toISOString();
      const result = await this.dataSource.updateSyncStatus(monitoringData.id!, 'synced', now);
      return {
        success: result,
        message: result
          ? 'Datos marcados como sincronizados'
          : 'Error al actualizar estado',
      };
    } catch (error) {
      console.error('❌ Error marcando como sincronizado:', error);
      return {
        success: false,
        message: `Error al marcar como sincronizado: ${error}`,
      };
    }
  }

  async markSyncError(id: number): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const result = await this.dataSource.updateSyncStatus(id, 'error');
      return {
        success: result,
        message: result
          ? 'Error de sincronización marcado'
          : 'Error al actualizar estado',
      };
    } catch (error) {
      console.error('❌ Error marcando error de sincronización:', error);
      return {
        success: false,
        message: `Error al marcar error de sincronización: ${error}`,
      };
    }
  }

  async deleteOfflineData(id: number): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const result = await this.dataSource.deleteMonitoringData(id);
      return {
        success: result,
        message: result
          ? 'Datos eliminados correctamente'
          : 'Error al eliminar datos',
      };
    } catch (error) {
      console.error('❌ Error eliminando datos offline:', error);
      return {
        success: false,
        message: `Error al eliminar datos: ${error}`,
      };
    }
  }

  async cleanOldData(daysOld: number = 30): Promise<{
    success: boolean;
    deletedCount: number;
    message: string;
  }> {
    try {
      const deletedCount = await this.dataSource.cleanOldSyncedData(daysOld);
      return {
        success: true,
        deletedCount,
        message: `${deletedCount} registros antiguos eliminados`,
      };
    } catch (error) {
      console.error('❌ Error limpiando datos antiguos:', error);
      return {
        success: false,
        deletedCount: 0,
        message: `Error al limpiar datos antiguos: ${error}`,
      };
    }
  }

  async getOfflineStorageStats(): Promise<{
    success: boolean;
    stats: {
      totalRecords: number;
      pendingSync: number;
      syncedRecords: number;
      errorRecords: number;
      totalSizeKB: number;
    };
    message: string;
  }> {
    try {
      const stats = await this.dataSource.getStorageStats();
      return {
        success: true,
        stats,
        message: 'Estadísticas obtenidas correctamente',
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return {
        success: false,
        stats: {
          totalRecords: 0,
          pendingSync: 0,
          syncedRecords: 0,
          errorRecords: 0,
          totalSizeKB: 0,
        },
        message: `Error al obtener estadísticas: ${error}`,
      };
    }
  }

  async hasOfflineData(
    sampleId: string,
    visitAnswerId: string,
  ): Promise<{
    hasData: boolean;
    lastSyncedAt?: string | null;
    updatedAt?: string;
  }> {
    try {
      const result = await this.dataSource.getMonitoringData(
        sampleId,
        visitAnswerId,
      );
      if (result) {
        return {
          hasData: true,
          lastSyncedAt: result.lastSyncedAt,
          updatedAt: result.updatedAt,
        };
      }
      return { hasData: false };
    } catch (error) {
      console.error('❌ Error verificando existencia de datos offline:', error);
      return { hasData: false };
    }
  }

  /**
   * Construye la estructura de datos de monitoreo
   * Esta lógica debería ser similar a la que está en monitoring.store.ts
   */
  private async buildMonitoringData(
    sample: Sample,
    visitAnswer: VisitAnswer,
    contextData?: {
      currentMonitoringInstrument?: any;
      currentMonitoringPlan?: any;
      aspectsData?: any;
      aspectsResponseData?: any;
    },
  ): Promise<any> {
    return {
      // Datos de la visita
      visitAnswerData: {
        sampleId: visitAnswer.sampleId,
        visitAnswerId: visitAnswer.id || visitAnswer.visitAnswerId,
        visitNumber: visitAnswer.visitNumber,
        code: visitAnswer.code,
        visitType: visitAnswer.visitType,
        status: visitAnswer.status,
        completedAspects: visitAnswer.completedAspects,
        subjectFound: visitAnswer.subjectFound,
        withReplacement: visitAnswer.withReplacement,
        isRescheduled: visitAnswer.isRescheduled,
        scheduledDate: visitAnswer.scheduledDate,
        startTime: visitAnswer.startTime,
        endTime: visitAnswer.endTime,
        additionalData: visitAnswer.additionalData,
        isExecutionAdjustment: visitAnswer.isExecutionAdjustment,
        executionStartDate: visitAnswer.executionStartDate,
        executionStartTime: visitAnswer.executionStartTime,
        executionEndDate: visitAnswer.executionEndDate,
        executionEndTime: visitAnswer.executionEndTime,
        isCanceled: visitAnswer.isCanceled,
        auxiliaryFirstName: visitAnswer.auxiliaryFirstName,
        auxiliaryLastName: visitAnswer.auxiliaryLastName,
        auxiliaryMiddleName: visitAnswer.auxiliaryMiddleName,
        observation: visitAnswer.observation,
        commitments: visitAnswer.commitments,
        monitorType: visitAnswer.monitorType,
        monitorDocumentType: visitAnswer.monitorDocumentType,
        monitorDocumentNumber: visitAnswer.monitorDocumentNumber,
        monitorFirstName: visitAnswer.monitorFirstName,
        monitorLastName: visitAnswer.monitorLastName,
        monitorMiddleName: visitAnswer.monitorMiddleName,
        monitorSite: visitAnswer.monitorSite,
        sample: visitAnswer.sample,
        instrument: visitAnswer.instrument,
        plan: visitAnswer.plan,
        executionError: visitAnswer.executionError,
        binnacle: visitAnswer.binnacle,
      },

      // Datos del sample
      sampleData: {
        id: sample.id,
        key: sample.key,
        idInstrument: sample.idInstrument,
        idSampleType: sample.idSampleType,
        sampleTypeDescription: sample.sampleTypeDescription,
        fullName: sample.fullName,
        documentType: sample.documentType,
        documentNumber: sample.documentNumber,
        firstName: sample.firstName,
        lastName: sample.lastName,
        middleName: sample.middleName,
        site: sample.site,
        dre: sample.dre,
        dreDescription: sample.dreDescription,
        ugel: sample.ugel,
        ugelDescription: sample.ugelDescription,
        idLevel: sample.idLevel,
        levelDescription: sample.levelDescription,
        network: sample.network,
        networkDescription: sample.networkDescription,
        modularCode: sample.modularCode,
        anexo: sample.anexo,
        iieeName: sample.iieeName,
        enuMonitorType: sample.monitorType,
        monitorTypeDescription: sample.monitorTypeDescription,
        monitorDocumentType: sample.monitorDocumentType,
        monitorDocumentNumber: sample.monitorDocumentNumber,
        monitorFirstName: sample.monitorFirstName,
        monitorLastName: sample.monitorLastName,
        monitorMiddleName: sample.monitorMiddleName,
        monitorSite: sample.monitorSite,
        visits: sample.visits,
        isActive: sample.isActive,
        isCanceled: sample.isCanceled,
        isReplaced: sample.isReplaced,
        replacement: sample.replacement,
        creationDate: sample.creationDate,
        modificationDate: sample.modificationDate,
        createdBy: sample.createdBy,
        modifiedBy: sample.modifiedBy,
        inKey: sample.inKey,
      },

      // Datos del instrumento de monitoreo
      monitoringInstrumentData:
        contextData?.currentMonitoringInstrument ||
        visitAnswer.instrument ||
        null,

      // Datos del plan de monitoreo
      monitoringPlanData:
        contextData?.currentMonitoringPlan || visitAnswer.plan || null,

      // Datos de aspectos
      aspectsData: contextData?.aspectsData || null,

      // Datos de respuestas de aspectos
      aspectsResponseData: contextData?.aspectsResponseData || null,
    };
  }

  /**
   * Actualiza observation y commitments en los datos offline de SQLite
   */
  async updateObservationAndCommitments(
    userId: string,
    sampleId: string,
    visitAnswerId: string,
    observation: string,
    commitments: string[],
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      console.log('🔄 Actualizando observation y commitments offline:', {
        sampleId,
        visitAnswerId,
        observation,
        commitmentsCount: commitments.length,
      });

      // Obtener los datos existentes de SQLite
      const existingData = await this.getOfflineMonitoringData(
        sampleId,
        visitAnswerId,
      );

      if (!existingData.success || !existingData.data) {
        return {
          success: false,
          message:
            'No se encontraron datos offline para actualizar observación y compromisos',
        };
      }

      const monitoringData = existingData.data;

      // Actualizar observation y commitments en visitAnswerData
      if (monitoringData.visitAnswerData) {
        monitoringData.visitAnswerData.observation = observation;
        monitoringData.visitAnswerData.commitments = commitments;
        console.log(
          '✅ Datos de observation y commitments actualizados en visitAnswerData',
        );
      } else {
        console.error('❌ No se encontró visitAnswerData en los datos offline');
        return {
          success: false,
          message: 'No se encontró visitAnswerData en los datos offline',
        };
      }

      // Guardar los datos actualizados en SQLite
      const sessionMetadata = {
        savedAt: new Date().toISOString(),
        dataVersion: '1.0',
        totalDataPoints: this.calculateDataPoints(monitoringData),
        lastObservationUpdate: new Date().toISOString(),
      };

      // Construir el sample y visitAnswer para la actualización
      const sampleData = monitoringData.sampleData;
      const visitAnswerData = {
        ...monitoringData.visitAnswerData,
        observation,
        commitments,
      };

      const updateResult = await this.dataSource.saveMonitoringData(
        userId,
        sampleData,
        visitAnswerData,
        monitoringData,
        sessionMetadata,
      );

      if (updateResult.success) {
        console.log(
          '✅ Observation y commitments actualizados exitosamente en SQLite',
        );
        return {
          success: true,
          message:
            'Observación y compromisos actualizados correctamente en modo offline',
        };
      } else {
        return {
          success: false,
          message:
            updateResult.message ||
            'Error al actualizar observation y commitments en SQLite',
        };
      }
    } catch (error) {
      console.error(
        '❌ Error actualizando observation y commitments offline:',
        error,
      );
      return {
        success: false,
        message: `Error al actualizar observation y commitments offline: ${error}`,
      };
    }
  }

  /**
   * Actualiza preExecutionData en los datos offline de SQLite
   */
  async updatePreExecutionData(
    userId: string,
    sampleId: string,
    visitAnswerId: string,
    preExecutionData: any,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    console.log('🔄 Actualizando preExecutionData offline:', {
      sampleId,
      visitAnswerId,
      preExecutionData,
    });

    // Obtener los datos existentes de SQLite
    const existingData = await this.getOfflineMonitoringData(
      sampleId,
      visitAnswerId,
    );

    if (!existingData.success || !existingData.data) {
      throw new Error(
        'No se encontraron datos offline para actualizar',
      );
    }

    const monitoringData = existingData?.data;

    // Actualizar preExecutionData en visitAnswerData
    if (monitoringData.visitAnswerData) {
      monitoringData.visitAnswerData.preExecutionData = preExecutionData;
      console.log(
        '✅ Datos de preExecutionData actualizados en visitAnswerData',
      );
    } else {
      console.error('No se encontró visitAnswerData en los datos offline');
      return {
        success: false,
        message: 'No se encontró datos offline',
      };
    }

    // Guardar los datos actualizados en SQLite
    const sessionMetadata = {
      savedAt: new Date().toISOString(),
      dataVersion: '1.0',
      totalDataPoints: this.calculateDataPoints(monitoringData),
      lastPreExecutionUpdate: new Date().toISOString(),
    };

    // Construir el sample y visitAnswer para la actualización
    const sampleData = monitoringData.sampleData;
    const visitAnswerData = {
      ...monitoringData.visitAnswerData,
      preExecutionData,
    };

    const updateResult = await this.dataSource.saveMonitoringData(
      userId,
      sampleData,
      visitAnswerData,
      monitoringData,
      sessionMetadata,
    );

    if (updateResult.success) {
      console.log('✅ PreExecutionData actualizado exitosamente en SQLite');
      return {
        success: true,
        message: 'PreExecutionData actualizado correctamente en modo offline',
      };
    } else {
      return {
        success: false,
        message:
          updateResult.message ||
          'Error al actualizar preExecutionData en SQLite',
      };
    }
  }

  /**
   * Actualiza visitAnswerData con las propiedades de preExecutionData y elimina preExecutionData
   */
  async updateVisitAnswerDataFromPreExecution(
    userId: string,
    sampleId: string,
    visitAnswerId: string,
    offline: boolean
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      console.log('🔄 Actualizando visitAnswerData desde preExecutionData:', {
        sampleId,
        visitAnswerId,
      });

      // Obtener los datos existentes de SQLite
      const existingData = await this.getOfflineMonitoringData(sampleId, visitAnswerId);

      if (!existingData.success || !existingData.data) {
        return {
          success: false,
          message: 'No se encontraron datos offline para actualizar visitAnswerData',
        };
      }

      const monitoringData = existingData.data;

      // Verificar que existe preExecutionData
      if (!monitoringData.visitAnswerData?.preExecutionData) {
        return {
          success: false,
          message: 'No se encontró preExecutionData para actualizar visitAnswerData',
        };
      }

      const preExecutionData = monitoringData.visitAnswerData.preExecutionData;

      // Actualizar visitAnswerData con las propiedades de preExecutionData
      // Mantener las propiedades originales que no están en preExecutionData
      const updatedVisitAnswerData = {
        ...monitoringData.visitAnswerData,
        // Reemplazar con las propiedades de preExecutionData
        id: preExecutionData.id || monitoringData.visitAnswerData.id,
        sampleId: preExecutionData.sampleId || monitoringData.visitAnswerData.sampleId,
        visitNumber: preExecutionData.visitNumber || monitoringData.visitAnswerData.visitNumber,
        code: preExecutionData.code || monitoringData.visitAnswerData.code,
        visitType: preExecutionData.visitType || monitoringData.visitAnswerData.visitType,
        visitTypeDescription: preExecutionData.visitTypeDescription || monitoringData.visitAnswerData.visitTypeDescription,
        status: preExecutionData.status || monitoringData.visitAnswerData.status,
        completedAspects: preExecutionData.completedAspects || monitoringData.visitAnswerData.completedAspects,
        subjectFound: preExecutionData.subjectFound !== undefined ? preExecutionData.subjectFound : monitoringData.visitAnswerData.subjectFound,
        withReplacement: preExecutionData.withReplacement !== undefined ? preExecutionData.withReplacement : monitoringData.visitAnswerData.withReplacement,
        isRescheduled: preExecutionData.isRescheduled !== undefined ? preExecutionData.isRescheduled : monitoringData.visitAnswerData.isRescheduled,
        scheduledDate: preExecutionData.scheduledDate || monitoringData.visitAnswerData.scheduledDate,
        startTime: preExecutionData.startTime || monitoringData.visitAnswerData.startTime,
        endTime: preExecutionData.endTime || monitoringData.visitAnswerData.endTime,
        additionalData: preExecutionData.additionalData || monitoringData.visitAnswerData.additionalData,
        isExecutionAdjustment: preExecutionData.isExecutionAdjustment !== undefined ? preExecutionData.isExecutionAdjustment : monitoringData.visitAnswerData.isExecutionAdjustment,
        executionStartDate: preExecutionData.executionStartDate || monitoringData.visitAnswerData.executionStartDate,
        executionStartTime: preExecutionData.executionStartTime || monitoringData.visitAnswerData.executionStartTime,
        executionEndDate: preExecutionData.executionEndDate || monitoringData.visitAnswerData.executionEndDate,
        executionEndTime: preExecutionData.executionEndTime || monitoringData.visitAnswerData.executionEndTime,
        isCanceled: preExecutionData.isCanceled !== undefined ? preExecutionData.isCanceled : monitoringData.visitAnswerData.isCanceled,
        auxiliaryFirstName: preExecutionData.auxiliaryFirstName || monitoringData.visitAnswerData.auxiliaryFirstName,
        auxiliaryLastName: preExecutionData.auxiliaryLastName || monitoringData.visitAnswerData.auxiliaryLastName,
        auxiliaryMiddleName: preExecutionData.auxiliaryMiddleName || monitoringData.visitAnswerData.auxiliaryMiddleName,
        observation: preExecutionData.observation || monitoringData.visitAnswerData.observation,
        commitments: preExecutionData.commitments || monitoringData.visitAnswerData.commitments,
        monitorType: preExecutionData.monitorType || monitoringData.visitAnswerData.monitorType,
        monitorTypeDescription: preExecutionData.monitorTypeDescription || monitoringData.visitAnswerData.monitorTypeDescription,
        monitorDocumentType: preExecutionData.monitorDocumentType !== undefined ? preExecutionData.monitorDocumentType : monitoringData.visitAnswerData.monitorDocumentType,
        monitorDocumentNumber: preExecutionData.monitorDocumentNumber || monitoringData.visitAnswerData.monitorDocumentNumber,
        monitorFirstName: preExecutionData.monitorFirstName || monitoringData.visitAnswerData.monitorFirstName,
        monitorLastName: preExecutionData.monitorLastName || monitoringData.visitAnswerData.monitorLastName,
        monitorMiddleName: preExecutionData.monitorMiddleName || monitoringData.visitAnswerData.monitorMiddleName,
        monitorSite: preExecutionData.monitorSite || monitoringData.visitAnswerData.monitorSite,
        executionError: preExecutionData.executionError || monitoringData.visitAnswerData.executionError,
        binnacle: preExecutionData.binnacle || monitoringData.visitAnswerData.binnacle,
        // Eliminar preExecutionData
        preExecutionData: !offline ? undefined : preExecutionData,
      };

      // Actualizar el objeto monitoringData
      monitoringData.visitAnswerData = updatedVisitAnswerData;

      console.log('✅ visitAnswerData actualizado con propiedades de preExecutionData');

      // Guardar los datos actualizados en SQLite
      const sessionMetadata = {
        savedAt: new Date().toISOString(),
        dataVersion: '1.0',
        totalDataPoints: this.calculateDataPoints(monitoringData),
        lastVisitAnswerDataUpdate: new Date().toISOString(),
      };

      // Construir el sample y visitAnswer para la actualización
      const sampleData = monitoringData.sampleData;
      const visitAnswerData = updatedVisitAnswerData;

      const updateResult = await this.dataSource.saveMonitoringData(
        userId,
        sampleData,
        visitAnswerData,
        monitoringData,
        sessionMetadata,
      );

      if (updateResult.success) {
        console.log('✅ visitAnswerData actualizado exitosamente en SQLite');

        // Verificar si el status es diferente a 'en ejecución'
        const isNotInExecution = updatedVisitAnswerData.status !== ENUMS.configuracion.tipoEstadoVisita.children.enEjecucion;

        if (isNotInExecution && !offline) {
          console.log('🔄 Status no es en ejecución, eliminando registro de SQLite...');

          const result = await this.deleteOfflineDataByVisit(sampleId, visitAnswerId);
          return {
            success: result.success,
            message: result.message,
          };
        } else {
          console.log('ℹ️ Status es en ejecución, manteniendo registro en SQLite');
          return {
            success: true,
            message: 'visitAnswerData actualizado correctamente desde preExecutionData',
          };
        }
      } else {
        return {
          success: false,
          message:
            updateResult.message ||
            'Error al actualizar visitAnswerData en SQLite',
        };
      }
    } catch (error) {
      console.error('❌ Error actualizando visitAnswerData desde preExecutionData:', error);
      return {
        success: false,
        message: `Error al actualizar visitAnswerData: ${error}`,
      };
    }
  }

  /**
   * Elimina datos offline por ID del registro
   */
  async deleteOfflineDataById(
    recordId: number
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      console.log('🔄 Eliminando datos offline por ID:', { recordId });

      const result = await this.dataSource.deleteMonitoringData(recordId);

      if (result) {
        console.log(`✅ Datos offline eliminados correctamente. ID: ${recordId}`);
        return {
          success: true,
          message: 'Datos offline eliminados correctamente',
        };
      } else {
        return {
          success: false,
          message: 'Error al eliminar datos offline',
        };
      }
    } catch (error) {
      console.error('❌ Error eliminando datos offline:', error);
      return {
        success: false,
        message: `Error al eliminar datos offline: ${error}`,
      };
    }
  }

  /**
   * Elimina datos offline por sampleId y visitAnswerId
   */
  async deleteOfflineDataByVisit(
    sampleId: string,
    visitAnswerId: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      console.log('🔄 Eliminando datos offline por sampleId y visitAnswerId:', {
        sampleId,
        visitAnswerId,
      });

      const result = await this.dataSource.getMonitoringData(
        sampleId,
        visitAnswerId,
      );

      // Obtener el ID del registro para eliminarlo
      if (!result) {
        return {
          success: false,
          message: 'No se encontraron datos offline para eliminar',
        };
      }

      // Obtener el ID del registro desde los metadatos
      if (!result.id) {
        return {
          success: false,
          message: 'No se encontró el ID del registro para eliminar',
        };
      }

      return await this.deleteOfflineDataById(result.id);
    } catch (error) {
      console.error('❌ Error eliminando datos offline:', error);
      return {
        success: false,
        message: `Error al eliminar datos offline: ${error}`,
      };
    }
  }

  /**
   * Calcula el número total de puntos de datos
   */
  private calculateDataPoints(data: any): number {
    let totalDataPoints = 0;

    if (data.visitAnswerData) {
      totalDataPoints += Object.keys(data.visitAnswerData).length;
    }
    if (data.sampleData) {
      totalDataPoints += Object.keys(data.sampleData).length;
    }
    if (data.monitoringInstrumentData) {
      totalDataPoints += Object.keys(data.monitoringInstrumentData).length;
    }
    if (data.monitoringPlanData) {
      totalDataPoints += Object.keys(data.monitoringPlanData).length;
    }
    if (data.aspectsData && data.aspectsData !== null) {
      totalDataPoints += Object.keys(data.aspectsData).length;
    }

    return totalDataPoints;
  }

  /**
   * Cierra la conexión del repositorio
   */
  async close(): Promise<void> {
    await this.dataSource.close();
  }
}
