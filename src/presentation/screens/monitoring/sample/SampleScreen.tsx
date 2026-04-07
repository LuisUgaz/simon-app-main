import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { globalColors, globalStyles } from '../../../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RoundButton } from '../../../components';
import { InstrumentInfoModal } from './components/InstrumentInfoModal';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { RootStackParams } from '../../../routes/StackNavigator';
import { SamplesList } from './components/SamplesList';
import { StatusLegendModal } from './components/StatusLegendModal';
import { useAuthStore, useMonitoringStore, useSampleStore } from '../../../store';
import { MonitoringInstrument, Sample } from '../../../../core/entities';
import { StatusPageResponse } from '../../../../infraestructure';
import { getSamples } from '../../../../core/actions';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BUSINESS_RULES, ENUMS } from '../../../../core/constants';

export const SamplesScreen = () => {
  const { top } = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParams>>();
  const params = useRoute<RouteProp<RootStackParams, 'Samples'>>().params;

  const currentMonitoringInstrument = useMonitoringStore(
    state => state.currentMonitoringInstrument,
  );
  const { setCurrentInstrument, addAutoSample } = useMonitoringStore(
    state => state,
  );
  const user = useAuthStore(state => state.user);
  const currentInstitution = useAuthStore(state => state.currentInstitution);
  const currentSite = useAuthStore(state => state.currentSite);
  const { clearSample, clearVisit } = useSampleStore();

  // Modal state
  // Modal state
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isLegendModalVisible, setIsLegendModalVisible] = useState<boolean>(false);

  // Auto report loading state
  const [isAutoReportLoading, setIsAutoReportLoading] =
    useState<boolean>(false);

  // samples grid states
  const [samples, setSamples] = useState<Sample[]>([]);
  const [lastKeyForPaginate, setLastKeyForPaginate] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [flagShowMore, setFlagShowMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }

      // Lógica al volver desde otra pantalla
      setSamples([]);
      setLastKeyForPaginate('');
      setPage(1);
      setPageSize(samples.length);
      setFlagShowMore(true);
      if (params.sheet) {
        searchHandler(params.sheet, () => {
          setPageSize(10);
        });
      }
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, params.sheet]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', e => {
      if (!e.data.action?.type.includes('POP')) {
        return;
      }
      clearSample();
      clearVisit();
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  useEffect(() => {
    setCurrentInstrument(params.sheet);
    if (params.sheet) {
      searchHandler(params.sheet);
    }

    console.log('params.sheet', params.sheet);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleAutoReport = async () => {
    setIsAutoReportLoading(true);

    try {
      const codigoActor = BUSINESS_RULES.rolActorRelations.find(
        x => x.rol === currentSite?.roleCode,
      );

      const autoSample = {
        dre: currentInstitution?.dreCode,
        dreDescripcion: currentInstitution?.dreName,
        enuTipoMonitor: codigoActor?.actor,
        esActivo: true,
        idInstrumento: currentMonitoringInstrument?.id,
        idNivel: currentInstitution?.level,
        idTipoMuestra: currentMonitoringInstrument?.sampleEnum,
        monitorNombres: user?.names,
        monitorNumeroDocumento: user?.documentNumber,
        monitorPrimerApellido: user?.firstLastName,
        monitorSede: {
          anexo: currentInstitution?.anexo,
          codigoSede: currentInstitution?.modularCode,
          nombreSede: currentInstitution?.name,
          tipoSede: currentSite?.typeIndex,
        },
        monitorSegundoApellido: user?.secondLastName,
        monitorTipoDocumento: user?.idDocumentType,
        nivelDescripcion: currentInstitution?.levelDescription,
        nombres: user?.names,
        numeroDocumento: user?.documentNumber,
        primerApellido: user?.firstLastName,
        sede: {
          anexo: currentInstitution?.anexo,
          codigoSede: currentInstitution?.modularCode,
          nombreSede: currentInstitution?.name,
          tipoSede: currentSite?.typeIndex,
          tipoSedeDescripcion: 'Institución Educativa',
        },
        segundoApellido: user?.secondLastName,
        tipoDocumento: user?.idDocumentType,
        tipoMonitorDescripcion:
          ENUMS.configuracion.tipoActor.descriptions[codigoActor?.actor!],
        tipoMuestraDescripcion:
          ENUMS.configuracion.tipoActor.descriptions[codigoActor?.actor!],
        ugel: currentInstitution?.ugelCode,
        ugelDescripcion: currentInstitution?.ugelName,
        visitas: currentMonitoringInstrument?.visits.map(x => {
          return {
            codigo: x.code,
            enuEstado: ENUMS.configuracion.tipoEstadoVisita.children.asignado,
            numeroVisita: x.visitNumber,
          };
        }),
      };

      await addAutoSample(currentMonitoringInstrument?.id!, [autoSample]);

      // Resetear paginación y buscar muestras desde el inicio
      setSamples([]);
      setLastKeyForPaginate('');
      setPage(1);
      setFlagShowMore(true);
      searchHandler(currentMonitoringInstrument!);
    } catch (error) {
      console.error('Error al crear auto reporte:', error);
    } finally {
      setIsAutoReportLoading(false);
    }
  };

  const searchHandler = useCallback(
    (instrument: MonitoringInstrument, callback?: () => void) => {
      if (isLoading) {
        return false;
      }

      setIsLoading(true);
      console.log('FILTRO GET SAMPLES', user);
      getSamples(
        { page: page, pageSize: pageSize } as any,
        user?.documentNumber!,
        user?.idDocumentType!,
        '', //pageSise
        Number(currentSite?.typeIndex),
        currentSite?.code!,
        lastKeyForPaginate,
        instrument.id,
      )
        .then((value: StatusPageResponse<Sample[]>) => {
          setIsLoading(false);
          if (!value.status.success) {
            setSamples([]);
          } else {
            if (value.data.length > 0) {
              setLastKeyForPaginate(value.data[value.data.length - 1].key);
              setPage(page + 1);
            } else {
              setFlagShowMore(false);
            }
            setSamples(samples.concat(value.data));
            callback?.();
          }
        })
        .catch(_value => {
          setIsLoading(false);
        });
    },
    [
      isLoading,
      page,
      pageSize,
      user?.documentNumber,
      user?.idDocumentType,
      currentSite?.typeIndex,
      currentSite?.code,
      lastKeyForPaginate,
      samples,
    ],
  );

  const isAutoReport = (sample: Sample): boolean => {
    if (
      user?.documentNumber === sample.documentNumber &&
      Number(user?.idDocumentType) === sample.documentType &&
      sample.monitorDocumentNumber === sample?.documentNumber &&
      sample.monitorDocumentType === sample?.documentType
    ) {
      return true;
    }
    return false;
  };

  const shouldShowAutoReport = (() => {
    if (!params?.sheet) {
      return false;
    }
    // return true;
    console.log('params.sheet', params.sheet);
    const sheet = params.sheet;
    const director = ENUMS.configuracion.tipoActor.children.directorIE;
    const docente = ENUMS.configuracion.tipoActor.children.docente;

    const existsUser = samples.some(
      x => x.documentNumber === user?.documentNumber,
    );
    const userCodeActor = BUSINESS_RULES.rolActorRelations.find(
      x => x.rol === currentSite?.roleCode,
    );

    if (existsUser) {
      return false;
    }
    console.log('sheet', sheet);
    console.log('userCodeActor', userCodeActor);

    if (
      sheet.sampleEnum === docente &&
      sheet?.isAutoevaluationOfTeachers &&
      sheet.appliesToAllTeachers &&
      userCodeActor?.actor === docente
    ) {
      return true;
    }
    if (
      sheet.sampleEnum === director &&
      sheet.monitorsEnums?.includes(director) &&
      userCodeActor?.actor === director
    ) {
      return true;
    }
    if (
      sheet.sampleEnum === director &&
      !sheet.monitorsEnums?.includes(director) &&
      sheet?.isAutoevaluationOfTeachers &&
      sheet.appliesToAllTeachers &&
      userCodeActor?.actor === director
    ) {
      return true;
    }

    return false;
  })();

  return (
    <View style={styles.container}>
      <View style={{ ...styles.header, paddingTop: top }}>
        <View style={styles.buttons}>
          <RoundButton icon="arrow-back" light action={() => goBack()} />
          <View style={styles.rightSection}>
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
          </View>
        </View>
        <View style={styles.titles}>
          <Text style={styles.title}>Muestras</Text>
          <Pressable
            style={styles.legendButton}
            onPress={() => setIsLegendModalVisible(true)}>
            <Ionicons name="color-palette-outline" size={20} color="#0437b0" />
            <Text style={styles.legendText}>Leyenda</Text>
          </Pressable>
        </View>
      </View>
      <ScrollView
        style={globalStyles.container}
        showsVerticalScrollIndicator={false}>
        {shouldShowAutoReport && (
          <Pressable
            onPress={handleAutoReport}
            style={styles.autoReportButton}
            disabled={isAutoReportLoading}>
            {isAutoReportLoading ? (
              <ActivityIndicator size="large" color={globalColors.danger} />
            ) : (
              <>
                <Ionicons name="create-outline" size={20} color="#0437b0" />
                <Text style={styles.autoReportText}>Iniciar Auto Reporte</Text>
              </>
            )}
          </Pressable>
        )}
        <SamplesList
          samples={samples}
          loading={isLoading}
          showMore={flagShowMore}
          loadHandler={() => searchHandler(currentMonitoringInstrument!)}
          autoReport={isAutoReport}
          onReload={() => searchHandler(currentMonitoringInstrument!)}
        />
      </ScrollView>

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
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  title: {
    color: globalColors.dark,
    fontSize: 22,
    fontWeight: 'bold',
  },
  autoReportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f0f9ff',
    borderColor: '#0437b0',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  autoReportText: {
    color: '#0437b0',
    fontSize: 14,
  },
  legendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  legendText: {
    fontSize: 12,
    color: '#0437b0',
    fontWeight: '600',
  },
});
