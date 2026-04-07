import React, { useEffect, useState, useCallback, useRef } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { globalColors } from '../../../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RoundButton } from '../../../components';
import { InstrumentInfoModal } from './components/InstrumentInfoModal';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParams } from '../../../routes/StackNavigator';
import { VisitsSampleList } from './components/VisitsSampleList';
import { useMonitoringStore, useSampleStore } from '../../../store';
import { SampleVisitForm } from './components/SampleVisitForm';
import {
  Sample,
  Visit,
  VisitAnswer,
  VisitInstrument,
} from '../../../../core/entities';
import { getSampleVisits } from '../../../../core/actions';
import { StatusPageResponse } from '../../../../infraestructure';
import { ENUMS } from '../../../../core/constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StatusLegendModal } from './components/StatusLegendModal';

export const SampleDetailScreen = () => {
  const { top } = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParams>>();

  const currentMonitoringInstrument = useMonitoringStore(
    state => state.currentMonitoringInstrument,
  );
  const mode = useMonitoringStore(state => state.mode);
  const currentSample = useSampleStore(state => state.sample);
  const currentVisit = useSampleStore(state => state.visit);
  const { clearSample, clearVisit } = useSampleStore();

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isLegendModalVisible, setIsLegendModalVisible] = useState<boolean>(false);

  // samples grid states
  const [visits, setVisits] = useState<VisitAnswer[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(100);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [, setWithError] = useState<boolean>(false);
  const isFirstRender = useRef(true);

  // Función para determinar si el estado es avanzado
  const isAdvancedStatus = useCallback((status: string): boolean => {
    const advancedStatuses = [
      ENUMS.configuracion.tipoEstadoVisita.children.programado,
      ENUMS.configuracion.tipoEstadoVisita.children.enEjecucion,
      ENUMS.configuracion.tipoEstadoVisita.children.enProcesoCierre,
      ENUMS.configuracion.tipoEstadoVisita.children.ejecutado,
      ENUMS.configuracion.tipoEstadoVisita.children.envioConError,
      ENUMS.configuracion.tipoEstadoVisita.children.noEjecutado,
      ENUMS.configuracion.tipoEstadoVisita.children.culminadoSinEjecucion,
    ];
    return advancedStatuses.includes(status);
  }, []);

  const searchHandler = useCallback(
    (sample: Sample) => {
      if (isLoading) {
        return false;
      }

      setWithError(false);
      setIsLoading(true);
      getSampleVisits(
        { page: page, pageSize: pageSize } as any,
        '', //pageSise
        '',
        sample.id,
      )
        .then((value: StatusPageResponse<VisitAnswer[]>) => {
          setIsLoading(false);
          if (!value.status.success) {
            setWithError(true);
            setVisits([]);
          } else {
            if (value['data'].length > 0) {
              setPage(page + 1);
            }
            setVisits(value['data']);
          }
        })
        .catch(() => {
          setIsLoading(false);
          setWithError(true);
        });
    },
    [isLoading, page, pageSize, setWithError, setIsLoading, setPage, setVisits],
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }

      // Lógica al volver desde otra pantalla
      setVisits([]);
      setPage(1);
      if (currentSample) {
        searchHandler(currentSample);
      }
    });

    return unsubscribe;
  }, [navigation, currentSample, searchHandler]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', e => {
      if (!e.data.action?.type.includes('POP')) return;
      clearSample();
      clearVisit();
    });

    return unsubscribe;
  }, [navigation, clearSample, clearVisit]);

  useEffect(() => {
    if (currentSample) searchHandler(currentSample);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSample]);

  // Verificar si la visita está en un estado avanzado y redirigir a la pantalla de ejecución
  useEffect(() => {
    if (
      currentVisit &&
      mode === 'EXECUTION' &&
      isAdvancedStatus(currentVisit.status)
    ) {
      navigation.navigate('SampleVisitExecution');
    }
  }, [currentVisit, mode, navigation, isAdvancedStatus]);

  const handleReload = useCallback(() => {
    setPage(1);
    setVisits([]);
    if (currentSample) {
      searchHandler(currentSample);
    }
  }, [currentSample, searchHandler]);

  const getVisits = (): {
    visit: Visit;
    instrumentVisit: VisitInstrument;
    sampleVisit?: VisitAnswer;
  }[] => {
    const matrix: {
      visit: Visit;
      instrumentVisit: VisitInstrument;
      sampleVisit?: VisitAnswer;
    }[] = [];
    console.log('visits', visits);
    currentMonitoringInstrument?.visits.forEach(x => {
      const visitSample = visits.find(y => y.code === x.code);
      matrix.push({
        visit: {
          id: visitSample?.id,
          visitNumber: x.visitNumber,
          code: x.code,
          comment: visitSample?.additionalData,
          scheduledDate: visitSample?.scheduledDate,
          startTime: visitSample?.startTime,
          endTime: visitSample?.endTime,
          status: visitSample
            ? visitSample?.status
            : ENUMS.configuracion.tipoEstadoVisita.children.asignado,
          type: visitSample?.visitType,
        } as Visit,
        instrumentVisit: x,
        sampleVisit: visitSample,
      });
    });
    return matrix;
  };

  const goBack = () => {
    clearSample();
    clearVisit();
    navigation.goBack();
  };

  const handleInfoPress = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={{ ...styles.header, paddingTop: top }}>
        <View style={styles.buttons}>
          <RoundButton icon="arrow-back" light action={() => goBack()} />
          <View style={styles.rightSection}>
            {currentSample?.autoReport && (
              <View style={styles.autoReportContainer}>
                <Icon name="flash" size={14} color="#fff" />
                <Text style={styles.autoReportText}>Auto Reporte</Text>
              </View>
            )}
            <View style={styles.label}>
              <Text style={styles.labelText}>
                Inst.: {currentMonitoringInstrument?.code}
              </Text>
            </View>
            <Pressable style={styles.infoButton} onPress={handleInfoPress}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color="#494949"
              />
            </Pressable>
            <Pressable
              style={styles.infoButton}
              onPress={() => setIsLegendModalVisible(true)}>
              <Ionicons name="color-palette-outline" size={24} color="#494949" />
            </Pressable>
          </View>
        </View>
        <View style={styles.titles}>
          <Text style={styles.title}>{currentSample?.firstName} {currentSample?.lastName} {currentSample?.middleName}</Text>
          <Text style={styles.subtitle}>
            {currentSample?.site?.code} - {currentSample?.site?.name}
          </Text>
        </View>
      </View>
      {currentVisit &&
        (mode !== 'EXECUTION' || !isAdvancedStatus(currentVisit.status)) && (
          <SampleVisitForm
            visit={currentVisit}
            callback={handleReload}
          />
        )}

      {!currentVisit && (
        <VisitsSampleList
          visits={getVisits()}
          autoReport={currentSample?.autoReport!}
          onReload={handleReload}
        />
      )}

      <InstrumentInfoModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        instrument={currentMonitoringInstrument || null}
      />

      <StatusLegendModal
        visible={isLegendModalVisible}
        onClose={() => setIsLegendModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: globalColors.background,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
  },
  bottomSheet: {
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
    borderBottomEndRadius: 0,
    borderBottomStartRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
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
  autoReportContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  autoReportText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,
  },
});
