import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  Pressable,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {RoundButton} from '../../../components';
import {InstrumentInfoModal} from './components/InstrumentInfoModal';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {RootStackParams} from '../../../routes/StackNavigator';
import {useMonitoringStore, useSampleStore, useAuthStore} from '../../../store';
import {globalColors} from '../../../theme/theme';
import {InstrumentInfoTabs} from './components/InstrumentInfoTabs';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  TransformResultService,
  VisitaRespuestaContainer,
} from '../../../simon/services/transform-result.service';
import {MonitoringMapper} from '../../../../infraestructure';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useItemControlsStore} from './stores/itemControlsStore';

// Colores de la aplicación
const APP_COLORS = {
  primary: '#bf0909',
  secondary: '#494949',
  accent: '#75a25d',
  white: '#ffffff',
  lightGray: '#e0e0e0',
};

export const SampleVisitFormScreen = () => {
  const {top} = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParams>>();

  const {user, isOffLine} = useAuthStore();
  const {
    currentMonitoringInstrument,
    currentMonitoringPlan,
    validateRequiredFields,
    sendVisitAnswers,
    sendVisitMuestra,
    deleteOfflineDataByVisit,
  } = useMonitoringStore();
  const {
    sample: currentSample,
    visitAnswer: currentVisitAnswer,
    markAspectAsCompleted,
    setVisitAnswer,
    clearSample,
    clearVisitAnswer,
  } = useSampleStore();

  // Limpiar el estado global al salir de la pantalla
  React.useEffect(() => {
    return () => {
      console.log('🧹 Limpiando datos de muestra y visita al salir...');
      // clearSample();
      // clearVisitAnswer();
    };
  }, []);

  const [fabExpanded, setFabExpanded] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [isEditingObservations, setIsEditingObservations] = useState(false);

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  // Determinar si debe estar en modo readonly basado en el estado de la visita
  const isReadOnlyMode = (): boolean => {
    if (!currentVisitAnswer?.status) {
      return false;
    }

    const readOnlyStatuses = [
      '5f44635329155ede050b662a', // ejecutado
      '5f482b0e623976b26a35e8a6', // culminadoSinEjecucion
    ];

    return readOnlyStatuses.includes(currentVisitAnswer.status);
  };

  const readonly = isReadOnlyMode();

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleToggleFab = () => {
    setFabExpanded(!fabExpanded);
  };

  // const handleCancel = () => {
  //   setShowCancelModal(true);
  //   setFabExpanded(false);
  // };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    // Aquí implementar la lógica de anulación
    Alert.alert(
      'Anulado',
      'El instrumento ha sido anulado y volverá a estado "Programado"',
    );
  };

  const handleConfirmSend = async () => {
    setShowSendModal(false);

    try {
      if (!currentVisitAnswer) {
        throw new Error('No hay visita de muestra disponible para enviar');
      }

      // Completar los campos faltantes del currentVisitAnswer
      const visitAnswerComplete = {
        ...currentVisitAnswer,
        // Completar campos de ejecución si no están presentes
        executionStartDate: currentVisitAnswer.executionStartDate || new Date(),
        executionStartTime:
          currentVisitAnswer.executionStartTime ||
          new Date().toTimeString().split(' ')[0],
        // Completar campos del monitor desde la muestra si no están presentes
        monitorType:
          currentVisitAnswer.monitorType || currentSample?.monitorType || '',
        monitorTypeDescription:
          currentVisitAnswer.monitorTypeDescription ||
          currentSample?.monitorTypeDescription ||
          '',
        monitorDocumentType:
          currentVisitAnswer.monitorDocumentType ||
          currentSample?.monitorDocumentType ||
          0,
        monitorDocumentNumber:
          currentVisitAnswer.monitorDocumentNumber ||
          currentSample?.monitorDocumentNumber ||
          '',
        monitorFirstName:
          currentVisitAnswer.monitorFirstName ||
          currentSample?.monitorFirstName ||
          '',
        monitorLastName:
          currentVisitAnswer.monitorLastName ||
          currentSample?.monitorLastName ||
          '',
        monitorMiddleName:
          currentVisitAnswer.monitorMiddleName ||
          currentSample?.monitorMiddleName ||
          '',
        monitorSite:
          currentVisitAnswer.monitorSite || currentSample?.monitorSite,
      };

      // Convertir directamente a formato de respuesta usando el mapper
      const visitAnswerResponse =
        MonitoringMapper.VisitAnswerToResponse(visitAnswerComplete);

      // Agregar las propiedades de muestra, instrumento y plan usando los mappers
      if (currentSample) {
        visitAnswerResponse.muestra =
          MonitoringMapper.SampleToNestedSampleResponse(currentSample);
      }

      if (currentMonitoringInstrument) {
        visitAnswerResponse.instrumento =
          MonitoringMapper.MonitoringInstrumentToNestedInstrumentResponse(
            currentMonitoringInstrument,
          );
      }

      // Crear plan básico
      visitAnswerResponse.plan = {
        codigo: currentMonitoringPlan?.code || '',
        nombre: currentMonitoringPlan?.name || '',
        enuTipo: currentMonitoringPlan?.enuType || '',
        tipoDescripcion: currentMonitoringPlan?.typeDescription || '',
        dre: currentMonitoringPlan?.dre
          ? MonitoringMapper.SiteEntityToSitesResponse(
              currentMonitoringPlan.dre,
            )
          : undefined,
        ugel: currentMonitoringPlan?.ugel
          ? MonitoringMapper.SiteEntityToSitesResponse(
              currentMonitoringPlan.ugel,
            )
          : undefined,
        sede: currentMonitoringPlan?.site
          ? MonitoringMapper.SiteEntityToSitesResponse(
              currentMonitoringPlan.site,
            )
          : undefined,
        ugels:
          currentMonitoringPlan?.ugels.map(ugel =>
            MonitoringMapper.SiteEntityToSitesResponse(ugel),
          ) || [],
        actores: currentMonitoringPlan?.actors || [],
        idMarcoLogico: currentMonitoringPlan?.idLogicalFramework || '',
        marcoLogicoNombre: currentMonitoringPlan?.nameLogicalFramework || '',
        descripcion: currentMonitoringPlan?.description || '',
        periodo: currentMonitoringPlan?.period || 2021,
        etapa: currentMonitoringPlan?.stage || 1,
        etapaDescripcion: currentMonitoringPlan?.stageDescription || '',
        modalidad: currentMonitoringPlan?.mode || '01',
        modalidadDescripcion: currentMonitoringPlan?.modeDescription || '',
        fechaInicio: currentMonitoringPlan?.startDate || new Date(),
        fechaFin: currentMonitoringPlan?.endDate || new Date(),
        esActivo: currentMonitoringPlan?.isActive || true,
        esCulminado: currentMonitoringPlan?.isFinish || false,
        publicado: currentMonitoringPlan?.public || true,
        id: currentMonitoringPlan?.id || '',
        key: currentMonitoringPlan?.key || '',
        fechaCreacion: new Date(),
        fechaModificacion: new Date(),
        usuarioCreacion: '',
        usuarioModificacion: '',
        inKey: undefined,
        componentes: [],
      };

      console.log('📤 Enviando visita de muestra:', visitAnswerResponse);

      // Enviar al backend usando la nueva función
      const result = await sendVisitMuestra(visitAnswerResponse);

      if (result.success) {
        // Actualizar el estado de la visita localmente para reflejar que fue enviada
        if (currentVisitAnswer) {
          setVisitAnswer({
            ...currentVisitAnswer,
            status: '5f44635329155ede050b662a', // Estado Enviada
          });

          // Eliminar la data offline asociada a esta visita si existe
          try {
            if (currentSample?.id && currentVisitAnswer.id) {
              console.log('🗑️ Eliminando data offline tras envío exitoso...');
              await deleteOfflineDataByVisit(
                currentSample.id,
                currentVisitAnswer.id,
              );
            }
          } catch (deleteError) {
            console.warn(
              '⚠️ Error al eliminar data offline tras envío:',
              deleteError,
            );
            // No detenemos el flujo si falla la eliminación local
          }
        }

        Alert.alert(
          'Envío Exitoso',
          'Todas las respuestas han sido enviadas correctamente.',
          [{text: 'Finalizar', style: 'default'}],
        );
      } else {
        Alert.alert(
          'Error al Enviar',
          result.message || 'Ocurrió un error al enviar las respuestas.',
          [{text: 'Entendido', style: 'default'}],
        );
      }
    } catch (error) {
      console.error('❌ Error en handleConfirmSend:', error);
      Alert.alert(
        'Error al Enviar',
        'Ocurrió un error al procesar el envío. Por favor, inténtelo nuevamente.',
        [{text: 'Entendido', style: 'default'}],
      );
    }
  };

  const handleSave = async () => {
    setFabExpanded(false);

    const validation = validateRequiredFields();

    if (!validation.isValid) {
      Alert.alert(
        'Campos Requeridos',
        `Los siguientes campos son obligatorios:\n\n${validation.missingFields.join(
          '\n',
        )}`,
        [{text: 'Entendido', style: 'default'}],
      );
      return;
    }

    try {
      // Preparar estructura de respuesta siguiendo el patrón de Angular
      const visitaRespuestaData = prepareVisitAnswerData();
      // Verificar si estamos en modo offline
      const {isOffLine} = useAuthStore.getState();

      console.log('📱 Modo OFFLINE detectado - Actualizando datos locales...');

      //#region Actualizar datos offline
      // En modo offline, actualizar los datos de respuestas en SQLite
      const {
        currentSelectedAspect,
        updateOfflineResponsesData,
        updateCompletedAspects,
        hasOfflineData,
        markOfflineDataAsSynced,
        saveMonitoringDataToLocal,
      } = useMonitoringStore.getState();

      if (!currentSelectedAspect || !currentVisitAnswer?.id) {
        throw new Error(
          'Faltan datos requeridos para la actualización offline',
        );
      }

      // Verificar si existe el registro offline, si no existe crearlo
      const hasData = await hasOfflineData(
        currentSample?.id || '',
        currentVisitAnswer.id,
      );

      console.log('asdsadsadasdasda', hasData);
      if (!hasData?.hasData) {
        console.log(
          '⚠️ No se encontraron datos offline, creando registro inicial...',
        );
        if (currentSample && currentVisitAnswer) {
          const saveResult = await saveMonitoringDataToLocal(
            user?.documentNumber || '',
            currentSample,
            currentVisitAnswer,
          );

          if (!saveResult.success) {
            throw new Error(
              saveResult.message || 'Error al crear registro offline inicial',
            );
          }
          console.log('✅ Registro offline inicial creado correctamente');
        } else {
          throw new Error(
            'Faltan datos de muestra o visita para crear registro offline',
          );
        }
      }

      // Actualizar las respuestas en SQLite
      const updateResult = await updateOfflineResponsesData(
        user?.documentNumber || '',
        currentVisitAnswer.id,
        currentSample?.id || '',
        currentSelectedAspect.id,
        visitaRespuestaData.respuestas,
      );

      if (!updateResult.success) {
        throw new Error(
          updateResult.message || 'Error al actualizar datos offline',
        );
      }
      console.log('✅ Datos offline actualizados correctamente');

      //#endregion

      // Marcar el aspecto como completado
      if (currentSelectedAspect) {
        await updateCompletedAspects(
          user?.documentNumber || '',
          currentSample?.id || '',
          currentVisitAnswer?.id || '',
          currentSelectedAspect.id,
        );
      }

      if (isOffLine) {
        Alert.alert(
          'Guardado Offline',
          'Las respuestas han sido guardadas localmente. Se sincronizarán cuando tengas conexión.',
          [{text: 'Continuar', style: 'default'}],
        );
      } else {
        // Actualizar timestamp de sincronización
        if (currentSample?.id && currentVisitAnswer?.id) {
          await markOfflineDataAsSynced(
            currentSample.id,
            currentVisitAnswer.id,
          );
        }
        console.log('🌐 Modo ONLINE - Enviando al servidor...');

        // En modo online, enviar al backend como antes
        await sendVisitAnswers(visitaRespuestaData);

        Alert.alert(
          'Guardado Exitoso',
          'Todas las respuestas han sido guardadas correctamente.',
          [{text: 'Continuar', style: 'default'}],
        );
      }

      if (currentSelectedAspect) {
        markAspectAsCompleted(currentSelectedAspect.id);
      }
    } catch (error) {
      console.error('❌ Error al guardar:', error);

      const {isOffLine: isOfflineMode} = useAuthStore.getState();
      const errorMessage = isOfflineMode
        ? 'Ocurrió un error al guardar los datos localmente. Por favor, inténtelo nuevamente.'
        : 'Ocurrió un error al procesar las respuestas. Por favor, inténtelo nuevamente.';
      Alert.alert('Error al Guardar', errorMessage, [
        {text: 'Entendido', style: 'default'},
      ]);
    }
  };

  const handleSend = () => {
    setFabExpanded(false);

    // Verificar si todos los aspectos están completados
    if (!currentMonitoringInstrument?.aspects) {
      Alert.alert('Error', 'No se encontraron aspectos para validar');
      return;
    }

    console.log('🔍 Verificando aspectos completados:');
    console.log(
      '📋 Total de aspectos:',
      currentMonitoringInstrument.aspects.length,
    );
    console.log(
      '✅ Aspectos completados:',
      currentVisitAnswer?.completedAspects,
    );

    const allAspectsCompleted = currentMonitoringInstrument.aspects.every(
      aspect => {
        const isCompleted =
          currentVisitAnswer?.completedAspects?.includes(aspect.id) || false;
        console.log(
          `  - ${aspect.name} (${aspect.id}): ${isCompleted ? '✅' : '❌'}`,
        );
        return isCompleted;
      },
    );

    console.log('🎯 Todos los aspectos completados:', allAspectsCompleted);

    if (!allAspectsCompleted) {
      Alert.alert(
        'Aspectos Incompletos',
        'Debe completar todos los aspectos del instrumento antes de poder enviar las respuestas.',
        [{text: 'Entendido', style: 'default'}],
      );
      return;
    }

    const validation = validateRequiredFields();

    if (!validation.isValid) {
      Alert.alert(
        'Campos Requeridos',
        `Los siguientes campos son obligatorios:\n\n${validation.missingFields.join(
          '\n',
        )}`,
        [{text: 'Entendido', style: 'default'}],
      );
      return;
    }

    // Mostrar modal de confirmación antes de enviar
    setShowSendModal(true);
  };

  // Función para preparar los datos de respuesta siguiendo el patrón de Angular
  const prepareVisitAnswerData = (): VisitaRespuestaContainer => {
    const {currentInstrumentItems, currentFormData, currentSelectedAspect} =
      useMonitoringStore.getState();

    if (!currentInstrumentItems || !currentFormData || !currentVisitAnswer) {
      throw new Error('Faltan datos requeridos para procesar las respuestas');
    }

    if (!currentSelectedAspect) {
      throw new Error(
        'No hay aspecto seleccionado para procesar las respuestas',
      );
    }

    console.log('🔄 Procesando respuestas...');
    console.log('📋 Items del instrumento:', currentInstrumentItems.length);
    console.log('📝 Datos del formulario:', Object.keys(currentFormData));
    console.log('🎯 Aspecto seleccionado:', currentSelectedAspect);

    const respuestas = currentInstrumentItems.map(item => {
      console.log(`🔄 Procesando item: ${item.code} - ${item.title}`);

      // Transformar usando el servicio
      let respuesta = TransformResultService.transformToVisitResult(
        item,
        currentFormData,
      );

      if (!respuesta) {
        // Crear respuesta vacía si no se encontraron datos
        respuesta = {};
        console.log(
          `⚠️ No se encontraron datos para item ${item.code}, creando respuesta vacía`,
        );
      }

      // Usar el aspecto seleccionado del store
      const aspecto = currentSelectedAspect;

      // Obtener el valor de 'apply' desde el store de controles
      // apply = true si el control está enabled (habilitado)
      // apply = false si el control está disabled (deshabilitado por reglas de dependencia)
      const controlsState = useItemControlsStore.getState().controls;
      const controlState = controlsState.get(item.code);
      const applyValue = controlState?.enabled ?? true; // Por defecto true si no está en el store

      console.log(`🔍 Campo apply para ${item.code}: enabled = ${applyValue}`);

      // Agregar información común del item
      const respuestaCompleta = {
        ...respuesta,
        idAspecto: aspecto.id,
        idVisitaMuestra: currentVisitAnswer.id,
        idItemInstrumento: item.id,
        aspectoDescripcion: aspecto.name,
        itemDescripcion: item.configuration.resolve.title,
        tipoItem: item.configuration.type,
        tipoItemDescripcion: item.configuration.name,
        codigoAspecto: aspecto.code,
        apply: applyValue, // true si está habilitado, false si está deshabilitado
      };

      console.log(
        `✅ Respuesta procesada para ${item.code}:`,
        respuestaCompleta,
      );
      return respuestaCompleta;
    });

    // Crear el contenedor de respuesta principal usando el aspecto seleccionado
    const visitaRespuestaContainer: VisitaRespuestaContainer = {
      respuestas: respuestas,
      idAspecto: currentSelectedAspect.id,
      idVisitaMuestra: currentVisitAnswer.id,
    };

    console.log('📦 Contenedor de respuestas final:', visitaRespuestaContainer);
    return visitaRespuestaContainer;
  };

  const handleInfoPress = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={{...styles.header, paddingTop: top}}>
        <View style={styles.buttons}>
          <RoundButton icon="arrow-back" light action={handleGoBack} />
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
          <Text style={styles.title}>
            {currentSample?.firstName + ' ' + currentSample?.lastName}
          </Text>
          <Text style={styles.subtitle}>
            {currentSample?.site?.code} - {currentSample?.site?.name}
          </Text>
        </View>
      </View>

      {/* Banner de modo readonly */}
      {readonly && (
        <View style={styles.readonlyBanner}>
          <Icon name="lock-closed" size={16} color="#856404" />
          <Text style={styles.readonlyText}>
            Modo de solo lectura - Esta visita ya fue{' '}
            {currentVisitAnswer?.status === '5f44629429155ede050b6628'
              ? 'enviada'
              : 'ejecutada'}
          </Text>
        </View>
      )}

      <InstrumentInfoTabs
        instrument={currentMonitoringInstrument}
        visitAnswer={currentVisitAnswer}
        onEditingObservationsChange={setIsEditingObservations}
        readonly={readonly}
      />

      {/* Floating Action Buttons */}
      {fabExpanded && !isEditingObservations && !readonly && (
        <>
          {/* <TouchableOpacity
            style={[styles.secondaryFab, styles.cancelFab]}
            onPress={handleCancel}
            activeOpacity={0.8}>
            <Icon name="close-circle" size={24} color="white" />
          </TouchableOpacity> */}

          <TouchableOpacity
            style={[styles.secondaryFab, styles.saveFab]}
            onPress={handleSave}
            activeOpacity={0.8}>
            <Icon name="save" size={24} color="white" />
          </TouchableOpacity>

          {!isOffLine && (
            <TouchableOpacity
              style={[styles.secondaryFab, styles.sendFab]}
              onPress={handleSend}
              activeOpacity={0.8}>
              <Icon name="send" size={24} color="white" />
            </TouchableOpacity>
          )}
        </>
      )}

      {/* Main Floating Action Button */}
      {!isEditingObservations && !readonly && (
        <TouchableOpacity
          style={[styles.mainFab, fabExpanded && styles.mainFabExpanded]}
          onPress={handleToggleFab}
          activeOpacity={0.8}>
          <Icon name={fabExpanded ? 'close' : 'menu'} size={24} color="white" />
        </TouchableOpacity>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Icon name="warning" size={48} color={APP_COLORS.primary} />
              <Text style={styles.modalTitle}>Confirmar Anulación</Text>
            </View>

            <Text style={styles.modalQuestion}>
              ¿Estás seguro(a) que desea anular el instrumento en ejecución?
            </Text>

            <View style={styles.modalWarning}>
              <Text style={styles.modalWarningLabel}>SIMON dice:</Text>
              <Text style={styles.modalWarningText}>
                Al anular el instrumento en ejecución, la visita volverá a
                estado "Programado" y toda respuesta realizada hasta este
                momento será borrada.
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowCancelModal(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleConfirmCancel}>
                <Text style={styles.modalConfirmText}>Sí, Anular</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Send Confirmation Modal */}
      <Modal
        visible={showSendModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSendModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Icon name="send" size={48} color={APP_COLORS.accent} />
              <Text style={styles.modalTitle}>Confirmar Envío</Text>
            </View>

            <Text style={styles.modalQuestion}>
              ¿Estás seguro(a) que desea enviar las respuestas marcadas en este
              instrumento?
            </Text>

            <View style={styles.modalWarning}>
              <Text style={styles.modalWarningLabel}>SIMON dice:</Text>
              <Text style={styles.modalWarningText}>
                Al enviar la solicitud, esta ya no podrá ser modificada. Además,
                las respuestas pasarán a ser parte de las estadísticas
                resultantes de la ejecución de los instrumentos del plan de
                monitoreo en ejecución.
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowSendModal(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalConfirmButton, styles.modalSendButton]}
                onPress={handleConfirmSend}>
                <Text style={styles.modalConfirmText}>Sí, Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <InstrumentInfoModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        instrument={currentMonitoringInstrument || null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: globalColors.background,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
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
    gap: 8,
  },
  label: {
    backgroundColor: APP_COLORS.secondary,
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
    gap: 4,
  },
  title: {
    color: globalColors.dark,
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    color: globalColors.gray,
    fontSize: 14,
  },
  // Floating Action Button styles
  mainFab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: APP_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: APP_COLORS.secondary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  mainFabExpanded: {
    backgroundColor: APP_COLORS.secondary,
  },
  secondaryFab: {
    position: 'absolute',
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: APP_COLORS.secondary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
  },
  cancelFab: {
    bottom: 150,
    backgroundColor: '#e74c3c',
  },
  saveFab: {
    bottom: 120,
    backgroundColor: APP_COLORS.accent,
  },
  sendFab: {
    bottom: 180,
    backgroundColor: '#3498db',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: APP_COLORS.white,
    borderRadius: 12,
    padding: 24,
    maxWidth: 400,
    width: '100%',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: APP_COLORS.secondary,
    textAlign: 'center',
  },
  modalQuestion: {
    fontSize: 16,
    color: APP_COLORS.secondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  modalWarning: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  modalWarningLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  modalWarningText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: APP_COLORS.lightGray,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_COLORS.secondary,
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#e74c3c',
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_COLORS.white,
  },
  modalSendButton: {
    backgroundColor: APP_COLORS.accent,
  },
  readonlyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  readonlyText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#856404',
    fontWeight: '500',
  },
});
