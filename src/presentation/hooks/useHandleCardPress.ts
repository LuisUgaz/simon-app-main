import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { useMonitoringStore } from '../store/monitoring.store';
import { useSampleStore } from '../store/sample.store';
import { RootStackParams } from '../routes/StackNavigator';

/**
 * Custom hook para manejar la navegación desde las tarjetas de visita
 * Configura todos los datos necesarios en los stores antes de navegar
 * Mantiene un estado visitData accesible con toda la información de la visita
 */
export const useHandleCardPress = () => {
  const { setMode, setCurrentInstrument, setCurrentPlan, setVisitData, visitData } = useMonitoringStore();
  const { setSample, setVisitAnswer } = useSampleStore();
  const navigation = useNavigation<NavigationProp<RootStackParams>>();

  const handleCardPress = useCallback((visit: any) => {
    try {
      console.log('🎯 === INICIO DEBUG - Configurando datos para ejecución de visita ===');
      console.log('🔥 handleCardPress EJECUTADO - CardStatus presionado');
      // PRIMER PASO: Guardar todos los datos de la visita en el estado
      console.log('🔧 Paso 0: Guardando datos completos de la visita en el estado', visit);
      setVisitData({
        visitAnswerData: visit.visitAnswerData,
        sampleData: visit.sampleData,
        monitoringInstrumentData: visit.monitoringInstrumentData,
        monitoringPlanData: visit.monitoringPlanData,
        aspectsData: visit.aspectsData,
        // Incluir cualquier otra propiedad que pueda existir
        ...visit,
      });
      console.log('✅ Datos de visita guardados en el estado visitData');

      // 1. Configurar el modo de monitoreo a EXECUTION
      console.log('🔧 Paso 1: Configurando modo a EXECUTION');
      setMode('EXECUTION');
      console.log('✅ Modo configurado a EXECUTION');

      // 2. Configurar datos de la muestra
      console.log('🔧 Paso 2: Configurando datos de muestra');
      if (visit.sampleData) {
        console.log('📋 Sample data encontrada');
        const sampleData = {
          id: visit.sampleData.id,
          key: visit.sampleData.key || '',
          idInstrument: visit.sampleData.idInstrument || '',
          idSampleType: visit.sampleData.idSampleType || '',
          sampleTypeDescription: visit.sampleData.sampleTypeDescription || '',
          documentType: visit.sampleData.documentType || 0,
          documentNumber: visit.sampleData.documentNumber || '',
          firstName: visit.sampleData.firstName || '',
          lastName: visit.sampleData.lastName || '',
          middleName: visit.sampleData.middleName || '',
          fullName: visit.sampleData.fullName || '',
          lastNames: visit.sampleData.lastNames || '',
          site: visit.sampleData.site,
          dre: visit.sampleData.dre || '',
          dreDescription: visit.sampleData.dreDescription || '',
          ugel: visit.sampleData.ugel || '',
          ugelDescription: visit.sampleData.ugelDescription || '',
          idLevel: visit.sampleData.idLevel || '',
          levelDescription: visit.sampleData.levelDescription || '',
          network: visit.sampleData.network || 0,
          networkDescription: visit.sampleData.networkDescription || '',
          modularCode: visit.sampleData.modularCode || '',
          anexo: visit.sampleData.anexo || '',
          iieeName: visit.sampleData.iieeName || '',
          monitorType: visit.sampleData.enuMonitorType || '',
          monitorTypeDescription: visit.sampleData.monitorTypeDescription || '',
          monitorDocumentType: visit.sampleData.monitorDocumentType || 0,
          monitorDocumentNumber: visit.sampleData.monitorDocumentNumber || '',
          monitorFirstName: visit.sampleData.monitorFirstName || '',
          monitorLastName: visit.sampleData.monitorLastName || '',
          monitorMiddleName: visit.sampleData.monitorMiddleName || '',
          monitorSite: visit.sampleData.monitorSite,
          visitType: visit.sampleData.visitType,
          visitTypeDescription: visit.sampleData.visitTypeDescription,
          visits: visit.sampleData.visits || [],
          isActive: visit.sampleData.isActive || false,
          isCanceled: visit.sampleData.isCanceled || false,
          isReplaced: visit.sampleData.isReplaced || false,
          replacement: visit.sampleData.replacement || '',
          creationDate: visit.sampleData.creationDate || new Date(),
          modificationDate: visit.sampleData.modificationDate,
          createdBy: visit.sampleData.createdBy || '',
          modifiedBy: visit.sampleData.modifiedBy || '',
          inKey: visit.sampleData.inKey || '',
        };

        console.log('📋 Sample data mapeada:');
        setSample(sampleData);
        console.log('✅ Datos de muestra configurados en el store');
      } else {
        console.log('⚠️ No se encontró sampleData en la visita');
      }

      // 3. Configurar datos de la respuesta de visita
      console.log('🔧 Paso 3: Configurando datos de respuesta de visita');
      if (visit.visitAnswerData) {
        console.log('📋 VisitAnswer data encontrada:');
        const visitAnswerData = {
          id: visit.visitAnswerData.visitAnswerId || visit.visitAnswerData.id,
          sampleId: visit.visitAnswerData.sampleId,
          visitNumber: visit.visitAnswerData.visitNumber,
          code: visit.visitAnswerData.code,
          visitType: visit.visitAnswerData.visitType,
          status: visit.visitAnswerData.status,
          completedAspects: visit.visitAnswerData.completedAspects || [],
          subjectFound: visit.visitAnswerData.subjectFound,
          withReplacement: visit.visitAnswerData.withReplacement,
          isRescheduled: visit.visitAnswerData.isRescheduled,
          scheduledDate: visit.visitAnswerData.scheduledDate,
          startTime: visit.visitAnswerData.startTime,
          endTime: visit.visitAnswerData.endTime,
          additionalData: visit.visitAnswerData.additionalData,
          isExecutionAdjustment: visit.visitAnswerData.isExecutionAdjustment,
          executionStartDate: visit.visitAnswerData.executionStartDate,
          executionStartTime: visit.visitAnswerData.executionStartTime,
          executionEndDate: visit.visitAnswerData.executionEndDate,
          executionEndTime: visit.visitAnswerData.executionEndTime,
          isCanceled: visit.visitAnswerData.isCanceled,
          auxiliaryFirstName: visit.visitAnswerData.auxiliaryFirstName,
          auxiliaryLastName: visit.visitAnswerData.auxiliaryLastName,
          auxiliaryMiddleName: visit.visitAnswerData.auxiliaryMiddleName,
          observation: visit.visitAnswerData.observation,
          commitments: visit.visitAnswerData.commitments || [],
          monitorType: visit.visitAnswerData.enuMonitorType,
          monitorDocumentType: visit.visitAnswerData.monitorDocumentType,
          monitorDocumentNumber: visit.visitAnswerData.monitorDocumentNumber,
          monitorFirstName: visit.visitAnswerData.monitorFirstName,
          monitorLastName: visit.visitAnswerData.monitorLastName,
          monitorMiddleName: visit.visitAnswerData.monitorMiddleName,
          monitorSite: visit.visitAnswerData.monitorSite,
          sample: visit.visitAnswerData.sample,
          instrument: visit.visitAnswerData.instrument,
          plan: visit.visitAnswerData.plan,
          executionError: visit.visitAnswerData.executionError,
          binnacle: visit.visitAnswerData.binnacle || [],
        };

        console.log('📋 VisitAnswer data mapeada:');
        setVisitAnswer(visitAnswerData);
        console.log('✅ Datos de respuesta de visita configurados en el store');
      } else {
        console.log('⚠️ No se encontró visitAnswerData en la visita');
      }

      // 4. Configurar instrumento de monitoreo
      console.log('🔧 Paso 4: Configurando instrumento de monitoreo');
      if (visit.monitoringInstrumentData) {
        console.log('📋 MonitoringInstrument data encontrada:');
        const instrumentData = {
          id: visit.monitoringInstrumentData.id,
          key: visit.monitoringInstrumentData.key,
          monitoringPlanId: visit.monitoringInstrumentData.monitoringPlanId,
          monitorsEnums: visit.monitoringInstrumentData.monitorsEnums,
          sampleEnum: visit.monitoringInstrumentData.sampleEnum,
          sampleDescription: visit.monitoringInstrumentData.sampleDescription,
          typeEnum: visit.monitoringInstrumentData.typeEnum,
          typeDescription: visit.monitoringInstrumentData.typeDescription,
          component: visit.monitoringInstrumentData.component,
          result: visit.monitoringInstrumentData.result,
          indicator: visit.monitoringInstrumentData.indicator,
          aspects: visit.monitoringInstrumentData.aspects,
          visits: visit.monitoringInstrumentData.visits,
          resources: visit.monitoringInstrumentData.resources,
          isGia: visit.monitoringInstrumentData.isGia,
          giaTypeEnum: visit.monitoringInstrumentData.giaTypeEnum,
          giaTypeDescription: visit.monitoringInstrumentData.giaTypeDescription,
          code: visit.monitoringInstrumentData.code,
          name: visit.monitoringInstrumentData.name,
          stage: visit.monitoringInstrumentData.stage,
          stageDescription: visit.monitoringInstrumentData.stageDescription,
          modality: visit.monitoringInstrumentData.modality,
          modalityDescription: visit.monitoringInstrumentData.modalityDescription,
          level: visit.monitoringInstrumentData.level,
          levelDescription: visit.monitoringInstrumentData.levelDescription,
          cycle: visit.monitoringInstrumentData.cycle,
          cycleDescription: visit.monitoringInstrumentData.cycleDescription,
          area: visit.monitoringInstrumentData.area,
          areaDescription: visit.monitoringInstrumentData.areaDescription,
          reference: visit.monitoringInstrumentData.reference,
          isActive: visit.monitoringInstrumentData.isActive,
          startRules: visit.monitoringInstrumentData.startRules,
          published: visit.monitoringInstrumentData.published,
          creationDate: visit.monitoringInstrumentData.creationDate,
          appliesToAllTeachers: visit.monitoringInstrumentData.appliesToAllTeachers,
          isAutoevaluationOfTeachers: visit.monitoringInstrumentData.isAutoevaluationOfTeachers,
        };

        console.log('📋 MonitoringInstrument data mapeada:');
        setCurrentInstrument(instrumentData);
        console.log('✅ Datos de instrumento de monitoreo configurados en el store');
      } else {
        console.log('⚠️ No se encontró monitoringInstrumentData en la visita');
      }

      // 5. Configurar plan de monitoreo
      console.log('🔧 Paso 5: Configurando plan de monitoreo');
      if (visit.monitoringPlanData) {
        console.log('📋 MonitoringPlan data encontrada:');
        const planData = {
          id: visit.monitoringPlanData.id,
          key: visit.monitoringPlanData.key,
          code: visit.monitoringPlanData.code,
          name: visit.monitoringPlanData.name,
          actors: visit.monitoringPlanData.actors,
          dre: visit.monitoringPlanData.dre,
          ugel: visit.monitoringPlanData.ugel,
          ugels: visit.monitoringPlanData.ugels,
          site: visit.monitoringPlanData.site,
          period: visit.monitoringPlanData.period,
          description: visit.monitoringPlanData.description,
          periodMin: visit.monitoringPlanData.periodMin,
          periodMax: visit.monitoringPlanData.periodMax,
          startDate: visit.monitoringPlanData.startDate,
          endDate: visit.monitoringPlanData.endDate,
          isActive: visit.monitoringPlanData.isActive,
          isFinish: visit.monitoringPlanData.isFinish,
          public: visit.monitoringPlanData.public,
          enuType: visit.monitoringPlanData.enuType,
          typeDescription: visit.monitoringPlanData.typeDescription,
          idLogicalFramework: visit.monitoringPlanData.idLogicalFramework,
          nameLogicalFramework: visit.monitoringPlanData.nameLogicalFramework,
          logicalFramework: visit.monitoringPlanData.logicalFramework,
          stage: visit.monitoringPlanData.stage,
          stageDescription: visit.monitoringPlanData.stageDescription,
          mode: visit.monitoringPlanData.mode,
          modeDescription: visit.monitoringPlanData.modeDescription,
        };

        console.log('📋 MonitoringPlan data mapeada:');
        setCurrentPlan(planData);
        console.log('✅ Datos de plan de monitoreo configurados en el store');
      } else {
        console.log('⚠️ No se encontró monitoringPlanData en la visita');
      }

      console.log('🎯 === RESUMEN DE CONFIGURACIÓN ===');
      console.log('✅ Modo configurado: EXECUTION');
      console.log('✅ Sample configurado:', visit.sampleData ? 'SÍ' : 'NO');
      console.log('✅ VisitAnswer configurado:', visit.visitAnswerData ? 'SÍ' : 'NO');
      console.log('✅ Instrument configurado:', visit.monitoringInstrumentData ? 'SÍ' : 'NO');
      console.log('✅ Plan configurado:', visit.monitoringPlanData ? 'SÍ' : 'NO');
      console.log('🚀 Navegando a SampleVisitExecution...');

      // 6. Navegar a la pantalla de ejecución
      navigation.navigate('SampleVisitExecution');
      console.log('✅ === NAVEGACIÓN COMPLETADA ===');
    } catch (error) {
      console.error('❌ Error configurando datos de visita:', error);
    }
  }, [setMode, setSample, setVisitAnswer, setCurrentInstrument, setCurrentPlan, setVisitData, navigation]);

  return {
    handleCardPress,
    visitData,
  };
};
