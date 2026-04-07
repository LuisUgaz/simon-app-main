import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  Visit,
  VisitAnswer,
  VisitInstrument,
} from '../../../../../core/entities';
import { useMonitoringStore, useSampleStore } from '../../../../store';
import { useAuthStore } from '../../../../store/auth.store';
import { BUSINESS_RULES, ENUMS } from '../../../../../core/constants';
import { SyncModal, SyncLoadingModal } from '../../../../components';
import dayjs from 'dayjs';
import { useAppStore } from '../../../../store/app.store';

interface Props {
  visits: {
    visit: Visit;
    instrumentVisit: VisitInstrument;
    sampleVisit?: VisitAnswer;
  }[];
  autoReport: boolean;
  onReload?: () => void;
}

interface PropsVisit {
  visit: Visit;
  instrumentVisit: VisitInstrument;
  sampleVisit?: VisitAnswer;
}

interface AutoReportLoadingModalProps {
  visible: boolean;
}

const AutoReportLoadingModal = ({ visible }: AutoReportLoadingModalProps) => {
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={autoReportStyles.loadingOverlay}>
        <View style={autoReportStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={autoReportStyles.loadingText}>
            Iniciando Auto Reporte...
          </Text>
          <Text style={autoReportStyles.loadingSubtext}>
            Por favor espere mientras se programa la visita automáticamente
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const formatTime12Hour = (time?: string) => {
  if (!time) {
    return '--:--';
  }
  const [hours, minutes] = time.split(':');
  return dayjs()
    .hour(parseInt(hours, 10))
    .minute(parseInt(minutes, 10))
    .format('hh:mm A');
};

export const VisitsSampleList = ({ visits, autoReport, onReload }: Props) => {
  const showSnackbar = useAppStore(state => state.showSnackbar);

  const { user } = useAuthStore();
  const mode = useMonitoringStore(state => state.mode);
  const currentSample = useSampleStore(state => state.sample);
  const setCurrentVisit = useSampleStore(state => state.setVisit);
  const setCurrentVisitAnswer = useSampleStore(state => state.setVisitAnswer);
  const checkLocalDataSyncStatus = useMonitoringStore(
    state => state.checkLocalDataSyncStatus,
  );
  const syncOfflineData = useMonitoringStore(state => state.syncOfflineData);
  const {
    sendAddScheduleVisit,
    sendUpdateVisit,
    updatePreExecutionData,
    updateVisitAnswerDataFromPreExecution,
  } = useMonitoringStore();
  const isOffLine = useAuthStore(state => state.isOffLine);

  // Estado para el modal de sincronización
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [pendingVisit, setPendingVisit] = useState<{
    visit: Visit;
    sampleVisit: VisitAnswer;
  } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAutoReporting, setIsAutoReporting] = useState(false);

  // Función para ejecutar pre-ejecución automática
  const executeAutoPreExecution = async (
    visit: Visit,
    sampleVisit?: VisitAnswer,
  ) => {
    try {
      // Validar que tengamos los datos necesarios
      if (!currentSample?.id || !sampleVisit?.id) {
        console.warn(
          '⚠️ No se puede ejecutar pre-ejecución automática: faltan IDs de muestra o visita',
        );
        return;
      }
      // Crear objeto VisitAnswer con datos por defecto para auto reporte
      const autoReportVisitAnswer: Partial<VisitAnswer> = {
        ...sampleVisit,
        subjectFound: true, // Se encontró el docente
        withReplacement: false, // No hay representante
        isRescheduled: false, // No se reprograma
        isExecutionAdjustment: false, // No es instrumento ya ejecutado
        observation: 'Auto Reporte - Ejecutado automáticamente',
        status: ENUMS.configuracion.tipoEstadoVisita.children.enEjecucion,
        monitorType: currentSample?.monitorType || '',
        monitorTypeDescription: currentSample?.monitorTypeDescription || '',
        monitorDocumentType: currentSample?.monitorDocumentType || 0,
        monitorDocumentNumber: currentSample?.monitorDocumentNumber || '',
        monitorFirstName: currentSample?.monitorFirstName || '',
        monitorLastName: currentSample?.monitorLastName || '',
        monitorMiddleName: currentSample?.monitorMiddleName || '',
        monitorSite: currentSample?.monitorSite,
      };

      // Guardar datos de pre-ejecución localmente
      const responseLocal = await updatePreExecutionData(
        user?.documentNumber || '',
        currentSample.id,
        sampleVisit.id,
        autoReportVisitAnswer,
      );

      if (isOffLine) {
        // Modo offline: guardar preExecutionData en el objeto existente
        if (responseLocal.success) {
          await updateVisitAnswerDataFromPreExecution(
            user?.documentNumber || '',
            currentSample.id,
            sampleVisit.id,
            true,
          );
          console.log(
            '✅ PreExecutionData guardado correctamente en modo offline',
          );
        } else {
          console.error(
            '❌ Error guardando preExecutionData offline:',
            responseLocal.message,
          );
        }
      } else {
        // Modo online: llamar al servicio para actualizar la visita
        if (sendUpdateVisit) {
          const response = await sendUpdateVisit(
            autoReportVisitAnswer as VisitAnswer,
          );

          if (response.success) {
            console.log(
              '✅ Pre-ejecución automática completada exitosamente',
            );
            await updateVisitAnswerDataFromPreExecution(
              user?.documentNumber || '',
              currentSample.id,
              sampleVisit.id,
              false,
            );
          } else {
            console.error(
              '❌ Error en pre-ejecución automática:',
              response.message,
            );
          }
        }
      }
    } catch (error) {
      console.error('❌ Error en pre-ejecución automática:', error);
    }
  };

  const handleVisitSelect = async (
    visit: Visit,
    instrumentVisit: VisitInstrument,
    sampleVisit: VisitAnswer,
  ) => {
    if (instrumentVisit.isCanceled) {
      showSnackbar('La visita ha sido anulada', 'error');
      return false;
    }
    if (
      mode === 'SCHEDULE' &&
      visit.status !== ENUMS.configuracion.tipoEstadoVisita.children.asignado
    ) {
      Alert.alert(
        'Visita Programada',
        'La visita ya ha sido programada anteriormente.',
        [{ text: 'OK' }],
      );
      return false;
    }

    // Verificar si hay datos locales que necesiten sincronización
    if (
      visit.status === ENUMS.configuracion.tipoEstadoVisita.children.programado
    ) {
      try {
        const syncStatus = await checkLocalDataSyncStatus(
          sampleVisit.sampleId,
          sampleVisit.id,
          visit.status,
        );

        if (syncStatus.needsSync) {
          console.log('🔄 Datos locales necesitan sincronización:', syncStatus);
          setPendingVisit({ visit, sampleVisit });
          setShowSyncModal(true);
          return;
        }
      } catch (error) {
        console.error('❌ Error verificando sincronización:', error);
        // Continuar con el flujo normal si hay error
      }
    }
    console.log('visit', visit, mode);
    if (
      visit.status === ENUMS.configuracion.tipoEstadoVisita.children.asignado
      && autoReport
    ) {
      setIsAutoReporting(true);
      try {
        // 1: First Step
        const autoReportVisit: Visit = {
          ...visit,
          sampleId: currentSample?.id,
          status: ENUMS.configuracion.tipoEstadoVisita.children.programado,
          scheduledDate: new Date(),
          startTime: '07:00',
          endTime: '23:59',
          type: ENUMS.configuracion.tipoVisita.children.presencial,
          comment: 'Auto Reporte',
          id: null,
        };

        await sendAddScheduleVisit(autoReportVisit);
        console.log('✅ Visita de auto reporte programada exitosamente');

        // 2: Second Step - Ejecutar pre-ejecución automática
        await executeAutoPreExecution(visit, sampleVisit);
        
        // 3: Refresh the list
        onReload?.();
      } catch (error) {
        console.error('❌ Error programando visita de auto reporte:', error);
      } finally {
        setIsAutoReporting(false);
      }

      return false;
    }

    // Flujo normal si no necesita sincronización
    setCurrentVisit(visit);
    setCurrentVisitAnswer(sampleVisit);
    // navigation.navigate('SampleVisit');
  };

  const handleSyncAccept = async () => {
    if (pendingVisit) {
      setIsSyncing(true);
      setShowSyncModal(false); // Cerrar el modal inmediatamente para mostrar el loading
      try {
        const result = await syncOfflineData(
          user?.documentNumber || '',
          pendingVisit.sampleVisit.sampleId,
          pendingVisit.sampleVisit.id,
        );

        if (result.success) {
          console.log('✅ Sincronización exitosa:', result.message);
          // Continuar con el flujo normal después de la sincronización
          setCurrentVisit(pendingVisit.visit);
          setCurrentVisitAnswer(pendingVisit.sampleVisit);
        } else {
          console.error('❌ Error en sincronización:', result.message);
          Alert.alert('Error de Sincronización', result.message, [
            { text: 'OK' },
          ]);
        }
      } catch (error) {
        console.error('❌ Error durante la sincronización:', error);
        Alert.alert(
          'Error de Sincronización',
          'Ocurrió un error durante la sincronización',
          [{ text: 'OK' }],
        );
      } finally {
        setIsSyncing(false);
        setPendingVisit(null);
      }
    }
  };

  const handleSyncCancel = () => {
    setShowSyncModal(false);
    if (pendingVisit) {
      // Por ahora, continuar con el flujo normal
      setCurrentVisit(pendingVisit.visit);
      setCurrentVisitAnswer(pendingVisit.sampleVisit);
    }
    setPendingVisit(null);
  };

  const getVisitColor = (status?: string): string => {
    const visitStatus = BUSINESS_RULES.visitStatusColors.find(
      x => x.status === status,
    );
    return visitStatus ? visitStatus.color : '#f3f4f6';
  };

  // eslint-disable-next-line react/no-unstable-nested-components
  const VisitCard = ({ visit, instrumentVisit, sampleVisit }: PropsVisit) => {
    return (
      <Pressable
        style={styles.cardContainer}
        onPress={() => handleVisitSelect(visit, instrumentVisit, sampleVisit!)}>
        <View style={styles.header}>
          <Icon name="calendar-outline" size={16} color="#333" />
          <Text style={styles.dateRange}>
            Del {dayjs(instrumentVisit.startDate).format('DD/MM/YYYY')} al{' '}
            {dayjs(instrumentVisit.endDate).format('DD/MM/YYYY')}
          </Text>
          {instrumentVisit.isCanceled && (
            <View style={styles.canceledContainer}>
              <Text style={styles.canceledText}>Anulado</Text>
            </View>
          )}
        </View>

        <View style={styles.visitNumberContainer}>
          <Text style={styles.visitNumber}>{visit.visitNumber}</Text>
        </View>

        <Text style={styles.scheduledDate}>
          {visit.scheduledDate
            ? dayjs(visit.scheduledDate).format('DD/MM/YYYY')
            : '--/--/----'}
        </Text>
        <Text style={styles.timeRange}>{`${formatTime12Hour(
          visit.startTime,
        )} - ${formatTime12Hour(visit.endTime)}`}</Text>

        <View
          style={{
            ...styles.statusContainer,
            backgroundColor: getVisitColor(sampleVisit?.status),
          }}>
          <Text style={styles.statusText}>
            {ENUMS.configuracion.tipoEstadoVisita.descriptions?.[visit.status]}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <>
      <FlatList
        data={visits}
        style={styles.flatList}
        keyExtractor={item => item.visit.code}
        renderItem={({ item }) => (
          <VisitCard
            visit={item.visit}
            instrumentVisit={item.instrumentVisit}
            sampleVisit={item.sampleVisit}
          />
        )}
      />

      {/* Modal de sincronización */}
      <SyncModal
        visible={showSyncModal}
        onAccept={handleSyncAccept}
        onCancel={handleSyncCancel}
      />

      <SyncLoadingModal visible={isSyncing} />

      {/* Modal de Auto Reporte */}
      <AutoReportLoadingModal visible={isAutoReporting} />
    </>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  codeText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  headerVisit: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  dateRange: {
    fontSize: 14,
    color: '#333',
    marginLeft: 5,
  },
  icon: {
    marginLeft: 'auto',
  },
  visitNumberContainer: {
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 10,
  },
  visitNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scheduledDate: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 5,
  },
  timeRange: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 15,
  },
  statusContainer: {
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  flatList: {
    width: '100%',
    padding: 0,
  },
  canceledContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e43',
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  canceledText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,
  },
});

const autoReportStyles = StyleSheet.create({
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});
