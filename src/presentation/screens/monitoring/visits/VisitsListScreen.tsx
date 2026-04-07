import React, { useState, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, Text, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RoundButton } from '../../../components';
import { NavigationProp, StackActions, useNavigation, useFocusEffect } from '@react-navigation/native';
import { RootStackParams } from '../../../routes/StackNavigator';
import { globalColors, globalStyles } from '../../../theme/theme';
import { VisitsList } from './components/VisitsList';
import { useAuthStore, useMonitoringStore } from '../../../store';
import { useAppStore } from '../../../store/app.store';
import { SyncProgressModal } from './components/SyncProgressModal';
import { VisitsStatsModal } from './components/VisitsStatsModal';
import { ENUMS } from '../../../../core/constants';

export const VisitsListScreen = () => {
  const { top } = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParams>>();
  const { getAllOfflineMonitoringData, syncOfflineData, getSampleVisit, deleteOfflineDataByVisit } = useMonitoringStore();
  const showSnackbar = useAppStore(state => state.showSnackbar);
  const [reloadKey, setReloadKey] = useState(0);
  const [showStatsModal, setShowStatsModal] = useState(false);

  const { user } = useAuthStore();
  const isOffLine = useAuthStore(state => state.isOffLine);
  // State for sync progress
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({
    currentVisit: 0,
    totalVisits: 0,
    currentVisitName: '',
    statusText: 'Sincronizando...',
  });

  // Helper: Obtener visitas locales
  const getLocalVisits = async () => {
    const result = await getAllOfflineMonitoringData(user?.documentNumber || '');
    if (!result.success || !result.data || result.data.length === 0) return [];

    return result.data.map((item: any) => {
      try {
        const parsed = JSON.parse(item.data);
        return {
          sampleId: parsed.sampleData.id,
          visitId: parsed.visitAnswerData.visitAnswerId,
        };
      } catch {
        return null;
      }
    }).filter((v: any) => v !== null);
  };

  // Helper: Verificar estado en servidor
  const verifyVisitsStatus = async (visits: any[]) => {
    return Promise.all(
      visits.map(async (v) => {
        if (!v) return null;
        try {
          const response = await getSampleVisit(v.visitId);
          if (response.success && response.data) {
            return { ...v, serverStatus: response.data.status };
          }
        } catch { } // Ignorar errores silenciosamente
        return null;
      })
    );
  };

  // Helper: Eliminar visitas completadas
  const removeCompletedVisits = async (visitsWithStatus: any[]) => {
    const executedStatus = ENUMS.configuracion.tipoEstadoVisita.children.ejecutado;
    const terminatedStatus = ENUMS.configuracion.tipoEstadoVisita.children.culminadoSinEjecucion;

    const toDelete = visitsWithStatus.filter(v =>
      v && (v.serverStatus === executedStatus || v.serverStatus === terminatedStatus)
    );

    if (toDelete.length > 0) {
      await Promise.all(
        toDelete.map(v => deleteOfflineDataByVisit(v.sampleId, v.visitId))
      );

      showSnackbar(
        `Se han eliminado ${toDelete.length} visitas del dispositivo porque ya fueron culminadas`,
        'success'
      );
      setReloadKey(prev => prev + 1);
    }
  };

  // Validate and cleanup completed visits
  useFocusEffect(
    useCallback(() => {
      const cleanupVisits = async () => {
        if (isOffLine) return;

        try {
          // 1. Obtener visitas locales
          const visitsToCheck = await getLocalVisits();
          if (visitsToCheck.length === 0) return;

          // 2. Verificar sus estados en el servidor
          const statusChecks = await verifyVisitsStatus(visitsToCheck);

          // 3. Eliminar las que ya están completadas
          await removeCompletedVisits(statusChecks);
        } catch { } // Fallo silencioso general
      };

      cleanupVisits();
    }, [isOffLine, user?.documentNumber, getAllOfflineMonitoringData, getSampleVisit, deleteOfflineDataByVisit, showSnackbar])
  );

  // Handle sync button press
  const handleSyncPress = async () => {
    try {
      // Show confirmation dialog
      Alert.alert(
        'Sincronizar visitas',
        '¿Está seguro de sincronizar las visitas que han sido completadas?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Sí, sincronizar',
            onPress: () => startSyncProcess(true),
          },
        ],
      );
    } catch (error) {
      console.error('Error al iniciar la sincronización:', error);
      Alert.alert('Error', 'No se pudo iniciar la sincronización');
    }
  };

  // Handle sync only button press
  const handleSyncOnlyPress = async () => {
    try {
      Alert.alert(
        'Sincronizar respuestas',
        '¿Está seguro de sincronizar las respuestas? (Se sincronizarán sólo aquellas que estén en ejecución)',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sí, sincronizar', onPress: () => startSyncProcess(false) },
        ],
      );
    } catch (error) {
      console.error('Error al iniciar el procesamiento:', error);
      Alert.alert('Error', 'No se pudo iniciar el procesamiento');
    }
  };

  // Start the sync process
  const startSyncProcess = async (withSend: boolean = true) => {
    try {
      setIsSyncing(true);

      // Get all offline monitoring data
      const result = await getAllOfflineMonitoringData(user?.documentNumber || '');

      if (!result.success || !result.data || result.data.length === 0) {
        Alert.alert('Información', 'No hay visitas para sincronizar');
        return;
      }
      console.log('result', result);
      // Filter only completed visits
      const toSendVisits = result.data.filter((visit: any) => {
        try {
          const visitData = JSON.parse(visit.data);
          const aspectCount = visitData.aspectsData.aspects.length;
          console.log('visitData', visitData);
          if (withSend) {
            return visitData.visitAnswerData.completedAspects.length === aspectCount;
          } else {
            return visitData.visitAnswerData.status === ENUMS.configuracion.tipoEstadoVisita.children.enEjecucion;
          }
        } catch (e) {
          console.log('Error al parsear la visita', e);
          return false;
        }
      });
      if (toSendVisits.length === 0) {
        Alert.alert('Información', 'No hay visitas para sincronizar');
        return;
      }
      // Initialize progress
      setSyncProgress(prev => ({
        ...prev,
        currentVisit: 0,
        totalVisits: toSendVisits.length,
        currentProgress: 0,
        totalProgress: toSendVisits.length * 100, // Assuming 100% per visit
      }));

      // Process each visit
      for (let i = 0; i < toSendVisits.length; i++) {
        const visit = toSendVisits[i];
        let visitData: any;

        try {
          visitData = JSON.parse(visit.data);

          // Update current visit info
          setSyncProgress(prev => ({
            ...prev,
            currentVisit: i + 1,
            currentVisitName: `Visita ${visitData.visitAnswerData.visitNumber}: ${visitData.sampleData.fullName}`,
            statusText: 'Sincronizando...',
          }));
          // Sync the visit
          const syncResult = await syncOfflineData(
            user?.documentNumber || '',
            visitData.sampleData?.id || '',
            visitData.visitAnswerData?.visitAnswerId || '',
            withSend
          );
          // await new Promise(resolve => setTimeout(resolve, 30000));

          if (syncResult?.success) {
            // Update progress
            setSyncProgress(prev => ({
              ...prev,
              currentProgress: (i + 1) * 100,
              statusText: 'Sincronización exitosa',
            }));
          } else {
            throw new Error(syncResult?.message || 'Error al sincronizar la visita');
          }
        } catch (error) {
          console.error('Error syncing visit:', error);
          setSyncProgress(prev => ({
            ...prev,
            statusText: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
          }));
          // Continue with next visit even if one fails
        }
      }

      Alert.alert('Sincronización completada', 'Se han sincronizado todas las visitas completadas');
    } catch (error) {
      console.error('Error in sync process:', error);
      Alert.alert('Error', 'Ocurrió un error durante la sincronización');
    } finally {
      setIsSyncing(false);
      // Reset progress
      setSyncProgress({
        currentVisit: 0,
        totalVisits: 0,
        currentVisitName: '',
        statusText: 'Sincronización completada',
      });
      // Trigger list reload
      setReloadKey(prev => prev + 1);
    }
  };

  return (
    <>
      <View style={{ ...styles.header, paddingTop: top }}>
        <View style={styles.buttons}>
          <RoundButton
            icon="close"
            light
            action={() => navigation.dispatch(StackActions.popToTop())}
          />
          <View style={styles.label}>
            <Text style={styles.labelText}>Visitas</Text>
          </View>
        </View>
        <View style={styles.titles}>
          <Text style={styles.title}>Visitas en Progreso</Text>
          <RoundButton
            icon="bar-chart"
            action={() => setShowStatsModal(true)}
            light={false}
            color={globalColors.tertiary}
          />
          {!isOffLine &&
            <RoundButton
              icon="sync"
              action={handleSyncOnlyPress}
              light={false}
              color={globalColors.dark}
            />
          }
          {!isOffLine &&
            <RoundButton
              icon="send"
              action={handleSyncPress}
              light={false}
              color={globalColors.white}
              green={true}
            />
          }
        </View>
      </View>
      <View style={globalStyles.container}>
        <VisitsList reloadKey={reloadKey} />
      </View>

      {/* Sync Progress Modal */}
      <SyncProgressModal
        visible={isSyncing}
        currentVisit={syncProgress.currentVisit}
        totalVisits={syncProgress.totalVisits}
        currentVisitName={syncProgress.currentVisitName}
        statusText={syncProgress.statusText}
      />

      {/* Stats Modal */}
      <VisitsStatsModal
        visible={showStatsModal}
        onClose={() => setShowStatsModal(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    backgroundColor: globalColors.background,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
  },
  buttons: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titles: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
    gap: 10,
  },
  syncButton: {
    backgroundColor: globalColors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: globalColors.dark,
    marginBottom: 8,
    flex: 1,
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
});
