import { create } from 'zustand';
import {
  Institution,
  InstrumentItem,
  MonitoringInstrument,
  MonitoringPlan,
  Sample,
  Site,
  Visit,
  VisitAnswer,
  Aspect,
} from '../../core/entities';
import { ENUMS, MonitoringModeType } from '../../core/constants';
import { useItemControlsStore } from '../screens/monitoring/sample/stores/itemControlsStore';
import {
  MonitoringMapper,
  PageRequest,
  StatusPageResponse,
  StatusResponse,
} from '../../infraestructure';
import OfflineFilesService from '../../infraestructure/services/offline-files.service';
import { postUpload } from '../../core/actions';
import {
  getPlans,
  getPlan,
  getInstruments,
  getSamples,
  getSampleVisits,
  getSampleVisit,
  sendAddScheduleVisit,
  sendUpdateScheduleVisit,
  getItemsByInstrumentAspect,
  getByAnswerVisitaAspect,
  updateSampleVisitExecution,
  updateExecutionStartWithReplacement,
  updateRescheduling,
  updateCompletedWithoutExecution,
  sendVisitAnswers,
  sendObservationAndCommitments,
  sendVisitMuestra,
  addAutoSample,
} from '../../core/actions/monitoring/monitoring';
import { getInstrument } from '../../core/actions/configuration/configuration';
import { StorageAdapter } from '../../config/adapters/storage-adapter';
import OfflineMonitoringService from '../../infraestructure/services/offline-monitoring.service';

export interface MonitoringState {
  mode?: MonitoringModeType;
  currentMonitoringPlan?: MonitoringPlan;
  currentMonitoringInstrument?: MonitoringInstrument;
  currentInstrumentItems?: InstrumentItem[];
  currentFormData?: { [key: string]: any };
  currentSelectedAspect?: Aspect;
  visitData?: any;
  setMode: (mode: MonitoringModeType) => void;
  setCurrentPlan: (plan: MonitoringPlan) => void;
  setCurrentInstrument: (instrument: MonitoringInstrument) => void;
  setCurrentInstrumentItems: (items: InstrumentItem[]) => void;
  setCurrentFormData: (formData: { [key: string]: any }) => void;
  setCurrentSelectedAspect: (aspect: Aspect) => void;
  setVisitData: (visitData: any) => void;
  validateRequiredFields: () => { isValid: boolean; missingFields: string[] };
  clearInstrument: () => void;
  clearPlan: () => void;
  fetchAspectsDataInParallel: (
    instrument: MonitoringInstrument,
  ) => Promise<any>;
  fetchAspectsResponsesInParallel: (
    instrument: MonitoringInstrument,
    visitId: string,
  ) => Promise<any>;
  fetchAspectWithRetries: (
    instrumentId: string,
    aspect: Aspect,
    maxRetries?: number,
  ) => Promise<any>;
  fetchAspectResponsesWithRetries: (
    visitId: string,
    aspect: Aspect,
    maxRetries?: number,
  ) => Promise<any>;
  saveMonitoringDataToLocal: (
    userId: string,
    sample: Sample,
    visitAnswer: VisitAnswer,
  ) => Promise<{ success: boolean; message: string; dataSize: number }>;
  saveMonitoringDataToLocalFallback: (
    sample: Sample,
    visitAnswer: VisitAnswer,
  ) => Promise<{ success: boolean; message: string; dataSize: number }>;
  getOfflineMonitoringData: (
    sampleId: string,
    visitAnswerId: string,
  ) => Promise<{ success: boolean; data?: any; message: string }>;
  getAllOfflineMonitoringData: (userId: string) => Promise<{
    success: boolean;
    data: any[];
    message: string;
  }>;
  getPendingSyncData: () => Promise<{
    success: boolean;
    data: any[];
    message: string;
  }>;
  getOfflineStorageStats: () => Promise<{
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
  markOfflineDataAsSynced: (sampleId: string, visitAnswerId: string) => Promise<{
    success: boolean;
    message: string;
  }>;
  deleteOfflineData: (id: number) => Promise<{
    success: boolean;
    message: string;
  }>;
  cleanOldOfflineData: (daysOld?: number) => Promise<{
    success: boolean;
    deletedCount: number;
    message: string;
  }>;
  hasOfflineData: (sampleId: string, visitAnswerId: string) => Promise<{
    hasData: boolean;
    lastSyncedAt?: string | null;
    updatedAt?: string;
  }>;
  updateOfflineResponsesData: (
    userId: string,
    visitAnswerId: string,
    sampleId: string,
    aspectId: string,
    newResponses: any[],
  ) => Promise<{ success: boolean; message: string }>;
  updateObservationAndCommitments: (
    userId: string,
    sampleId: string,
    visitAnswerId: string,
    observation: string,
    commitments: string[],
  ) => Promise<{ success: boolean; message: string }>;
  updatePreExecutionData: (
    userId: string,
    sampleId: string,
    visitAnswerId: string,
    preExecutionData: any,
  ) => Promise<{ success: boolean; message: string }>;
  updateVisitAnswerDataFromPreExecution: (
    userId: string,
    sampleId: string,
    visitAnswerId: string,
    offline: boolean,
  ) => Promise<{ success: boolean; message: string }>;
  checkLocalDataSyncStatus: (
    sampleId: string,
    visitAnswerId: string,
    webStatus: string,
  ) => Promise<{
    hasLocalData: boolean;
    localStatus?: string;
    needsSync: boolean;
    message: string;
  }>;
  syncOfflineData: (
    userId: string,
    sampleId: string,
    visitAnswerId: string,
    withSend?: boolean,
  ) => Promise<{
    success: boolean;
    message: string;
  }>;
  syncOfflineFiles: (
    sampleId: string,
    visitAnswerId: string,
  ) => Promise<{
    success: boolean;
    message: string;
  }>;
  updateResponsesWithRealFileCodes: (
    userId: string,
    sampleId: string,
    visitAnswerId: string,
  ) => Promise<{
    success: boolean;
    message: string;
  }>;
  updateOfflineResponseFileCode: (
    userId: string,
    sampleId: string,
    visitAnswerId: string,
    aspectId: string,
    itemId: string,
    codigoItem: string,
    tempCode: string,
    serverDocumentCode: string,
  ) => Promise<{
    success: boolean;
    message: string;
  }>;
  validateLocalDataForSync: (
    sampleId: string,
    visitAnswerId: string,
  ) => Promise<{
    success: boolean;
    data?: any;
    message: string;
  }>;
  checkSyncStatusRequirement: (visitAnswerData: any) => {
    shouldSync: boolean;
    status: string;
    message: string;
  };
  prepareVisitAnswerForSync: (visitAnswerData: any) => VisitAnswer;
  sendVisitToServer: (visitAnswer: VisitAnswer) => Promise<{
    success: boolean;
    message: string;
  }>;
  deleteOfflineDataByVisit: (
    sampleId: string,
    visitAnswerId: string,
  ) => Promise<{
    success: boolean;
    message: string;
  }>;
  updateCompletedAspects: (
    userId: string,
    sampleId: string,
    visitAnswerId: string,
    aspectId: string,
  ) => Promise<{
    success: boolean;
    message: string;
  }>;
  getPlans: (
    request: PageRequest,
    query: string,
    lastKey: string,
    sede: any,
    isDirector: boolean,
    esCulminado?: boolean,
    codigoActor?: string,
    institucion?: Institution,
  ) => Promise<StatusPageResponse<MonitoringPlan[]>>;
  getPlan: (id: string) => Promise<StatusResponse<MonitoringPlan>>;
  getInstruments: (
    request: PageRequest,
    query: string,
    lastKey: string,
    idPlan: string,
  ) => Promise<StatusPageResponse<MonitoringInstrument[]>>;
  getInstrument: (id: string) => Promise<StatusResponse<MonitoringInstrument>>;
  getItemsByInstrumentAspect: (
    instrumentId: string,
    aspectId: string,
  ) => Promise<StatusResponse<InstrumentItem[]>>;
  getByAnswerVisitaAspect: (
    visitId: string,
    aspectId: string,
  ) => Promise<StatusResponse<any[]>>;
  getSampleVisits: (
    request: PageRequest,
    query: string,
    lastKey: string,
    idSample: string,
  ) => Promise<StatusPageResponse<VisitAnswer[]>>;
  getSampleVisit: (id: string) => Promise<StatusResponse<VisitAnswer>>;
  getSamples: (
    request: PageRequest,
    documentNumber: string,
    documentType: string,
    query: string,
    typeSite: number,
    codeSite: string,
    lastKey: string,
    instrumentId: string,
    isActive: boolean,
  ) => Promise<StatusPageResponse<Sample[]>>;
  sendAddScheduleVisit: (visit: Visit) => Promise<StatusResponse<boolean>>;
  sendUpdateScheduleVisit: (
    sampleId: string,
    visit: Visit,
  ) => Promise<StatusResponse<boolean>>;
  sendUpdateVisit: (visit: VisitAnswer) => Promise<any>;
  sendVisitAnswers: (
    visitAnswerData: any,
  ) => Promise<{ success: boolean; message: string }>;
  sendObservationAndCommitments: (
    visitId: string,
    observation: string,
    commitments: string[],
  ) => Promise<{ success: boolean; message: string }>;
  sendVisitMuestra: (
    visitAnswer: any,
  ) => Promise<{ success: boolean; message: string }>;
  addAutoSample: (
    id: string,
    samples: any[],
  ) => Promise<{ success: boolean; message: string }>;
}

export const useMonitoringStore = create<MonitoringState>()((set, get) => ({
  mode: undefined,
  currentMonitoringPlan: undefined,
  currentMonitoringInstrument: undefined,
  currentInstrumentItems: undefined,
  currentFormData: undefined,
  currentSelectedAspect: undefined,
  visitData: undefined,

  setMode: (mode?: MonitoringModeType) => set({ mode }),
  setCurrentPlan: (plan: MonitoringPlan) => set({ currentMonitoringPlan: plan }),
  setCurrentInstrument: (instrument: MonitoringInstrument) =>
    set({ currentMonitoringInstrument: instrument }),
  setCurrentInstrumentItems: (items: InstrumentItem[]) =>
    set({ currentInstrumentItems: items }),
  setCurrentFormData: (formData: { [key: string]: any }) =>
    set({ currentFormData: formData }),
  setCurrentSelectedAspect: (aspect: Aspect) =>
    set({ currentSelectedAspect: aspect }),
  setVisitData: (visitData: any) => set({ visitData }),

  validateRequiredFields: () => {
    const state = get();
    const { currentInstrumentItems, currentFormData } = state;

    if (!currentInstrumentItems || !currentFormData) {
      return {
        isValid: false,
        missingFields: ['No hay items o datos del formulario'],
      };
    }

    // Obtener el estado de los controles del store
    const controlsState = useItemControlsStore.getState().controls;

    const missingFields: string[] = [];

    currentInstrumentItems.forEach(item => {
      // Verificar si el control está habilitado (apply = true)
      const controlState = controlsState.get(item.code);
      const isEnabled = controlState?.enabled ?? true;

      // Solo validar si es requerido Y está habilitado (apply = true)
      if (isEnabled) {
        // Convertir el código del item al formato usado en el formulario (puntos → guiones bajos)
        const fieldKey = `${item.code.replace(/\./g, '_')}`;
        const fieldValue = currentFormData[fieldKey];

        // 1. Validar campo requerido principal
        if (item.rules.required) {
          console.log('🔍 Validando campo:', {
            originalCode: item.code,
            fieldKey: fieldKey,
            fieldValue: fieldValue,
            required: item.rules.required,
            enabled: isEnabled,
            apply: isEnabled,
          });

          if (
            !fieldValue ||
            (Array.isArray(fieldValue) && fieldValue.length === 0) ||
            (typeof fieldValue === 'string' && fieldValue.trim() === '')
          ) {
            missingFields.push(`${item.code}: ${item.title}`);
          }
        }

        // 2. Validar campo "Otros" si está seleccionado
        // Verificar si es opción múltiple (TYPE_01) o tiene opción "otro" habilitada
        if (item.configuration?.resolve?.withOtherOption) {
          const isOtherSelected =
            fieldValue === 'OTHER' ||
            (Array.isArray(fieldValue) && fieldValue.includes('OTHER'));

          if (isOtherSelected) {
            const otherFieldKey = `${fieldKey}_other`;
            const otherFieldValue = currentFormData[otherFieldKey];

            if (
              !otherFieldValue ||
              (typeof otherFieldValue === 'string' &&
                otherFieldValue.trim() === '')
            ) {
              missingFields.push(
                `Debe llenar el campo otros en el ítem ${item.code}`,
              );
            }
          }
        }
      }
    });

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  },

  clearPlan: () => {
    set({
      currentMonitoringInstrument: undefined,
      currentMonitoringPlan: undefined,
      currentInstrumentItems: undefined,
      currentFormData: undefined,
      currentSelectedAspect: undefined,
    });
  },

  clearInstrument: () => {
    set({
      currentMonitoringInstrument: undefined,
      currentInstrumentItems: undefined,
      currentFormData: undefined,
      currentSelectedAspect: undefined,
    });
  },

  fetchAspectsDataInParallel: async (instrument: MonitoringInstrument) => {
    try {
      console.log('🔄 Obteniendo datos de aspectos en paralelo...');
      if (!instrument.aspects) {
        console.warn('⚠️ No hay aspectos disponibles en el instrumento');
        return {
          totalAspects: 0,
          successfulAspects: 0,
          failedAspects: 0,
          totalItems: 0,
          aspects: [],
          fetchedAt: new Date().toISOString(),
        };
      }
      // Crear promesas para obtener items de cada aspecto con reintentos
      const aspectPromises = (instrument.aspects || []).map(async aspect => {
        return await get().fetchAspectWithRetries(instrument.id, aspect);
      });
      // Ejecutar todas las promesas en paralelo
      const aspectsResults = await Promise.all(aspectPromises);
      // Contar aspectos exitosos y total de items
      const successfulAspects = aspectsResults.filter(
        (result: any) => result.success,
      );
      const totalItems = aspectsResults.reduce(
        (sum: number, result: any) => sum + (result.itemCount || 0),
        0,
      );
      const aspectsData = {
        totalAspects: instrument.aspects?.length || 0,
        successfulAspects: successfulAspects.length,
        failedAspects: aspectsResults.length - successfulAspects.length,
        totalItems: totalItems,
        aspects: aspectsResults,
        fetchedAt: new Date().toISOString(),
      };
      console.log(
        `✅ Datos de aspectos obtenidos: ${successfulAspects.length}/${aspectsResults.length} exitosos, ${totalItems} items total`,
      );
      return aspectsData;
    } catch (error) {
      console.error('❌ Error general obteniendo aspectos:', error);
      return {
        totalAspects: instrument.aspects?.length || 0,
        successfulAspects: 0,
        failedAspects: instrument.aspects?.length || 0,
        totalItems: 0,
        aspects: [],
        error:
          error instanceof Error
            ? error.message
            : 'Error general obteniendo aspectos',
        fetchedAt: new Date().toISOString(),
      };
    }
  },

  fetchAspectWithRetries: async (
    instrumentId: string,
    aspect: Aspect,
    maxRetries: number = 2,
  ) => {
    let lastError: string | null = null;
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        console.log(`🔄 Intento ${attempt} para aspecto ${aspect.code}...`);
        const itemsResponse = await getItemsByInstrumentAspect(
          instrumentId,
          aspect.id,
        );
        if (itemsResponse.success && itemsResponse.data) {
          console.log(
            `✅ Aspecto ${aspect.code}: ${itemsResponse.data.length} items obtenidos (intento ${attempt})`,
          );
          return {
            aspectId: aspect.id,
            aspectCode: aspect.code,
            aspectName: aspect.name,
            items: itemsResponse.data,
            success: true,
            itemCount: itemsResponse.data.length,
            attempts: attempt,
          };
        } else {
          lastError = itemsResponse.message;
          console.warn(
            `⚠️ Aspecto ${aspect.code}: ${itemsResponse.message} (intento ${attempt})`,
          );

          if (attempt <= maxRetries) {
            console.log(
              `🔄 Reintentando aspecto ${aspect.code} en 1 segundo...`,
            );
            await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo antes del reintento
          }
        }
      } catch (error) {
        lastError =
          error instanceof Error ? error.message : 'Error desconocido';
        console.error(
          `❌ Error obteniendo aspecto ${aspect.code} (intento ${attempt}):`,
          error,
        );

        if (attempt <= maxRetries) {
          console.log(`🔄 Reintentando aspecto ${aspect.code} en 1 segundo...`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo antes del reintento
        }
      }
    }

    // Si llegamos aquí, todos los intentos fallaron
    console.error(
      `❌ Aspecto ${aspect.code}: Todos los intentos fallaron. Último error: ${lastError}`,
    );
    return {
      aspectId: aspect.id,
      aspectCode: aspect.code,
      aspectName: aspect.name,
      items: [],
      success: false,
      error: lastError || 'Todos los intentos fallaron',
      itemCount: 0,
      attempts: maxRetries + 1,
    };
  },

  fetchAspectResponsesWithRetries: async (
    visitId: string,
    aspect: Aspect,
    maxRetries: number = 2,
  ) => {
    let lastError: string | null = null;
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        console.log(
          `🔄 Intento ${attempt} para respuestas del aspecto ${aspect.code}...`,
        );
        const responsesResponse = await get().getByAnswerVisitaAspect(
          visitId,
          aspect.id,
        );
        if (responsesResponse.success && responsesResponse.data) {
          console.log(
            `✅ Aspecto ${aspect.code}: ${responsesResponse.data.length} respuestas obtenidas (intento ${attempt})`,
          );
          return {
            aspectId: aspect.id,
            aspectCode: aspect.code,
            aspectName: aspect.name,
            responses: responsesResponse.data,
            success: true,
            responseCount: responsesResponse.data.length,
            attempts: attempt,
          };
        } else {
          lastError = responsesResponse.message;
          console.warn(
            `⚠️ Aspecto ${aspect.code}: ${responsesResponse.message} (intento ${attempt})`,
          );

          if (attempt <= maxRetries) {
            console.log(
              `🔄 Reintentando respuestas aspecto ${aspect.code} en 1 segundo...`,
            );
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      } catch (error) {
        lastError =
          error instanceof Error ? error.message : 'Error desconocido';
        console.error(
          `❌ Error obteniendo respuestas aspecto ${aspect.code} (intento ${attempt}):`,
          error,
        );

        if (attempt <= maxRetries) {
          console.log(
            `🔄 Reintentando respuestas aspecto ${aspect.code} en 1 segundo...`,
          );
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // Si llegamos aquí, todos los intentos fallaron
    console.error(
      `❌ Respuestas aspecto ${aspect.code}: Todos los intentos fallaron. Último error: ${lastError}`,
    );
    return {
      aspectId: aspect.id,
      aspectCode: aspect.code,
      aspectName: aspect.name,
      responses: [],
      success: false,
      error: lastError || 'Todos los intentos fallaron',
      responseCount: 0,
      attempts: maxRetries + 1,
    };
  },

  fetchAspectsResponsesInParallel: async (
    instrument: MonitoringInstrument,
    visitId: string,
  ) => {
    try {
      console.log('🔄 Obteniendo respuestas de aspectos en paralelo...');
      if (!instrument.aspects) {
        console.warn('⚠️ No hay aspectos disponibles en el instrumento');
        return {
          totalAspects: 0,
          successfulAspects: 0,
          failedAspects: 0,
          totalResponses: 0,
          aspects: [],
          fetchedAt: new Date().toISOString(),
        };
      }

      // Crear promesas para obtener respuestas de cada aspecto con reintentos
      const aspectPromises = (instrument.aspects || []).map(async aspect => {
        return await get().fetchAspectResponsesWithRetries(visitId, aspect);
      });

      // Ejecutar todas las promesas en paralelo
      const aspectsResults = await Promise.all(aspectPromises);

      // Contar aspectos exitosos y total de respuestas
      const successfulAspects = aspectsResults.filter(
        result => result.success,
      ).length;
      const failedAspects = aspectsResults.filter(
        result => !result.success,
      ).length;
      const totalResponses = aspectsResults.reduce(
        (sum, result) => sum + (result.responseCount || 0),
        0,
      );

      console.log(
        `✅ Respuestas de aspectos obtenidas: ${successfulAspects}/${instrument.aspects.length} exitosos, ${totalResponses} respuestas totales`,
      );

      return {
        totalAspects: instrument.aspects.length,
        successfulAspects,
        failedAspects,
        totalResponses,
        aspects: aspectsResults,
        fetchedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error(
        '❌ Error obteniendo respuestas de aspectos en paralelo:',
        error,
      );
      return {
        totalAspects: 0,
        successfulAspects: 0,
        failedAspects: 0,
        totalResponses: 0,
        aspects: [],
        error:
          error instanceof Error
            ? error.message
            : 'Error general obteniendo respuestas de aspectos',
        fetchedAt: new Date().toISOString(),
      };
    }
  },

  saveMonitoringDataToLocal: async (
    userId: string,
    sample: Sample,
    visitAnswer: VisitAnswer,
  ) => {
    const state = get();
    const currentMonitoringInstrument = state.currentMonitoringInstrument;
    const currentMonitoringPlan = state.currentMonitoringPlan;

    try {
      // Inicializar el servicio offline
      const offlineService = OfflineMonitoringService.getInstance();
      await offlineService.initialize();
      const repository = offlineService.getRepository();

      // Obtener datos de aspectos en paralelo si existe el instrumento
      let aspectsData = null;
      if (
        currentMonitoringInstrument?.id &&
        currentMonitoringInstrument?.aspects
      ) {
        aspectsData = await get().fetchAspectsDataInParallel(
          currentMonitoringInstrument,
        );
      }

      // Obtener respuestas de aspectos en paralelo si existe el instrumento y visitAnswer
      let aspectsResponseData = null;
      if (
        currentMonitoringInstrument?.id &&
        currentMonitoringInstrument?.aspects &&
        visitAnswer?.id
      ) {
        console.log(
          '🔄 Obteniendo respuestas de aspectos para visitAnswer:',
          visitAnswer.id,
        );
        aspectsResponseData = await get().fetchAspectsResponsesInParallel(
          currentMonitoringInstrument,
          visitAnswer.id,
        );
        console.log(
          '✅ Respuestas de aspectos obtenidas:',
          aspectsResponseData?.totalResponses || 0,
          'respuestas',
        );
      }

      // Crear una copia enriquecida del visitAnswer con los datos del contexto actual
      const enrichedVisitAnswer: VisitAnswer = {
        ...visitAnswer,
        // instrument: visitAnswer.instrument || undefined,
        // plan: visitAnswer.plan || undefined,
      };

      // Guardar usando el repositorio SQLite, pasando los datos del contexto separadamente
      const result = await repository.saveOfflineMonitoringData(
        userId,
        sample,
        enrichedVisitAnswer,
        {
          currentMonitoringInstrument,
          currentMonitoringPlan,
          aspectsData,
          aspectsResponseData,
        },
      );

      if (result.success) {
        console.log(
          `✅ Datos de monitoreo guardados en SQLite. ID: ${result.id}, Tamaño: ${result.dataSize} KB`,
        );

        return {
          success: true,
          message: result.message,
          dataSize: result.dataSize,
        };
      } else {
        return {
          success: false,
          message: result.message,
          dataSize: 0,
        };
      }
    } catch (error) {
      console.error('❌ Error al guardar datos de monitoreo offline:', error);

      // Fallback al método original con StorageAdapter
      console.log('🔄 Intentando guardar con método de respaldo...');
      try {
        return await get().saveMonitoringDataToLocalFallback(
          sample,
          visitAnswer,
        );
      } catch (fallbackError) {
        console.error('❌ Error en método de respaldo:', fallbackError);
        return {
          success: false,
          message:
            'Error al guardar datos de monitoreo (SQLite y respaldo fallaron)',
          dataSize: 0,
        };
      }
    }
  },

  // Método de respaldo que usa la lógica original
  saveMonitoringDataToLocalFallback: async (
    sample: Sample,
    visitAnswer: VisitAnswer,
  ) => {
    const state = get();
    const currentMonitoringInstrument = state.currentMonitoringInstrument;
    const currentMonitoringPlan = state.currentMonitoringPlan;

    try {
      // Obtener datos de aspectos en paralelo si existe el instrumento
      let aspectsData = null;
      if (
        currentMonitoringInstrument?.id &&
        currentMonitoringInstrument?.aspects
      ) {
        aspectsData = await get().fetchAspectsDataInParallel(
          currentMonitoringInstrument,
        );
      }

      // Obtener respuestas de aspectos en paralelo si existe el instrumento y visitAnswer
      let aspectsResponseData = null;
      if (
        currentMonitoringInstrument?.id &&
        currentMonitoringInstrument?.aspects &&
        visitAnswer?.id
      ) {
        console.log(
          '🔄 Fallback: Obteniendo respuestas de aspectos para visitAnswer:',
          visitAnswer.id,
        );
        aspectsResponseData = await get().fetchAspectsResponsesInParallel(
          currentMonitoringInstrument,
          visitAnswer.id,
        );
        console.log(
          '✅ Fallback: Respuestas de aspectos obtenidas:',
          aspectsResponseData?.totalResponses || 0,
          'respuestas',
        );
      }

      const data = {
        // Datos de la visita
        visitAnswerData: {
          sampleId: visitAnswer.sampleId,
          visitAnswerId: visitAnswer.id,
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
          fullName: sample.fullName,
          documentType: sample.documentType,
          documentNumber: sample.documentNumber,
          firstName: sample.firstName,
          lastName: sample.lastName,
          middleName: sample.middleName,
          site: sample.site,
          dre: sample.dre,
          ugel: sample.ugel,
          idLevel: sample.idLevel,
          levelDescription: sample.levelDescription,
          network: sample.network,
          modularCode: sample.modularCode,
          anexo: sample.anexo,
          isActive: sample.isActive,
          creationDate: sample.creationDate,
          modificationDate: sample.modificationDate,
        },

        // Datos del instrumento de monitoreo
        monitoringInstrumentData: currentMonitoringInstrument
          ? {
            id: currentMonitoringInstrument.id,
            key: currentMonitoringInstrument.key,
            monitoringPlanId: currentMonitoringInstrument.monitoringPlanId,
            monitorsEnums: currentMonitoringInstrument.monitorsEnums,
            sampleEnum: currentMonitoringInstrument.sampleEnum,
            sampleDescription: currentMonitoringInstrument.sampleDescription,
            typeEnum: currentMonitoringInstrument.typeEnum,
            typeDescription: currentMonitoringInstrument.typeDescription,
            component: currentMonitoringInstrument.component,
            result: currentMonitoringInstrument.result,
            indicator: currentMonitoringInstrument.indicator,
            aspects: currentMonitoringInstrument.aspects,
            visits: currentMonitoringInstrument.visits,
            resources: currentMonitoringInstrument.resources,
            isGia: currentMonitoringInstrument.isGia,
            giaTypeEnum: currentMonitoringInstrument.giaTypeEnum,
            giaTypeDescription:
              currentMonitoringInstrument.giaTypeDescription,
            code: currentMonitoringInstrument.code,
            name: currentMonitoringInstrument.name,
            stage: currentMonitoringInstrument.stage,
            stageDescription: currentMonitoringInstrument.stageDescription,
            modality: currentMonitoringInstrument.modality,
            modalityDescription:
              currentMonitoringInstrument.modalityDescription,
            level: currentMonitoringInstrument.level,
            levelDescription: currentMonitoringInstrument.levelDescription,
            cycle: currentMonitoringInstrument.cycle,
            cycleDescription: currentMonitoringInstrument.cycleDescription,
            area: currentMonitoringInstrument.area,
            areaDescription: currentMonitoringInstrument.areaDescription,
            reference: currentMonitoringInstrument.reference,
            isActive: currentMonitoringInstrument.isActive,
            startRules: currentMonitoringInstrument.startRules,
            published: currentMonitoringInstrument.published,
            creationDate: currentMonitoringInstrument.creationDate,
          }
          : null,

        // Datos del plan de monitoreo
        monitoringPlanData: currentMonitoringPlan
          ? {
            id: currentMonitoringPlan.id,
            key: currentMonitoringPlan.key,
            code: currentMonitoringPlan.code,
            name: currentMonitoringPlan.name,
            actors: currentMonitoringPlan.actors,
            dre: currentMonitoringPlan.dre,
            ugel: currentMonitoringPlan.ugel,
            ugels: currentMonitoringPlan.ugels,
            site: currentMonitoringPlan.site,
            period: currentMonitoringPlan.period,
            description: currentMonitoringPlan.description,
            periodMin: currentMonitoringPlan.periodMin,
            periodMax: currentMonitoringPlan.periodMax,
            startDate: currentMonitoringPlan.startDate,
            endDate: currentMonitoringPlan.endDate,
            isActive: currentMonitoringPlan.isActive,
            isFinish: currentMonitoringPlan.isFinish,
            public: currentMonitoringPlan.public,
            enuType: currentMonitoringPlan.enuType,
            typeDescription: currentMonitoringPlan.typeDescription,
            idLogicalFramework: currentMonitoringPlan.idLogicalFramework,
            nameLogicalFramework: currentMonitoringPlan.nameLogicalFramework,
            logicalFramework: currentMonitoringPlan.logicalFramework,
            stage: currentMonitoringPlan.stage,
            stageDescription: currentMonitoringPlan.stageDescription,
            mode: currentMonitoringPlan.mode,
            modeDescription: currentMonitoringPlan.modeDescription,
          }
          : null,

        // Datos de aspectos obtenidos en paralelo
        aspectsData: aspectsData || null,

        // Respuestas de aspectos obtenidas en paralelo
        aspectsResponseData: aspectsResponseData || null,

        // Metadata de la sesión
        sessionMetadata: {
          savedAt: new Date().toISOString(),
          dataVersion: '1.0',
          totalDataPoints: 0, // Se calculará después
        },
      };

      // Calcular el total de puntos de datos
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
      if (data.aspectsResponseData && data.aspectsResponseData !== null) {
        totalDataPoints += data.aspectsResponseData.totalResponses || 0;
      }

      data.sessionMetadata.totalDataPoints = totalDataPoints;

      // Calcular el tamaño de los datos
      const dataString = JSON.stringify(data);
      const dataSizeInBytes = new Blob([dataString]).size;
      const dataSizeInKB = (dataSizeInBytes / 1024).toFixed(2);

      // Guardar en almacenamiento local
      const key = `monitoring_data_fallback_${sample.id}_${visitAnswer.id}`;
      await StorageAdapter.setItem(key, data);

      console.log(
        '✅ Datos de monitoreo guardados en local (fallback):',
        sample.id,
      );
      console.log(`📊 Tamaño de datos: ${dataSizeInKB} KB`);

      return {
        success: true,
        message: `Datos guardados correctamente (fallback). Tamaño: ${dataSizeInKB} KB`,
        dataSize: parseFloat(dataSizeInKB),
      };
    } catch (error) {
      console.error(
        '❌ Error al guardar datos de monitoreo en local (fallback):',
        error,
      );
      return {
        success: false,
        message: 'Error al guardar datos de monitoreo en local (fallback)',
        dataSize: 0,
      };
    }
  },

  getPlans: async (
    request: PageRequest,
    query: string,
    lastKey: string,
    site: Site,
    isDirector: boolean,
    isFinished?: boolean,
    actorCode?: string,
    institution?: Institution,
  ): Promise<StatusPageResponse<MonitoringPlan[]>> => {
    const resp = await getPlans(
      request,
      query,
      lastKey,
      MonitoringMapper.SiteEntityToSitesResponse(site),
      isDirector,
      isFinished,
      actorCode,
      institution
        ? MonitoringMapper.InstitutionEntityToInstitutionResponse(institution)
        : undefined,
    );
    return resp;
  },

  getPlan: async (id: string): Promise<StatusResponse<MonitoringPlan>> => {
    const resp = await getPlan(id);
    return resp;
  },

  getInstruments: async (
    request: PageRequest,
    query: string,
    lastKey: string,
    idPlan: string,
  ): Promise<StatusPageResponse<MonitoringInstrument[]>> => {
    const resp = await getInstruments(request, query, lastKey, idPlan);
    return resp;
  },

  getInstrument: async (
    id: string,
  ): Promise<StatusResponse<MonitoringInstrument>> => {
    const resp = await getInstrument(id);
    return resp;
  },

  getItemsByInstrumentAspect: async (
    instrumentId: string,
    aspectId: string,
  ): Promise<StatusResponse<InstrumentItem[]>> => {
    try {
      console.log(
        'Store: Obteniendo items para instrumento:',
        instrumentId,
        'aspecto:',
        aspectId,
      );
      const resp = await getItemsByInstrumentAspect(instrumentId, aspectId);
      console.log('Store: Items obtenidos:', resp.data?.length || 0, 'items');
      return resp;
    } catch (error) {
      console.error('Error getting items by instrument aspect:', error);
      throw error;
    }
  },

  getByAnswerVisitaAspect: async (
    visitId: string,
    aspectId: string,
  ): Promise<StatusResponse<any[]>> => {
    try {
      console.log(
        'Store: Obteniendo respuestas para visita:',
        visitId,
        'aspecto:',
        aspectId,
      );
      const resp = await getByAnswerVisitaAspect(visitId, aspectId);
      console.log(
        'Store: Respuestas obtenidas:',
        resp.data?.length || 0,
        'respuestas',
      );
      return resp;
    } catch (error) {
      console.error('Error getting responses by visit aspect:', error);
      throw error;
    }
  },

  getSamples: async (
    request: PageRequest,
    documentNumber: string,
    documentType: string,
    query: string,
    typeSite: number,
    codeSite: string,
    lastKey: string,
    instrumentId: string,
  ): Promise<StatusPageResponse<Sample[]>> => {
    const resp = await getSamples(
      request,
      documentNumber,
      documentType,
      query,
      typeSite,
      codeSite,
      lastKey,
      instrumentId,
    );
    return resp;
  },

  getSampleVisits: async (
    request: PageRequest,
    query: string,
    lastKey: string,
    sampleId: string,
  ): Promise<StatusPageResponse<VisitAnswer[]>> => {
    const resp = await getSampleVisits(request, query, lastKey, sampleId);
    return resp;
  },

  getSampleVisit: async (id: string): Promise<StatusResponse<VisitAnswer>> => {
    const resp = await getSampleVisit(id);
    return resp;
  },

  sendAddScheduleVisit: async (
    visit: Visit,
  ): Promise<StatusResponse<boolean>> => {
    try {
      return await sendAddScheduleVisit(visit);
    } catch (error) {
      throw error;
    }
  },

  sendUpdateScheduleVisit: async (
    sampleId: string,
    visit: Visit,
  ): Promise<StatusResponse<boolean>> => {
    const resp = await sendUpdateScheduleVisit(sampleId, visit);
    return resp;
  },

  sendUpdateVisit: async (
    visit: VisitAnswer,
  ): Promise<StatusResponse<boolean>> => {
    try {
      const mappedVisit = MonitoringMapper.VisitAnswerToResponse(visit);
      mappedVisit.aspectosCompletados = [];
      if (
        visit.status ===
        ENUMS.configuracion.tipoEstadoVisita.children.enEjecucion
      ) {
        if (visit.withReplacement) {
          return await updateExecutionStartWithReplacement(mappedVisit);
        } else {
          return await updateSampleVisitExecution(mappedVisit);
        }
      }
      if (
        visit.status ===
        ENUMS.configuracion.tipoEstadoVisita.children.culminadoSinEjecucion
      ) {
        return await updateCompletedWithoutExecution(mappedVisit);
      }
      // reprogramación
      if (mappedVisit.esReprogramada) {
        return await updateRescheduling(mappedVisit);
      }
      return {
        success: false,
        statusCode: 500,
        message: 'Error al actualizar la visita',
        messages: ['No coincide el estado de la visita'],
        data: false,
      };
    } catch (error) {
      console.error('Error en sendUpdateVisit:', error);
      return {
        success: false,
        statusCode: 500,
        message: 'Error al actualizar la visita',
        messages: ['Ocurrió un error al actualizar la visita'],
        data: false,
      };
    }
  },

  sendVisitAnswers: async (visitAnswerData: any) => {
    try {
      console.log(
        '📤 Enviando respuestas de visita al backend:',
        visitAnswerData,
      );

      const response = await sendVisitAnswers(visitAnswerData);

      if (response.success) {
        console.log('✅ Respuestas enviadas exitosamente');
        return {
          success: true,
          message: response.message || 'Respuestas guardadas correctamente',
        };
      } else {
        console.error(
          '❌ Error en la respuesta del servidor:',
          response.messages,
        );
        return {
          success: false,
          message: response.message || 'Error al guardar las respuestas',
        };
      }
    } catch (error) {
      console.error('❌ Error enviando respuestas de visita:', error);
      return {
        success: false,
        message: 'Error al enviar las respuestas de la visita',
      };
    }
  },

  sendObservationAndCommitments: async (
    visitId: string,
    observation: string,
    commitments: string[],
  ) => {
    try {
      console.log('📤 Enviando observación y compromisos:', {
        visitId,
        observation,
        commitments,
      });

      const response = await sendObservationAndCommitments(
        visitId,
        observation,
        commitments,
      );

      if (response.success) {
        console.log('✅ Observación y compromisos enviados exitosamente');
        return {
          success: true,
          message:
            response.message ||
            'Observación y compromisos guardados correctamente',
        };
      } else {
        console.error(
          '❌ Error en la respuesta del servidor:',
          response.messages,
        );
        return {
          success: false,
          message:
            response.message || 'Error al guardar observación y compromisos',
        };
      }
    } catch (error) {
      console.error('❌ Error enviando observación y compromisos:', error);
      return {
        success: false,
        message: 'Error al enviar observación y compromisos',
      };
    }
  },

  sendVisitMuestra: async (visitAnswer: any) => {
    try {
      console.log('📤 Enviando visita de muestra al backend:', visitAnswer);

      const response = await sendVisitMuestra(visitAnswer);

      if (response.success) {
        console.log('✅ Visita de muestra enviada exitosamente');
        return {
          success: true,
          message:
            response.message || 'Visita de muestra enviada correctamente',
        };
      } else {
        console.error(
          '❌ Error en la respuesta del servidor:',
          response.messages,
        );
        return {
          success: false,
          message: response.message || 'Error al enviar visita de muestra',
        };
      }
    } catch (error) {
      console.error('❌ Error enviando visita de muestra:', error);
      return {
        success: false,
        message: 'Error al enviar visita de muestra',
      };
    }
  },

  addAutoSample: async (id: string, samples: any[]) => {
    try {
      const response = await addAutoSample(id, samples);

      if (response.success) {
        return {
          success: true,
          message: response.message || 'Muestras añadidas correctamente',
        };
      } else {
        return {
          success: false,
          message: response.message || 'Error al añadir muestras',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error al añadir muestras',
      };
    }
  },

  // Métodos para gestión de datos offline
  getOfflineMonitoringData: async (sampleId: string, visitAnswerId: string) => {
    try {
      const offlineService = OfflineMonitoringService.getInstance();
      await offlineService.initialize();
      const repository = offlineService.getRepository();

      return await repository.getOfflineMonitoringData(sampleId, visitAnswerId);
    } catch (error) {
      console.error('❌ Error obteniendo datos offline:', error);
      return {
        success: false,
        message: `Error al obtener datos offline: ${error}`,
      };
    }
  },

  getAllOfflineMonitoringData: async (userId: string) => {
    try {
      const offlineService = OfflineMonitoringService.getInstance();
      await offlineService.initialize();
      const repository = offlineService.getRepository();

      return await repository.getAllOfflineMonitoringData({ userId });
    } catch (error) {
      console.error('❌ Error obteniendo todos los datos offline:', error);
      return {
        success: false,
        data: [],
        message: `Error al obtener datos offline: ${error}`,
      };
    }
  },

  getPendingSyncData: async () => {
    try {
      const offlineService = OfflineMonitoringService.getInstance();
      await offlineService.initialize();
      const repository = offlineService.getRepository();

      return await repository.getPendingSyncData();
    } catch (error) {
      console.error(
        '❌ Error obteniendo datos pendientes de sincronización:',
        error,
      );
      return {
        success: false,
        data: [],
        message: `Error al obtener datos pendientes: ${error}`,
      };
    }
  },

  getOfflineStorageStats: async () => {
    try {
      const offlineService = OfflineMonitoringService.getInstance();
      await offlineService.initialize();
      const repository = offlineService.getRepository();

      return await repository.getOfflineStorageStats();
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas offline:', error);
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
  },

  markOfflineDataAsSynced: async (sampleId: string, visitAnswerId: string) => {
    try {
      const offlineService = OfflineMonitoringService.getInstance();
      await offlineService.initialize();
      const repository = offlineService.getRepository();

      return await repository.markAsSynced(sampleId, visitAnswerId);
    } catch (error) {
      console.error('❌ Error marcando datos como sincronizados:', error);
      return {
        success: false,
        message: `Error al marcar como sincronizado: ${error}`,
      };
    }
  },

  deleteOfflineData: async (id: number) => {
    try {
      const offlineService = OfflineMonitoringService.getInstance();
      await offlineService.initialize();
      const repository = offlineService.getRepository();

      return await repository.deleteOfflineData(id);
    } catch (error) {
      console.error('❌ Error eliminando datos offline:', error);
      return {
        success: false,
        message: `Error al eliminar datos offline: ${error}`,
      };
    }
  },

  cleanOldOfflineData: async (daysOld: number = 30) => {
    try {
      const offlineService = OfflineMonitoringService.getInstance();
      await offlineService.initialize();
      const repository = offlineService.getRepository();

      return await repository.cleanOldData(daysOld);
    } catch (error) {
      console.error('❌ Error limpiando datos antiguos:', error);
      return {
        success: false,
        deletedCount: 0,
        message: `Error al limpiar datos antiguos: ${error}`,
      };
    }
  },

  hasOfflineData: async (sampleId: string, visitAnswerId: string): Promise<{
    hasData: boolean;
    lastSyncedAt?: string | null;
    updatedAt?: string;
  }> => {
    try {
      const offlineService = OfflineMonitoringService.getInstance();
      await offlineService.initialize();
      const repository = offlineService.getRepository();

      return await repository.hasOfflineData(sampleId, visitAnswerId);
    } catch (error) {
      console.error('❌ Error verificando existencia de datos offline:', error);
      return {
        hasData: false,
        lastSyncedAt: null,
        updatedAt: '',
      };
    }
  },

  updateOfflineResponsesData: async (
    userId: string,
    visitAnswerId: string,
    sampleId: string,
    aspectId: string,
    newResponses: any[],
  ) => {
    try {
      console.log('🔄 Actualizando respuestas offline:', {
        visitAnswerId,
        aspectId,
        responsesCount: newResponses.length,
        newResponses,
      });

      const offlineService = OfflineMonitoringService.getInstance();
      await offlineService.initialize();
      const repository = offlineService.getRepository();

      console.log(
        '🔄 Obteniendo datos existentes de SQLite:',
        aspectId,
        sampleId,
        visitAnswerId,
      );
      // Obtener los datos existentes de SQLite
      const existingData = await repository.getOfflineMonitoringData(
        sampleId,
        visitAnswerId,
      );
      console.log('🔄 Datos existentes de SQLite:', existingData);
      if (!existingData.success || !existingData.data) {
        return {
          success: false,
          message: 'No se encontraron datos offline para actualizar',
        };
      }

      const monitoringData = existingData.data;

      // Asegurar que aspectsResponseData existe
      if (!monitoringData.aspectsResponseData) {
        monitoringData.aspectsResponseData = {
          aspects: [],
          totalResponses: 0,
          totalAspects: 0,
        };
      }

      // Buscar si ya existe el aspecto en aspectsResponseData
      let aspectIndex = monitoringData.aspectsResponseData.aspects.findIndex(
        (aspect: any) => aspect.aspectId === aspectId,
      );

      if (aspectIndex === -1) {
        // Crear nuevo aspecto
        monitoringData.aspectsResponseData.aspects.push({
          aspectId: aspectId,
          responses: newResponses,
          totalResponses: newResponses.length,
        });
      } else {
        // Actualizar respuestas existentes o fusionar
        const existingResponses =
          monitoringData.aspectsResponseData.aspects[aspectIndex].responses ||
          [];

        // Mapear nuevas respuestas para actualizar o agregar
        const updatedResponses = [...existingResponses];

        console.log(
          '🔄 Actualizando respuestas existentes:',
          updatedResponses,
          newResponses,
        );
        newResponses.forEach((newResponse: any) => {
          const existingIndex = updatedResponses.findIndex(
            (existing: any) =>
              existing.idItemInstrumento === newResponse.idItemInstrumento,
          );

          if (existingIndex !== -1) {
            // Actualizar respuesta existente
            updatedResponses[existingIndex] = {
              ...updatedResponses[existingIndex],
              ...newResponse,
              fechaModificacion: new Date().toISOString(),
            };
            console.log(
              `✅ Respuesta actualizada para item: ${newResponse.idItemInstrumento}`,
            );
          } else {
            // Agregar nueva respuesta
            updatedResponses.push({
              ...newResponse,
              fechaCreacion: new Date().toISOString(),
              fechaModificacion: new Date().toISOString(),
            });
            console.log(
              `➕ Nueva respuesta agregada para item: ${newResponse.idItemInstrumento}`,
            );
          }
        });

        monitoringData.aspectsResponseData.aspects[aspectIndex].responses =
          updatedResponses;
        monitoringData.aspectsResponseData.aspects[aspectIndex].totalResponses =
          updatedResponses.length;
      }

      // Recalcular totales
      monitoringData.aspectsResponseData.totalResponses =
        monitoringData.aspectsResponseData.aspects.reduce(
          (total: number, aspect: any) => total + (aspect.totalResponses || 0),
          0,
        );
      monitoringData.aspectsResponseData.totalAspects =
        monitoringData.aspectsResponseData.aspects.length;

      // Actualizar en SQLite manteniendo el mismo sample y visitAnswer
      const updateResult = await repository.saveOfflineMonitoringData(
        userId,
        monitoringData.sampleData,
        monitoringData.visitAnswerData,
        {
          currentMonitoringInstrument: monitoringData.monitoringInstrumentData,
          currentMonitoringPlan: monitoringData.monitoringPlanData,
          aspectsData: monitoringData.aspectsData,
          aspectsResponseData: monitoringData.aspectsResponseData,
        },
      );

      if (updateResult.success) {
        console.log(
          '✅ Datos de respuestas actualizados exitosamente en SQLite',
        );
        return {
          success: true,
          message: `Respuestas del aspecto ${aspectId} actualizadas correctamente`,
        };
      } else {
        return {
          success: false,
          message:
            updateResult.message || 'Error al actualizar los datos en SQLite',
        };
      }
    } catch (error) {
      console.error('❌ Error actualizando respuestas offline:', error);
      return {
        success: false,
        message: `Error al actualizar respuestas offline: ${error}`,
      };
    }
  },

  updateObservationAndCommitments: async (
    userId: string,
    sampleId: string,
    visitAnswerId: string,
    observation: string,
    commitments: string[],
  ) => {
    try {
      console.log('🔄 Actualizando observation y commitments offline:', {
        sampleId,
        visitAnswerId,
        observation,
        commitmentsCount: commitments.length,
      });

      const offlineService = OfflineMonitoringService.getInstance();
      await offlineService.initialize();
      const repository = offlineService.getRepository();

      return await repository.updateObservationAndCommitments(
        userId,
        sampleId,
        visitAnswerId,
        observation,
        commitments,
      );
    } catch (error) {
      console.error('❌ Error actualizando observation y commitments:', error);
      return {
        success: false,
        message: `Error al actualizar observation y commitments: ${error}`,
      };
    }
  },

  updatePreExecutionData: async (
    userId: string,
    sampleId: string,
    visitAnswerId: string,
    preExecutionData: any,
  ) => {
    try {
      console.log('🔄 Actualizando preExecutionData offline:', {
        sampleId,
        visitAnswerId,
        preExecutionData,
      });

      const offlineService = OfflineMonitoringService.getInstance();
      await offlineService.initialize();
      const repository = offlineService.getRepository();

      return await repository.updatePreExecutionData(
        userId,
        sampleId,
        visitAnswerId,
        preExecutionData,
      );
    } catch (error) {
      throw error;
    }
  },

  /*
   * Sólo se usa en modo online en handleSave de PreExecutionForm
   */
  updateVisitAnswerDataFromPreExecution: async (
    userId: string,
    sampleId: string,
    visitAnswerId: string,
    offline: boolean,
  ) => {
    try {
      console.log('🔄 Actualizando visitAnswerData desde preExecutionData:', {
        sampleId,
        visitAnswerId,
      });

      const offlineService = OfflineMonitoringService.getInstance();
      await offlineService.initialize();
      const repository = offlineService.getRepository();

      return await repository.updateVisitAnswerDataFromPreExecution(
        userId,
        sampleId,
        visitAnswerId,
        offline,
      );
    } catch (error) {
      console.error(
        '❌ Error actualizando visitAnswerData desde preExecutionData:',
        error,
      );
      throw error;
    }
  },

  checkLocalDataSyncStatus: async (
    sampleId: string,
    visitAnswerId: string,
    webStatus: string,
  ) => {
    try {
      console.log('🔄 Verificando estado de sincronización local:', {
        sampleId,
        visitAnswerId,
        webStatus,
      });

      const offlineService = OfflineMonitoringService.getInstance();
      await offlineService.initialize();
      const repository = offlineService.getRepository();

      // Verificar si existe datos locales
      const hasLocalData = await repository.hasOfflineData(
        sampleId,
        visitAnswerId,
      );

      if (!hasLocalData) {
        return {
          hasLocalData: false,
          needsSync: false,
          message: 'No hay datos locales para esta visita',
        };
      }

      // Obtener los datos locales para verificar el estado
      const localData = await repository.getOfflineMonitoringData(
        sampleId,
        visitAnswerId,
      );

      if (!localData.success || !localData.data) {
        return {
          hasLocalData: false,
          needsSync: false,
          message: 'Error al obtener datos locales',
        };
      }

      const localStatus = localData.data.visitAnswerData?.status;

      // Verificar si necesita sincronización
      // Condición: webStatus es 'programado' y localStatus es diferente a 'programado'
      const needsSync =
        webStatus ===
        ENUMS.configuracion.tipoEstadoVisita.children.programado &&
        localStatus !==
        ENUMS.configuracion.tipoEstadoVisita.children.programado;

      console.log('📊 Estado de sincronización:', {
        webStatus,
        localStatus,
        needsSync,
      });

      return {
        hasLocalData: true,
        localStatus,
        needsSync,
        message: needsSync
          ? 'Hay datos locales que necesitan sincronización'
          : 'Los datos locales están sincronizados',
      };
    } catch (error) {
      console.error('❌ Error verificando estado de sincronización:', error);
      return {
        hasLocalData: false,
        needsSync: false,
        message: `Error al verificar sincronización: ${error}`,
      };
    }
  },

  // Método principal de sincronización - orquesta todos los pasos
  syncOfflineData: async (
    userId: string,
    sampleId: string,
    visitAnswerId: string,
    withSend: boolean = false,
  ) => {
    try {
      console.log('🔄 Iniciando sincronización de datos offline...', {
        sampleId,
        visitAnswerId,
      });

      // Paso 1: Validar datos locales
      const validationResult = await get().validateLocalDataForSync(
        sampleId,
        visitAnswerId,
      );
      if (!validationResult.success) {
        return validationResult;
      }

      const { data: localData } = validationResult;
      const visitAnswerData = localData.visitAnswerData;

      // Paso 2: Verificar si requiere sincronización
      const statusCheck = get().checkSyncStatusRequirement(visitAnswerData);
      if (!statusCheck.shouldSync) {
        return {
          success: true,
          message: statusCheck.message,
        };
      }

      console.log('✅ Estado válido para sincronización:', statusCheck.status);

      // Paso 3: Preparar datos para envío
      const visitAnswerToSync =
        get().prepareVisitAnswerForSync(visitAnswerData);

      // Paso 4: Enviar al servidor
      const sendResult = await get().sendVisitToServer(visitAnswerToSync);
      if (!sendResult.success) {
        return sendResult;
      }

      // Paso 5: Eliminar datos locales si el estado no es "enEjecucion"
      const currentStatus = visitAnswerData.status;
      const isNotInExecution =
        currentStatus !==
        ENUMS.configuracion.tipoEstadoVisita.children.enEjecucion;

      if (isNotInExecution) {
        await get().deleteOfflineDataByVisit(sampleId, visitAnswerId);
        return {
          success: true,
          message: 'Datos eliminados correctamente',
        };
      }

      // Paso 6: Sincronizar observaciones y compromisos
      if (
        visitAnswerData.observation ||
        (visitAnswerData.commitments && visitAnswerData.commitments.length > 0)
      ) {
        await get().sendObservationAndCommitments(
          visitAnswerData.visitAnswerId,
          visitAnswerData.observation || '',
          visitAnswerData.commitments || [],
        );
      }

      // Paso 7: Sincronizar archivos offline
      await get().syncOfflineFiles(sampleId, visitAnswerId);

      // Paso 8: Actualizar respuestas con códigos reales de archivos
      await get().updateResponsesWithRealFileCodes(userId, sampleId, visitAnswerId);

      // Paso 9: Obtener datos actualizados después de las modificaciones
      console.log(
        '🔄 Obteniendo datos actualizados después de sincronización de archivos...',
      );
      const updatedDataResult = await get().getOfflineMonitoringData(
        sampleId,
        visitAnswerId,
      );
      if (
        !updatedDataResult.success ||
        !updatedDataResult.data?.aspectsResponseData?.aspects
      ) {
        console.warn(
          '⚠️ No se pudieron obtener datos actualizados, usando datos originales',
        );
      } else {
        localData.aspectsResponseData =
          updatedDataResult.data.aspectsResponseData;
        console.log('✅ Datos actualizados obtenidos correctamente');
      }

      // Paso 10: Sincronizar respuestas de aspectos
      if (localData.aspectsResponseData?.aspects) {
        for (const aspect of localData.aspectsResponseData.aspects) {
          if (aspect.responses && aspect.responses.length > 0) {
            const visitaRespuestaContainer = {
              respuestas: aspect.responses,
              idAspecto: aspect.aspectId,
              idVisitaMuestra: visitAnswerData.visitAnswerId,
            };
            await get().sendVisitAnswers(visitaRespuestaContainer);
          }
        }
      }

      // Si sigue en ejecución y se sincronizó, actualizamos la fecha de sincronización
      if (localData.visitAnswerData) {
        console.log('✅ Actualizando fecha de sincronización', localData.visitAnswerData);
        await get().markOfflineDataAsSynced(sampleId, visitAnswerId);
      }
      if (!withSend) {
        return {
          success: true,
          message: 'Datos sincronizados correctamente',
        };
      }

      // Paso 11: Enviar la visita completa (equivalente a handleConfirmSend)
      try {
        const sampleData = localData.sampleData;
        const instrumentData = localData.monitoringInstrumentData;
        const planData = localData.monitoringPlanData;

        // Completar datos faltantes de la visita antes de mapear
        const visitAnswerComplete = {
          ...visitAnswerToSync,
          executionStartDate:
            visitAnswerToSync.executionStartDate || new Date(),
          executionStartTime:
            visitAnswerToSync.executionStartTime ||
            new Date().toTimeString().split(' ')[0],
          monitorType:
            visitAnswerToSync.monitorType || sampleData?.monitorType || '',
          monitorTypeDescription:
            (visitAnswerToSync as any).monitorTypeDescription ||
            sampleData?.monitorTypeDescription ||
            '',
          monitorDocumentType:
            visitAnswerToSync.monitorDocumentType ||
            sampleData?.monitorDocumentType ||
            0,
          monitorDocumentNumber:
            visitAnswerToSync.monitorDocumentNumber ||
            sampleData?.monitorDocumentNumber ||
            '',
          monitorFirstName:
            visitAnswerToSync.monitorFirstName ||
            sampleData?.monitorFirstName ||
            '',
          monitorLastName:
            visitAnswerToSync.monitorLastName ||
            sampleData?.monitorLastName ||
            '',
          monitorMiddleName:
            visitAnswerToSync.monitorMiddleName ||
            sampleData?.monitorMiddleName ||
            '',
          monitorSite: visitAnswerToSync.monitorSite || sampleData?.monitorSite,
        } as any;

        // Mapear a respuesta
        const visitAnswerResponse: any =
          MonitoringMapper.VisitAnswerToResponse(visitAnswerComplete);

        // Agregar entidades anidadas
        if (sampleData) {
          visitAnswerResponse.muestra =
            MonitoringMapper.SampleToNestedSampleResponse(sampleData);
        }
        if (instrumentData) {
          visitAnswerResponse.instrumento =
            MonitoringMapper.MonitoringInstrumentToNestedInstrumentResponse(
              instrumentData,
            );
        }
        if (planData) {
          visitAnswerResponse.plan = {
            codigo: planData.code || '',
            nombre: planData.name || '',
            enuTipo: planData.enuType || '',
            tipoDescripcion: planData.typeDescription || '',
            dre: planData.dre
              ? MonitoringMapper.SiteEntityToSitesResponse(planData.dre)
              : undefined,
            ugel: planData.ugel
              ? MonitoringMapper.SiteEntityToSitesResponse(planData.ugel)
              : undefined,
            sede: planData.site
              ? MonitoringMapper.SiteEntityToSitesResponse(planData.site)
              : undefined,
            ugels: (planData.ugels || []).map((u: any) =>
              MonitoringMapper.SiteEntityToSitesResponse(u),
            ),
            actores: planData.actors || [],
            idMarcoLogico: planData.idLogicalFramework || '',
            marcoLogicoNombre: planData.nameLogicalFramework || '',
            descripcion: planData.description || '',
            periodo: planData.period || 2021,
            etapa: planData.stage || 1,
            etapaDescripcion: planData.stageDescription || '',
            modalidad: (planData as any).mode || '01',
            modalidadDescripcion: (planData as any).modeDescription || '',
            fechaInicio: planData.startDate || new Date(),
            fechaFin: planData.endDate || new Date(),
            esActivo: planData.isActive ?? true,
            esCulminado: planData.isFinish ?? false,
            publicado: planData.public ?? true,
            id: planData.id || '',
            key: planData.key || '',
            fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            usuarioCreacion: '',
            usuarioModificacion: '',
            inKey: undefined,
            componentes: [],
          };
        }

        const sendVisitResult = await get().sendVisitMuestra(
          visitAnswerResponse,
        );
        if (!sendVisitResult.success) {
          return {
            success: false,
            message:
              sendVisitResult.message || 'Error al enviar la visita completa',
          };
        }

        await get().deleteOfflineDataByVisit(sampleId, visitAnswerId);

        console.log('✅ Visita enviada correctamente con sendVisitMuestra');
      } catch (sendError) {
        console.error('❌ Error al enviar la visita completa:', sendError);
        return {
          success: false,
          message: `Error al enviar la visita completa: ${sendError}`,
        };
      }

      return {
        success: true,
        message: 'Datos sincronizados y visita enviada correctamente',
      };
    } catch (error) {
      console.error('❌ Error durante la sincronización:', error);
      return {
        success: false,
        message: `Error durante la sincronización: ${error}`,
      };
    }
  },

  // Paso 1: Validar datos locales
  validateLocalDataForSync: async (sampleId: string, visitAnswerId: string) => {
    try {
      console.log('📥 Obteniendo datos locales...');
      const localDataResult = await get().getOfflineMonitoringData(
        sampleId,
        visitAnswerId,
      );

      if (!localDataResult.success || !localDataResult.data) {
        return {
          success: false,
          message: 'No se encontraron datos locales para sincronizar',
        };
      }

      const localData = localDataResult.data;
      const visitAnswerData = localData.visitAnswerData;

      if (!visitAnswerData) {
        return {
          success: false,
          message: 'No se encontraron datos de visita para sincronizar',
        };
      }

      console.log('📊 Datos locales obtenidos:', {
        visitAnswerId: visitAnswerData.visitAnswerId,
        status: visitAnswerData.status,
        sampleId: visitAnswerData.sampleId,
      });

      return {
        success: true,
        data: localData,
        message: 'Datos locales validados correctamente',
      };
    } catch (error) {
      console.error('❌ Error validando datos locales:', error);
      return {
        success: false,
        message: `Error validando datos locales: ${error}`,
      };
    }
  },

  // Paso 2: Verificar si el estado requiere sincronización
  checkSyncStatusRequirement: (visitAnswerData: any) => {
    const currentStatus = visitAnswerData.status;
    const shouldSync =
      currentStatus ===
      ENUMS.configuracion.tipoEstadoVisita.children.culminadoSinEjecucion ||
      currentStatus ===
      ENUMS.configuracion.tipoEstadoVisita.children.enEjecucion;

    if (!shouldSync) {
      console.log(
        'ℹ️ El estado actual no requiere sincronización:',
        currentStatus,
      );
      return {
        shouldSync: false,
        status: currentStatus,
        message: `El estado actual (${currentStatus}) no requiere sincronización`,
      };
    }

    return {
      shouldSync: true,
      status: currentStatus,
      message: `Estado válido para sincronización: ${currentStatus}`,
    };
  },

  // Paso 3: Preparar datos de visita para sincronización
  prepareVisitAnswerForSync: (visitAnswerData: any): VisitAnswer => {
    console.log('📤 Preparando datos para envío...');

    return {
      id: visitAnswerData.visitAnswerId,
      sampleId: visitAnswerData.sampleId,
      visitNumber: visitAnswerData.visitNumber,
      code: visitAnswerData.code,
      visitType: visitAnswerData.visitType,
      status: visitAnswerData.status,
      completedAspects: visitAnswerData.completedAspects,
      subjectFound: visitAnswerData.subjectFound,
      withReplacement: visitAnswerData.withReplacement,
      isRescheduled: visitAnswerData.isRescheduled,
      scheduledDate: visitAnswerData.scheduledDate,
      startTime: visitAnswerData.startTime,
      endTime: visitAnswerData.endTime,
      additionalData: visitAnswerData.additionalData,
      isExecutionAdjustment: visitAnswerData.isExecutionAdjustment,
      executionStartDate: visitAnswerData.executionStartDate,
      executionStartTime: visitAnswerData.executionStartTime,
      executionEndDate: visitAnswerData.executionEndDate,
      executionEndTime: visitAnswerData.executionEndTime,
      isCanceled: visitAnswerData.isCanceled,
      auxiliaryFirstName: visitAnswerData.auxiliaryFirstName,
      auxiliaryLastName: visitAnswerData.auxiliaryLastName,
      auxiliaryMiddleName: visitAnswerData.auxiliaryMiddleName,
      observation: visitAnswerData.observation,
      commitments: visitAnswerData.commitments,
      monitorType: visitAnswerData.monitorType,
      monitorDocumentType: visitAnswerData.monitorDocumentType,
      monitorDocumentNumber: visitAnswerData.monitorDocumentNumber,
      monitorFirstName: visitAnswerData.monitorFirstName,
      monitorLastName: visitAnswerData.monitorLastName,
      monitorMiddleName: visitAnswerData.monitorMiddleName,
      monitorSite: visitAnswerData.monitorSite,
      sample: visitAnswerData.sample,
      instrument: visitAnswerData.instrument,
      plan: visitAnswerData.plan,
      executionError: visitAnswerData.executionError,
      binnacle: visitAnswerData.binnacle,
    };
  },

  // Paso 4: Enviar visita al servidor
  sendVisitToServer: async (visitAnswer: VisitAnswer) => {
    try {
      console.log('🚀 Enviando datos al servidor...');
      const updateResult = await get().sendUpdateVisit(visitAnswer);

      if (updateResult.success) {
        console.log('✅ Datos sincronizados exitosamente');
        return {
          success: true,
          message: 'Datos sincronizados correctamente con el servidor',
        };
      } else {
        console.error('❌ Error en el servidor:', updateResult.message);
        return {
          success: false,
          message: `Error del servidor: ${updateResult.message}`,
        };
      }
    } catch (error) {
      console.error('❌ Error enviando visita al servidor:', error);
      return {
        success: false,
        message: `Error enviando visita al servidor: ${error}`,
      };
    }
  },

  // Paso 5: Eliminar datos offline por visita
  deleteOfflineDataByVisit: async (sampleId: string, visitAnswerId: string) => {
    try {
      console.log('🗑️ Eliminando datos offline por visita...', {
        sampleId,
        visitAnswerId,
      });

      const offlineService = OfflineMonitoringService.getInstance();
      await offlineService.initialize();
      const repository = offlineService.getRepository();

      const result = await repository.deleteOfflineDataByVisit(
        sampleId,
        visitAnswerId,
      );

      if (result.success) {
        console.log('✅ Datos offline eliminados exitosamente');
        return {
          success: true,
          message: 'Datos offline eliminados correctamente',
        };
      } else {
        console.error('❌ Error eliminando datos offline:', result.message);
        return {
          success: false,
          message: `Error eliminando datos offline: ${result.message}`,
        };
      }
    } catch (error) {
      console.error('❌ Error eliminando datos offline:', error);
      return {
        success: false,
        message: `Error eliminando datos offline: ${error}`,
      };
    }
  },

  // Actualizar aspectos completados en datos offline
  updateCompletedAspects: async (
    userId: string,
    sampleId: string,
    visitAnswerId: string,
    aspectId: string,
  ) => {
    try {
      const offlineService = OfflineMonitoringService.getInstance();
      await offlineService.initialize();
      const repository = offlineService.getRepository();

      // Obtener los datos existentes de SQLite
      const existingData = await repository.getOfflineMonitoringData(
        sampleId,
        visitAnswerId,
      );

      if (!existingData.success || !existingData.data) {
        return {
          success: false,
          message:
            'No se encontraron datos offline para actualizar aspectos completados',
        };
      }

      const monitoringData = existingData.data;

      // Verificar que existe visitAnswerData
      if (!monitoringData.visitAnswerData) {
        return {
          success: false,
          message: 'No se encontró visitAnswerData en los datos offline',
        };
      }

      // Obtener aspectos completados actuales
      const currentCompletedAspects =
        monitoringData.visitAnswerData.completedAspects || [];

      // Verificar si el aspecto ya está completado
      if (currentCompletedAspects.includes(aspectId)) {
        return {
          success: true,
          message: 'El aspecto ya estaba marcado como completado',
        };
      }

      // Agregar el nuevo aspecto completado
      const updatedCompletedAspects = [...currentCompletedAspects, aspectId];

      // Actualizar visitAnswerData
      monitoringData.visitAnswerData.completedAspects = updatedCompletedAspects;

      // Construir el sample y visitAnswer para la actualización
      const sampleData = monitoringData.sampleData;
      const visitAnswerData = monitoringData.visitAnswerData;

      const updateResult = await repository.saveOfflineMonitoringData(
        userId,
        sampleData,
        visitAnswerData,
        {
          currentMonitoringInstrument: monitoringData.monitoringInstrumentData,
          currentMonitoringPlan: monitoringData.monitoringPlanData,
          aspectsData: monitoringData.aspectsData,
          aspectsResponseData: monitoringData.aspectsResponseData,
        },
      );

      if (updateResult.success) {
        return {
          success: true,
          message: `Aspecto ${aspectId} marcado como completado correctamente`,
        };
      } else {
        return {
          success: false,
          message:
            updateResult.message ||
            'Error al actualizar aspectos completados en SQLite',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error al actualizar aspectos completados: ${error}`,
      };
    }
  },

  syncOfflineFiles: async (sampleId: string, visitAnswerId: string) => {
    try {
      const offlineFilesService = OfflineFilesService.getInstance();
      const pendingFiles = await offlineFilesService.getPendingSyncFiles();
      const relevantFiles = pendingFiles.filter(
        file =>
          file.sampleId === sampleId && file.visitAnswerId === visitAnswerId,
      );

      if (relevantFiles.length === 0) {
        return {
          success: true,
          message: 'No hay archivos offline para sincronizar',
        };
      }

      console.log(
        `📁 Sincronizando ${relevantFiles.length} archivos offline...`,
      );

      for (const file of relevantFiles) {
        try {
          const RNFS = require('react-native-fs');
          const fileExists = await RNFS.exists(file.localFilePath);
          if (!fileExists) {
            console.error(`❌ Archivo no encontrado: ${file.localFilePath}`);
            await offlineFilesService.updateFileSyncStatus(
              file.tempCode!,
              'error',
            );
            continue;
          }

          // Crear una copia temporal del archivo para la subida
          const tempDir = RNFS.CachesDirectoryPath;
          const tempFileName = `temp_upload_${Date.now()}_${file.originalFilename
            }`;
          const tempFilePath = `${tempDir}/${tempFileName}`;

          // Copiar el archivo offline a una ubicación temporal
          await RNFS.copyFile(file.localFilePath, tempFilePath);

          const formData = new FormData();
          formData.append('archivo', {
            uri: `file://${tempFilePath}`,
            type: file.mimeType,
            name: file.originalFilename,
          } as any);

          try {
            const response = await postUpload(formData, file.originalFilename);

            if (response.success && response.data) {
              const data =
                typeof response.data === 'string'
                  ? JSON.parse(response.data)
                  : response.data;

              if (data?.data?.codigoDocumento) {
                await offlineFilesService.updateFileSyncStatus(
                  file.tempCode!,
                  'synced',
                  data.data.codigoDocumento,
                );

                console.log(
                  `✅ Archivo sincronizado: ${file.originalFilename}`,
                );
              } else {
                throw new Error('No se recibió el código del documento');
              }
            } else {
              throw new Error(response.message || 'Error al subir archivo');
            }
          } finally {
            // Limpiar archivo temporal
            try {
              await RNFS.unlink(tempFilePath);
            } catch (cleanupError) {
              console.warn(
                '⚠️ No se pudo eliminar archivo temporal:',
                cleanupError,
              );
            }
          }
        } catch (error) {
          console.error(
            `❌ Error sincronizando archivo ${file.originalFilename}:`,
            error,
          );
          await offlineFilesService.updateFileSyncStatus(
            file.tempCode!,
            'error',
          );
        }
      }

      return {
        success: true,
        message: `Sincronizados ${relevantFiles.length} archivos offline`,
      };
    } catch (error) {
      console.error('❌ Error en sincronización de archivos:', error);
      return {
        success: false,
        message: `Error sincronizando archivos: ${error}`,
      };
    }
  },

  updateResponsesWithRealFileCodes: async (
    userId: string,
    sampleId: string,
    visitAnswerId: string,
  ) => {
    try {
      const offlineFilesService = OfflineFilesService.getInstance();
      const syncedFiles = await offlineFilesService.getSyncedFiles();
      const relevantFiles = syncedFiles.filter(
        (file: any) =>
          file.sampleId === sampleId && file.visitAnswerId === visitAnswerId,
      );

      if (relevantFiles.length === 0) {
        return {
          success: true,
          message: 'No hay respuestas con archivos para actualizar',
        };
      }

      console.log(
        `🔄 Actualizando ${relevantFiles.length} respuestas con códigos reales...`,
      );

      for (const file of relevantFiles) {
        if (!file.serverDocumentCode) {
          continue;
        }
        console.log('🔄 file', file);
        const updateResult = await get().updateOfflineResponseFileCode(
          userId,
          sampleId,
          visitAnswerId,
          file.aspectId,
          file.itemId,
          file.codigoItem,
          file.tempCode!,
          file.serverDocumentCode,
        );

        if (updateResult.success) {
          console.log(`✅ Respuesta actualizada: ${file.codigoItem}`);
        } else {
          console.error(
            `❌ Error actualizando respuesta: ${updateResult.message}`,
          );
        }
      }

      return {
        success: true,
        message: `Actualizadas ${relevantFiles.length} respuestas con códigos reales`,
      };
    } catch (error) {
      console.error('❌ Error actualizando respuestas:', error);
      return {
        success: false,
        message: `Error actualizando respuestas: ${error}`,
      };
    }
  },

  updateOfflineResponseFileCode: async (
    userId: string,
    sampleId: string,
    visitAnswerId: string,
    aspectId: string,
    itemId: string,
    codigoItem: string,
    tempCode: string,
    serverDocumentCode: string,
  ) => {
    try {
      const monitoringData = await get().getOfflineMonitoringData(
        sampleId,
        visitAnswerId,
      );
      if (
        !monitoringData.success ||
        !monitoringData.data?.aspectsResponseData?.aspects
      ) {
        return {
          success: false,
          message: 'No se encontraron datos de aspectos para actualizar',
        };
      }

      const aspects = monitoringData.data.aspectsResponseData.aspects;
      const targetAspect = aspects.find(
        (aspect: any) => aspect.aspectId === aspectId,
      );
      if (!targetAspect || !targetAspect.responses) {
        return {
          success: false,
          message: 'No se encontró el aspecto objetivo',
        };
      }

      console.log('🔄 targetAspect', itemId, serverDocumentCode);
      const targetResponse = targetAspect.responses.find(
        (response: any) => response.idItemInstrumento === itemId,
      );

      if (!targetResponse) {
        return {
          success: false,
          message: 'No se encontró la respuesta con el código temporal',
        };
      }

      targetResponse.descripcionValor = serverDocumentCode;
      targetResponse.valorArchivoCodigo = serverDocumentCode;
      console.log('🔄 targetResponse', targetResponse);

      const updateResult = await get().updateOfflineResponsesData(
        userId,
        visitAnswerId,
        sampleId,
        aspectId,
        targetAspect.responses,
      );

      if (updateResult.success) {
        return {
          success: true,
          message: `Código actualizado: ${tempCode} -> ${serverDocumentCode}`,
        };
      } else {
        return {
          success: false,
          message:
            updateResult.message || 'Error al actualizar respuestas en SQLite',
        };
      }
    } catch (error) {
      console.error('❌ Error actualizando código de archivo:', error);
      return {
        success: false,
        message: `Error actualizando código: ${error}`,
      };
    }
  },
}));
