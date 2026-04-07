import { useCallback } from 'react';
import { useMonitoringStore } from '../store/monitoring.store';
import { useAuthStore } from '../store/auth.store';

/**
 * Custom hook para manejar la obtención de items de instrumentos
 * Soporta modo online y offline de manera inteligente
 */
export const useInstrumentItems = () => {
  const {
    getItemsByInstrumentAspect,
    setCurrentInstrumentItems,
    setCurrentFormData,
    visitData,
  } = useMonitoringStore();
  const { isOffLine } = useAuthStore();

  /**
   * Obtiene los items del aspecto desde los datos offline
   * Busca en aspectsData del instrumento actual
   */
  const getItemsFromOfflineData = useCallback((aspectId: string) => {
    try {
      // PRIORIDAD 1: Usar visitData si está disponible (datos de la visita seleccionada)
      console.log('🔍 visitData:', visitData);
      if (visitData && visitData.aspectsData) {
        console.log('🎯 Usando datos de visitData (visita seleccionada)');
        const aspectsData = visitData.aspectsData;
        
        if (aspectsData && aspectsData.aspects) {
          const aspectData = aspectsData.aspects.find((aspect: any) => 
            aspect.aspectId === aspectId
          );

          if (aspectData && aspectData.items) {
            console.log(`✅ Items obtenidos desde visitData para aspecto ${aspectId}:`, aspectData.items);
            return aspectData.items;
          }
        }
        console.log('⚠️ No se encontraron items en visitData, intentando con store...');
      }
      return [];
    } catch (error) {
      console.error('❌ Error obteniendo items desde datos offline:', error);
      return null;
    }
  }, [visitData]);

  /**
   * Obtiene los items del aspecto desde la API (modo online)
   */
  const getItemsFromAPI = useCallback(async (instrumentId: string, aspectId: string) => {
    try {
      console.log(`🌐 Obteniendo items desde API - Instrumento: ${instrumentId}, Aspecto: ${aspectId}`);
      
      const itemsResponse = await getItemsByInstrumentAspect(instrumentId, aspectId);
      
      if (itemsResponse.success && itemsResponse.data) {
        console.log('✅ Items obtenidos desde API:', itemsResponse.data);
        return itemsResponse.data;
      } else {
        console.error('❌ Error al obtener items desde API:', itemsResponse.message);
        return null;
      }
    } catch (error) {
      console.error('❌ Error de red obteniendo items desde API:', error);
      return null;
    }
  }, [getItemsByInstrumentAspect]);

  /**
   * Función principal para obtener items de un aspecto
   * Maneja automáticamente el modo online/offline
   */
  const fetchInstrumentItems = useCallback(async (
    instrumentId: string, 
    aspectId: string
  ) => {
    try {
      console.log(`🔍 Iniciando obtención de items - Modo: ${isOffLine ? 'OFFLINE' : 'ONLINE'}`);
      console.log(`📋 Instrumento: ${instrumentId}, Aspecto: ${aspectId}`);

      let items = null;

      if (isOffLine) {
        // Modo offline: obtener desde datos locales
        console.log('📱 Modo OFFLINE - Buscando en datos locales...');
        items = getItemsFromOfflineData(aspectId);
        
        if (!items) {
          console.log('⚠️ No se encontraron items en datos offline');
          setCurrentInstrumentItems([]);
          setCurrentFormData({});
          return null;
        }
      } else {
        // Modo online: obtener desde API
        console.log('🌐 Modo ONLINE - Consultando API...');
        items = await getItemsFromAPI(instrumentId, aspectId);
        
        if (!items) {
          console.log('⚠️ No se pudieron obtener items desde API');
          setCurrentInstrumentItems([]);
          setCurrentFormData({});
          return null;
        }
      }

      // Actualizar el store con los items obtenidos
      setCurrentInstrumentItems(items);
      console.log(`✅ Items configurados en el store (${items.length} items)`);
      
      return items;
    } catch (error) {
      console.error('❌ Error general obteniendo items del aspecto:', error);
      setCurrentInstrumentItems([]);
      setCurrentFormData({});
      return null;
    }
  }, [isOffLine, getItemsFromOfflineData, getItemsFromAPI, setCurrentInstrumentItems, setCurrentFormData]);

  /**
   * Verifica si hay datos offline disponibles para un aspecto específico
   */
  const hasOfflineDataForAspect = useCallback((aspectId: string): boolean => {
    try {
      // PRIORIDAD 1: Verificar en visitData primero
      if (visitData && visitData.aspectsData) {
        const aspectsData = visitData.aspectsData;
        
        if (aspectsData && aspectsData.aspects) {
          const aspectData = aspectsData.aspects.find((aspect: any) => 
            aspect.aspectId === aspectId
          );

          if (aspectData && aspectData.items && aspectData.items.length > 0) {
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      console.error('Error verificando datos offline del aspecto:', error);
      return false;
    }
  }, [visitData]);

  /**
   * Obtiene estadísticas de los datos offline disponibles
   */
  const getOfflineDataStats = useCallback(() => {
    try {
      // PRIORIDAD 1: Usar visitData si está disponible
      if (visitData && visitData.aspectsData) {
        const aspectsData = visitData.aspectsData;
        
        const aspectsWithItems = aspectsData.aspects?.filter((aspect: any) => 
          aspect.success && aspect.items && aspect.items.length > 0
        ) || [];

        const totalItems = aspectsWithItems.reduce((sum: number, aspect: any) => 
          sum + (aspect.items?.length || 0), 0
        );

        return {
          hasData: true,
          totalAspects: aspectsData.totalAspects || 0,
          aspectsWithItems: aspectsWithItems.length,
          totalItems,
          fetchedAt: aspectsData.fetchedAt,
          source: 'visitData',
        };
      }

      // PRIORIDAD 2: Usar store como fallback
      const offlineData = useMonitoringStore.getState().currentMonitoringInstrument;
      const aspectsData = (offlineData as any)?.aspectsData;
      
      if (!aspectsData) {
        return {
          hasData: false,
          totalAspects: 0,
          aspectsWithItems: 0,
          totalItems: 0,
          source: 'none',
        };
      }

      const aspectsWithItems = aspectsData.aspects?.filter((aspect: any) => 
        aspect.success && aspect.items && aspect.items.length > 0
      ) || [];

      const totalItems = aspectsWithItems.reduce((sum: number, aspect: any) => 
        sum + (aspect.items?.length || 0), 0
      );

      return {
        hasData: true,
        totalAspects: aspectsData.totalAspects || 0,
        aspectsWithItems: aspectsWithItems.length,
        totalItems,
        fetchedAt: aspectsData.fetchedAt,
        source: 'store',
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas de datos offline:', error);
      return {
        hasData: false,
        totalAspects: 0,
        aspectsWithItems: 0,
        totalItems: 0,
        source: 'error',
      };
    }
  }, [visitData]);

  /**
   * Obtiene las respuestas existentes desde los datos offline
   * Busca en aspectsResponseData del visitData
   */
  const getResponsesFromOfflineData = useCallback((aspectId: string) => {
    try {
      // Buscar en visitData.aspectsResponseData
      console.log('🔍 Buscando respuestas en visitData.aspectsResponseData...');
      if (visitData && visitData.aspectsResponseData) {
        console.log('🎯 Usando datos de respuestas desde visitData');
        const aspectsResponseData = visitData.aspectsResponseData;
        
        if (aspectsResponseData && aspectsResponseData.aspects) {
          const aspectData = aspectsResponseData.aspects.find((aspect: any) => 
            aspect.aspectId === aspectId
          );

          if (aspectData && aspectData.responses) {
            console.log(`✅ Respuestas obtenidas desde visitData para aspecto ${aspectId}:`, aspectData.responses.length, 'respuestas');
            return aspectData.responses;
          }
        }
        console.log('⚠️ No se encontraron respuestas en visitData para este aspecto');
      }
      return [];
    } catch (error) {
      console.error('❌ Error obteniendo respuestas desde datos offline:', error);
      return null;
    }
  }, [visitData]);

  /**
   * Obtiene las respuestas existentes desde la API (modo online)
   */
  const getResponsesFromAPI = useCallback(async (visitId: string, aspectId: string, getByAnswerVisitaAspect: any) => {
    try {
      console.log(`🌐 Obteniendo respuestas desde API - VisitId: ${visitId}, Aspecto: ${aspectId}`);
      
      const responsesResponse = await getByAnswerVisitaAspect(visitId, aspectId);
      
      if (responsesResponse.success && responsesResponse.data) {
        console.log('✅ Respuestas obtenidas desde API:', responsesResponse.data.length, 'respuestas');
        return responsesResponse.data;
      } else {
        console.log('🆕 No hay respuestas existentes desde API');
        return null;
      }
    } catch (error) {
      console.error('❌ Error de red obteniendo respuestas desde API:', error);
      return null;
    }
  }, []);

  /**
   * Función principal para obtener respuestas existentes de un aspecto
   * Maneja automáticamente el modo online/offline
   */
  const fetchExistingResponses = useCallback(async (
    visitId: string, 
    aspectId: string,
    getByAnswerVisitaAspect: any
  ) => {
    try {
      console.log(`🔍 Iniciando obtención de respuestas - Modo: ${isOffLine ? 'OFFLINE' : 'ONLINE'}`);
      console.log(`📋 VisitId: ${visitId}, Aspecto: ${aspectId}`);

      let responses = null;

      if (isOffLine) {
        // Modo offline: obtener desde datos locales
        console.log('📱 Modo OFFLINE - Buscando respuestas en datos locales...');
        responses = getResponsesFromOfflineData(aspectId);
        
        if (!responses || responses.length === 0) {
          console.log('⚠️ No se encontraron respuestas en datos offline');
          return null;
        }
      } else {
        // Modo online: obtener desde API
        console.log('🌐 Modo ONLINE - Consultando API para respuestas...');
        responses = await getResponsesFromAPI(visitId, aspectId, getByAnswerVisitaAspect);
      }

      return responses;
    } catch (error) {
      console.error('❌ Error general obteniendo respuestas del aspecto:', error);
      return null;
    }
  }, [isOffLine, getResponsesFromOfflineData, getResponsesFromAPI]);

  return {
    fetchInstrumentItems,
    fetchExistingResponses,
    hasOfflineDataForAspect,
    getOfflineDataStats,
    isOfflineMode: isOffLine,
  };
};
