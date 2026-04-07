import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Button,
  BackHandler,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RoundButton } from '../../../components';
import { InstrumentInfoModal } from './components/InstrumentInfoModal';
import {
  NavigationProp,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import { RootStackParams } from '../../../routes/StackNavigator';
import { useAuthStore, useMonitoringStore, useSampleStore } from '../../../store';
import { SyncModal, SyncLoadingModal } from '../../../components';
import { globalColors } from '../../../theme/theme';
import { ENUMS } from '../../../../core/constants';
import { useAppStore } from '../../../store/app.store';
import { PreExecutionForm } from './components/PreExecutionForm';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface VisitStatusInfo {
  title: string;
  description: string;
  color: string;
}

export const SampleVisitExecutionScreen = () => {
  const { top } = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParams>>();

  const { user } = useAuthStore();
  const { currentMonitoringInstrument, saveMonitoringDataToLocal, hasOfflineData, syncOfflineData, getSampleVisit, deleteOfflineDataByVisit } =
    useMonitoringStore();
  const {
    sample: currentSample,
    visitAnswer: currentVisitAnswer,
    setVisitAnswer,
    clearVisit,
  } = useSampleStore();
  const showSnackbar = useAppStore(state => state.showSnackbar);
  const isOffLine = useAuthStore(state => state.isOffLine);
  // Modal state
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showSyncModal, setShowSyncModal] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isAdditionalDataExpanded, setIsAdditionalDataExpanded] = useState<boolean>(false);

  const isVisitScheduled =
    currentVisitAnswer?.status ===
    ENUMS.configuracion.tipoEstadoVisita.children.programado;
  const getStatusInfo = (status: string): VisitStatusInfo => {
    switch (status) {
      case ENUMS.configuracion.tipoEstadoVisita.children.enEjecucion:
        return {
          title: 'En Ejecución',
          description: 'La visita está en proceso de ejecución.',
          color: '#6b7280',
        };
      case ENUMS.configuracion.tipoEstadoVisita.children.enProcesoCierre:
        return {
          title: 'En Proceso de Cierre',
          description: 'La visita está en proceso de cierre.',
          color: '#f59e0b',
        };
      case ENUMS.configuracion.tipoEstadoVisita.children.ejecutado:
        return {
          title: 'Ejecutado',
          description: 'La visita ha sido ejecutada correctamente.',
          color: '#22c55e',
        };
      case ENUMS.configuracion.tipoEstadoVisita.children.envioConError:
        return {
          title: 'Envío con Error',
          description: 'La visita tuvo errores durante el envío.',
          color: '#f59e0b',
        };
      case ENUMS.configuracion.tipoEstadoVisita.children.noEjecutado:
        return {
          title: 'No Ejecutado',
          description: 'La visita no fue ejecutada.',
          color: '#ef4444',
        };
      case ENUMS.configuracion.tipoEstadoVisita.children.culminadoSinEjecucion:
        return {
          title: 'Culminado sin Ejecución',
          description: 'La visita culminó sin ser ejecutada.',
          color: '#f97316',
        };
      default:
        return {
          title: 'Estado Desconocido',
          description: 'Estado de visita no reconocido.',
          color: '#9ca3af',
        };
    }
  };

  const handleGoBack = useCallback(() => {
    clearVisit();
    navigation.goBack();
  }, [clearVisit, navigation]);

  // Manejar el botón back de Android
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleGoBack();
        return true; // Previene el comportamiento por defecto
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription.remove();
    }, [handleGoBack]),
  );

  // Fetch visit data when entering screen if online
  useFocusEffect(
    useCallback(() => {
      const handleVisitStatusCleanup = async (visitData: any) => {
        const executedStatus = ENUMS.configuracion.tipoEstadoVisita.children.ejecutado;
        const terminatedStatus = ENUMS.configuracion.tipoEstadoVisita.children.culminadoSinEjecucion;

        if (visitData.status === executedStatus || visitData.status === terminatedStatus) {
          if (currentSample?.id && currentVisitAnswer?.id) {
            const checkResult = await hasOfflineData(currentSample.id, currentVisitAnswer.id);

            if (checkResult.hasData) {
              const result = await deleteOfflineDataByVisit(currentSample.id, currentVisitAnswer.id);
              if (result.success) {
                showSnackbar('Registro local eliminado porque la visita ya fue culminada', 'success');
              }
            }
          }
        }
      };

      const fetchVisitData = async () => {
        if (!isOffLine && currentVisitAnswer?.id) {
          try {
            const response = await getSampleVisit(currentVisitAnswer.id);
            if (response.success && response.data) {
              setVisitAnswer(response.data);
              await handleVisitStatusCleanup(response.data);
            }
          } catch (error) {
            // Error handling silently as requested (or minimal error logging if critical)
          }
        }
      };

      fetchVisitData();
    }, [isOffLine, currentVisitAnswer?.id, getSampleVisit, setVisitAnswer, currentSample?.id, deleteOfflineDataByVisit, hasOfflineData, showSnackbar])
  );

  const handlePreExecutionComplete = useCallback(
    (visitUpdated: boolean) => {
      if (visitUpdated) {
        showSnackbar('Visita actualizada exitosamente', 'success');
        // En una implementación real, aquí recargaríamos los datos de la visita
      }
    },
    [showSnackbar],
  );

  const formatTime = (time: string) => {
    if (!time) {
      return 'N/A';
    }

    const format12Hour = (time: string) => {
      try {
        const [hoursStr, minutesStr] = time.split(':');
        /* istanbul ignore next */
        if (!hoursStr || !minutesStr) return time;

        const hour = parseInt(hoursStr, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutesStr} ${ampm}`;
      } catch (e) {
        return time;
      }
    };

    return `${format12Hour(time)}`;
  };

  const handleContinueExecution = async () => {
    if (!isOffLine &&
      currentVisitAnswer?.status === ENUMS.configuracion.tipoEstadoVisita.children.enEjecucion &&
      currentSample?.id && currentVisitAnswer?.id) {

      try {
        const [offlineStatus, visitResponse] = await Promise.all([
          hasOfflineData(currentSample.id, currentVisitAnswer.id),
          getSampleVisit(currentVisitAnswer.id)
        ]);

        const serverStatus = visitResponse?.data?.status;
        const executedStatus = [ENUMS.configuracion.tipoEstadoVisita.children.ejecutado, ENUMS.configuracion.tipoEstadoVisita.children.culminadoSinEjecucion];

        // LOGIC: Show sync modal if:
        // 1. There is offline data (hasData is true)
        // 2. AND server status is NOT "executed" or "completed without execution"
        // 3. AND (
        //      a. It has never been synced (lastSyncedAt is null/undefined)
        //      b. OR it has been updated since last sync (updatedAt > lastSyncedAt)
        //    )
        console.log('serverStatus', offlineStatus, serverStatus, visitResponse?.data);

        const hasUnsyncedChanges = offlineStatus.hasData && (
          !offlineStatus.lastSyncedAt ||
          (offlineStatus.updatedAt && new Date(offlineStatus.updatedAt) > new Date(offlineStatus.lastSyncedAt))
        );

        if (hasUnsyncedChanges && !executedStatus.includes(serverStatus!)) {
          setShowSyncModal(true);
          return;
        }
      } catch (error) {
        console.error('Error checking visit status or offline data', error);
        // Fallback or continue if check fails? 
        // For now, if check fails we probably just let them continue or handle error.
        // Assuming we continue if check fails to avoid blocking user, or maybe just log.
      }
    }

    navigation.navigate('SampleVisitForm');
  };

  const handleInfoPress = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleSyncAccept = async () => {
    if (currentSample?.id && currentVisitAnswer?.id) {
      setIsSyncing(true);
      setShowSyncModal(false);

      try {
        const result = await syncOfflineData(user?.documentNumber || '', currentSample.id, currentVisitAnswer.id);
        if (result.success) {
          showSnackbar(result.message, 'success');
        } else {
          showSnackbar(result.message, 'error');
        }
      } catch (error) {
        showSnackbar('Error durante la sincronización', 'error');
      } finally {
        setIsSyncing(false);
      }
    }
    navigation.navigate('SampleVisitForm');
  };

  const handleSyncCancel = () => {
    setShowSyncModal(false);
    navigation.navigate('SampleVisitForm');
  };

  const handleSaveToLocal = async () => {
    if (!currentSample || !currentVisitAnswer) {
      showSnackbar('No hay datos disponibles para guardar', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveMonitoringDataToLocal(
        user?.documentNumber || '',
        currentSample,
        currentVisitAnswer,
      );

      if (result.success) {
        showSnackbar(result.message, 'success');
        console.log(
          `💾 Datos guardados exitosamente. Tamaño: ${result.dataSize} KB`,
        );
      } else {
        showSnackbar(result.message, 'error');
      }
    } catch (error) {
      console.error('Error al guardar datos:', error);
      showSnackbar('Error inesperado al guardar datos', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentVisitAnswer) {
    return (
      <View style={styles.container}>
        <Text>No hay visita seleccionada</Text>
        <Button title="Volver" onPress={handleGoBack} />
      </View>
    );
  }

  // Si la visita está programada, mostrar el formulario de pre-ejecución
  if (isVisitScheduled) {
    return (
      <View style={styles.container}>
        <View style={{ ...styles.header, paddingTop: top }}>
          <View style={styles.buttons}>
            <RoundButton icon="arrow-back" light action={handleGoBack} />
            <View style={styles.rightSection}>
              <View style={styles.label}>
                <Text style={styles.labelText}>
                  Inst.: {currentMonitoringInstrument?.code}
                </Text>
              </View>
              {!isOffLine &&
                (currentVisitAnswer.status ===
                  ENUMS.configuracion.tipoEstadoVisita.children.programado ||
                  currentVisitAnswer.status ===
                  ENUMS.configuracion.tipoEstadoVisita.children
                    .enEjecucion) && (
                  <Pressable
                    style={[
                      styles.saveButton,
                      isSaving && styles.saveButtonDisabled,
                    ]}
                    onPress={handleSaveToLocal}
                    disabled={isSaving}>
                    <Ionicons
                      name={isSaving ? 'cloud-upload' : 'save-outline'}
                      size={24}
                      color={isSaving ? '#9ca3af' : '#22c55e'}
                    />
                  </Pressable>
                )}
              <Pressable style={styles.infoButton} onPress={handleInfoPress}>
                <Ionicons
                  name="information-circle-outline"
                  size={24}
                  color="#494949"
                />
              </Pressable>
            </View>
          </View>
          <View style={styles.titles}>
            <Text style={styles.title}>{currentSample?.firstName + ' ' + currentSample?.lastName}</Text>
            <Text style={styles.subtitle}>
              {currentSample?.site?.code} - {currentSample?.site?.name}
            </Text>
          </View>
        </View>

        <PreExecutionForm
          onComplete={handlePreExecutionComplete}
          handleSaveToLocal={handleSaveToLocal}
          goBack={handleGoBack}
          currentVisitAnswer={currentVisitAnswer}
        />

        <InstrumentInfoModal
          visible={isModalVisible}
          onClose={handleCloseModal}
          instrument={currentMonitoringInstrument || null}
        />
      </View>
    );
  }

  const statusInfo = getStatusInfo(currentVisitAnswer.status);

  return (
    <View style={styles.container}>
      <View style={{ ...styles.header, paddingTop: top }}>
        <View style={styles.buttons}>
          <RoundButton icon="arrow-back" light action={handleGoBack} />
          <View style={styles.rightSection}>
            <View style={styles.label}>
              <Text style={styles.labelText}>
                Inst.: {currentMonitoringInstrument?.code}
              </Text>
            </View>
            {!isOffLine &&
              (currentVisitAnswer.status ===
                ENUMS.configuracion.tipoEstadoVisita.children.programado ||
                currentVisitAnswer.status ===
                ENUMS.configuracion.tipoEstadoVisita.children
                  .enEjecucion) && (
                <Pressable
                  style={[
                    styles.saveButton,
                    isSaving && styles.saveButtonDisabled,
                  ]}
                  onPress={handleSaveToLocal}
                  disabled={isSaving}>
                  <Ionicons
                    name={isSaving ? 'cloud-upload' : 'save-outline'}
                    size={24}
                    color={isSaving ? '#9ca3af' : '#22c55e'}
                  />
                </Pressable>
              )}
            <Pressable style={styles.infoButton} onPress={handleInfoPress}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color="#494949"
              />
            </Pressable>
          </View>
        </View>
        <View style={styles.titles}>
          <Text style={styles.title}>{currentSample?.firstName + ' ' + currentSample?.lastName}</Text>
          <Text style={styles.subtitle}>
            {currentSample?.site?.code} - {currentSample?.site?.name}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Status Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Estado de la Visita</Text>
          <View
            style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
            <Text style={styles.statusText}>{statusInfo.title}</Text>
          </View>
          <Text style={styles.description}>{statusInfo.description}</Text>
        </View>

        {/* Visit Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Detalles de la Visita</Text>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Código:</Text>
            <Text style={styles.detailValue}>{currentVisitAnswer.code}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Fecha Programada:</Text>
            <Text style={styles.detailValue}>
              {currentVisitAnswer.scheduledDate
                ? new Date(
                  currentVisitAnswer.scheduledDate,
                ).toLocaleDateString()
                : 'No programada'}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Horario:</Text>
            <Text style={styles.detailValue}>
              {formatTime(currentVisitAnswer.startTime)} - {formatTime(currentVisitAnswer.endTime)}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Tipo de Visita:</Text>
            <Text style={styles.detailValue}>
              {currentVisitAnswer.visitType ===
                ENUMS.configuracion.tipoVisita.children.presencial
                ? 'Presencial'
                : currentVisitAnswer.visitType ===
                  ENUMS.configuracion.tipoVisita.children.virtual
                  ? 'Virtual'
                  : 'Telefónico'}
            </Text>
          </View>

          {currentVisitAnswer.additionalData && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Dato Adicional:</Text>
              <Pressable
                style={{ flex: 1 }}
                onPress={() => setIsAdditionalDataExpanded(!isAdditionalDataExpanded)}>
                <Text
                  style={styles.detailValue}
                  numberOfLines={isAdditionalDataExpanded ? undefined : 2}
                  ellipsizeMode="tail">
                  {currentVisitAnswer.additionalData}
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Actions depending on status */}
        {(currentVisitAnswer.status ===
          ENUMS.configuracion.tipoEstadoVisita.children.enEjecucion ||
          currentVisitAnswer.status ===
          ENUMS.configuracion.tipoEstadoVisita.children.enProcesoCierre ||
          currentVisitAnswer.status ===
          ENUMS.configuracion.tipoEstadoVisita.children.ejecutado) && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Acciones</Text>
              <Button
                title="Continuar"
                onPress={handleContinueExecution}
                color="#4d4d4d"
              />
            </View>
          )}
      </ScrollView>

      <InstrumentInfoModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        instrument={currentMonitoringInstrument || null}
      />

      <SyncModal
        visible={showSyncModal}
        onAccept={handleSyncAccept}
        onCancel={handleSyncCancel}
      />

      <SyncLoadingModal visible={isSyncing} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: globalColors.background,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
  },
  scrollView: {
    padding: 16,
  },
  buttons: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    backgroundColor: '#4d4d4d',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  labelText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  saveButton: {
    padding: 4,
    borderRadius: 16,
    backgroundColor: '#f0fdf4',
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  saveButtonDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#9ca3af',
  },
  infoButton: {
    padding: 4,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titles: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    color: globalColors.dark,
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitle: {
    color: globalColors.gray,
    fontSize: 18,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailLabel: {
    width: 120,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  detailValue: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
});
