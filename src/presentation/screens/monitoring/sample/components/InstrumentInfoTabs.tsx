import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  MonitoringInstrument,
  VisitAnswer,
  Aspect,
} from '../../../../../core/entities';
import Icon from 'react-native-vector-icons/Ionicons';
import { useMonitoringStore } from '../../../../store/monitoring.store';
import { useSampleStore } from '../../../../store';
import { useAuthStore } from '../../../../store/auth.store';
import { useInstrumentItems } from '../../../../hooks';
import { InstrumentItemsForm } from './InstrumentItemsForm';
import { TransformResultService } from '../../../../simon/services/transform-result.service';
import {
  ObservationsCommitmentsEditor,
  ObservationsCommitmentsEditorRef,
} from './ObservationsCommitmentsEditor';
import { ENUMS } from '../../../../../core/constants';

// Paleta de colores de la aplicación
const APP_COLORS = {
  primary: '#bf0909', // Rojo principal
  secondary: '#494949', // Gris oscuro
  accent: '#75a25d', // Verde acento
  background: '#f5f5f5', // Gris claro de fondo
  white: '#ffffff',
  lightGray: '#e0e0e0',
  darkGray: '#6c757d',
  success: '#75a25d',
  info: '#17a2b8',
};

type TabType = 'info' | 'aspects' | 'items' | 'observations';

interface InstrumentInfoTabsProps {
  instrument?: MonitoringInstrument;
  visitAnswer?: VisitAnswer;
  onEditingObservationsChange?: (isEditing: boolean) => void;
  readonly?: boolean;
}

export const InstrumentInfoTabs: React.FC<InstrumentInfoTabsProps> = ({
  instrument,
  visitAnswer,
  onEditingObservationsChange,
  readonly = false,
}) => {
  console.log('instrument', instrument);
  console.log('visitAnswer', visitAnswer);
  const [activeTab, setActiveTab] = useState<TabType>('aspects');
  const [selectedAspect, setSelectedAspect] = useState<Aspect | null>(null);
  const [isLoadingAspect, setIsLoadingAspect] = useState<boolean>(false);
  const observationsEditorRef = useRef<ObservationsCommitmentsEditorRef>(null);

  const {
    getByAnswerVisitaAspect,
    setCurrentFormData,
    setCurrentSelectedAspect,
    sendObservationAndCommitments,
    updateObservationAndCommitments,
  } = useMonitoringStore();

  const { sample: currentSample } = useSampleStore();
  const { user, isOffLine } = useAuthStore();

  // Hook personalizado para manejar items de instrumentos (online/offline)
  const {
    fetchInstrumentItems,
    fetchExistingResponses,
    hasOfflineDataForAspect,
    isOfflineMode,
  } = useInstrumentItems();

  // Función para verificar si un aspecto está completado
  const isAspectCompleted = (aspectId: string): boolean => {
    const completed =
      visitAnswer?.completedAspects?.includes(aspectId) || false;
    return completed;
  };

  // Función para manejar el guardado de observaciones y compromisos
  const handleSaveObservationsCommitments = async (
    observation: string,
    commitments: string[],
  ) => {
    if (!visitAnswer?.id) {
      Alert.alert('Error', 'No se encontró la visita para guardar');
      return;
    }

    if (!currentSample?.id) {
      Alert.alert('Error', 'No se encontró la muestra para guardar');
      return;
    }

    try {
      // Verificar si estamos en modo offline
      console.log(
        '📱 Modo OFFLINE detectado - Actualizando observación y compromisos en SQLite...',
      );

      const resultOffline = await updateObservationAndCommitments(
        user?.documentNumber || '',
        currentSample.id,
        visitAnswer.id,
        observation,
        commitments,
      );
      if (isOffLine) {
        if (resultOffline.success) {
          Alert.alert('Guardado Offline', resultOffline.message);
          // Actualizar el visitAnswer local para reflejar los cambios
          if (visitAnswer) {
            visitAnswer.observation = observation;
            visitAnswer.commitments = commitments;
          }
        } else {
          Alert.alert('Error', resultOffline.message);
        }
      } else {
        console.log(
          '🌐 Modo ONLINE - Enviando observación y compromisos al servidor...',
        );
        const result = await sendObservationAndCommitments(
          visitAnswer.id,
          observation,
          commitments,
        );

        if (result.success) {
          Alert.alert('Éxito', result.message);
          // Actualizar el visitAnswer local para reflejar los cambios
          if (visitAnswer) {
            visitAnswer.observation = observation;
            visitAnswer.commitments = commitments;
          }
        } else {
          Alert.alert('Error', result.message);
        }
      }
    } catch (error) {
      console.error('❌ Error guardando observación y compromisos:', error);
      Alert.alert('Error', 'No se pudo guardar la información');
    }
  };

  const logSelectedAspect = (aspect: Aspect) => {
    console.log('Aspecto seleccionado:', {
      id: aspect.id,
      code: aspect.code,
      name: aspect.name,
      componentId: aspect.componentId,
      indicatorId: aspect.indicatorId,
      resultId: aspect.resultId,
      weighted: aspect.weighted,
    });
  };

  const updateFormWithExistingData = (items: any[], responses: any[]) => {
    try {
      const formData = TransformResultService.transformToFormFromResult(
        items,
        responses,
      );
      setCurrentFormData(formData);
      console.log('📝 Formulario actualizado con datos existentes:', formData);
    } catch (error) {
      console.error('Error al transformar respuestas a formulario:', error);
      setCurrentFormData({});
    }
  };

  const switchToItemsTab = (items: any[]) => {
    if (items.length > 0) {
      setActiveTab('items');
    }
  };

  const handleAspectPress = async (aspect: Aspect) => {
    try {
      setIsLoadingAspect(true);
      setSelectedAspect(aspect);
      setCurrentSelectedAspect(aspect); // Guardar en el store global
      logSelectedAspect(aspect);

      if (!instrument?.id) {
        console.error('No hay instrumento seleccionado');
        return;
      }

      console.log(
        `🎯 === INICIO - Carga de items para aspecto ${aspect.code} ===`,
      );
      console.log(`📱 Modo: ${isOfflineMode ? 'OFFLINE' : 'ONLINE'}`);

      // Verificar si hay datos offline disponibles para este aspecto
      if (isOfflineMode) {
        const hasOfflineData = hasOfflineDataForAspect(aspect.id);
        console.log(
          `💾 Datos offline disponibles: ${hasOfflineData ? 'SÍ' : 'NO'}`,
        );
      }

      // Obtener items del aspecto seleccionado usando el hook optimizado
      const items = await fetchInstrumentItems(instrument.id, aspect.id);
      if (!items) {
        console.log('❌ No se pudieron obtener items para el aspecto');
        return;
      }

      console.log(`✅ Items obtenidos: ${items.length} elementos`);

      // Obtener respuestas existentes para este aspecto si hay una visita actual
      if (visitAnswer?.id) {
        console.log('🔍 Buscando respuestas existentes...');
        const responses = await fetchExistingResponses(
          visitAnswer.id,
          aspect.id,
          getByAnswerVisitaAspect,
        );

        if (responses && responses.length > 0) {
          console.log(
            `📝 Respuestas existentes encontradas: ${responses.length}`,
          );
          // Actualizar el formulario con los datos existentes
          updateFormWithExistingData(items, responses);
        } else {
          console.log('🆕 No hay respuestas existentes, formulario limpio');
          // Limpiar el formulario si no hay respuestas
          setCurrentFormData({});
        }
      } else {
        console.log('⚠️ No hay visita actual, formulario limpio');
        // No hay visita actual, limpiar formulario
        setCurrentFormData({});
      }

      // Cambiar automáticamente a la pestaña de items
      switchToItemsTab(items);
      console.log('🎯 === FIN - Carga de items completada ===');
    } catch (error) {
      console.error('Error al cargar items del aspecto:', error);
      Alert.alert('Error', 'No se pudieron cargar los items del aspecto');
    } finally {
      setIsLoadingAspect(false);
    }
  };

  // Función para manejar cambio de tab
  const handleTabChange = (newTab: TabType) => {
    // Si estamos cambiando desde el tab de observaciones y hay una edición en curso,
    // cancelar la edición para que vuelva a aparecer el FAB button
    if (activeTab === 'observations' && newTab !== 'observations') {
      observationsEditorRef.current?.cancelEditing();
    }
    setActiveTab(newTab);
  };

  if (!instrument) {
    return (
      <View style={styles.emptyState}>
        <Icon name="document-outline" size={40} color={APP_COLORS.darkGray} />
        <Text style={styles.emptyText}>No hay instrumento seleccionado</Text>
      </View>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <ScrollView
            style={styles.tabContent}
            showsVerticalScrollIndicator={false}>
            <View style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <Icon
                  name="information-circle"
                  size={20}
                  color={APP_COLORS.primary}
                />
                <Text style={styles.cardTitle}>Detalles del Instrumento</Text>
              </View>

              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Código</Text>
                  <Text style={styles.infoValue}>{instrument.code}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Nombre</Text>
                  <Text style={styles.infoValue}>{instrument.name}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Etapa</Text>
                  <Text style={styles.infoValue}>
                    {instrument.stageDescription}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Modalidad</Text>
                  <Text style={styles.infoValue}>
                    {instrument.modalityDescription}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Tipo</Text>
                  <Text style={styles.infoValue}>
                    {ENUMS.configuracion.tipoInstrumento.descriptions[instrument.typeEnum]}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Muestra</Text>
                  <Text style={styles.infoValue}>
                    {ENUMS.configuracion.tipoActor.descriptions?.[instrument.sampleEnum]}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        );

      case 'aspects':
        return (
          <View style={{ flex: 1 }}>
            <ScrollView
              style={styles.tabContent}
              showsVerticalScrollIndicator={false}>
              <View style={styles.aspectsHeader}>
                <Icon name="list" size={20} color={APP_COLORS.primary} />
                <Text style={styles.aspectsTitle}>
                  Aspectos ({instrument.aspects?.length || 0})
                </Text>
              </View>

              {instrument.aspects && instrument.aspects.length > 0 ? (
                <View style={styles.aspectsList}>
                  {instrument.aspects.map((aspect, index) => (
                    <TouchableOpacity
                      key={aspect.id}
                      style={[
                        styles.aspectCard,
                        selectedAspect?.id === aspect.id &&
                        styles.aspectCardSelected,
                      ]}
                      onPress={() => handleAspectPress(aspect)}>
                      <View style={styles.aspectCardHeader}>
                        <View style={styles.aspectNumber}>
                          <Text style={styles.aspectNumberText}>{index + 1}</Text>
                        </View>
                        <View style={styles.aspectInfo}>
                          <View style={styles.aspectCodeContainer}>
                            <Text style={styles.aspectCode}>{aspect.code}</Text>
                            {isAspectCompleted(aspect.id) && (
                              <View style={styles.completedIndicator}>
                                <Text style={styles.completedText}>
                                  COMPLETADO
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.aspectName}>{aspect.name}</Text>
                        </View>
                        {/* <View style={styles.aspectWeight}>
                          <Text style={styles.aspectWeightText}>
                            {aspect.weighted}%
                          </Text>
                        </View> */}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Icon
                    name="document-outline"
                    size={40}
                    color={APP_COLORS.darkGray}
                  />
                  <Text style={styles.emptyText}>
                    No hay aspectos disponibles
                  </Text>
                </View>
              )}
            </ScrollView>
            {isLoadingAspect && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={APP_COLORS.primary} />
                <Text style={styles.loadingText}>Cargando items...</Text>
              </View>
            )}
          </View>
        );

      case 'items':
        return (
          <View style={styles.itemsTabContainer}>
            {selectedAspect && (
              <View style={styles.selectedAspectHeader}>
                <View style={styles.aspectHeaderInfo}>
                  <Icon
                    name="checkmark-circle"
                    size={20}
                    color={APP_COLORS.accent}
                  />
                  <View style={styles.aspectHeaderText}>
                    <Text style={styles.selectedAspectTitle}>
                      Aspecto Seleccionado
                    </Text>
                    <View style={styles.selectedAspectCodeContainer}>
                      <Text style={styles.selectedAspectCode}>
                        {selectedAspect.code}
                      </Text>
                      {isAspectCompleted(selectedAspect.id) && (
                        <View style={styles.completedIndicatorHeader}>
                          <Text style={styles.completedTextHeader}>
                            COMPLETADO
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.selectedAspectName}>
                      {selectedAspect.name}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            <View style={styles.itemsFormContainer}>
              <InstrumentItemsForm showHeader={false} readonly={readonly} />
            </View>
          </View>
        );

      case 'observations':
        return (
          <ScrollView
            style={styles.tabContent}
            showsVerticalScrollIndicator={false}>
            <ObservationsCommitmentsEditor
              visitAnswer={visitAnswer}
              onSave={handleSaveObservationsCommitments}
              onEditingObservationsChange={onEditingObservationsChange}
              readonly={readonly}
              ref={observationsEditorRef}
            />
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'info' && styles.activeTab]}
          onPress={() => handleTabChange('info')}>
          <Icon
            name="information-circle"
            size={18}
            color={
              activeTab === 'info' ? APP_COLORS.primary : APP_COLORS.darkGray
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'info' && styles.activeTabText,
            ]}>
            Info
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'aspects' && styles.activeTab]}
          onPress={() => handleTabChange('aspects')}>
          <Icon
            name="list"
            size={18}
            color={
              activeTab === 'aspects' ? APP_COLORS.primary : APP_COLORS.darkGray
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'aspects' && styles.activeTabText,
            ]}>
            Aspectos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'items' && styles.activeTab]}
          onPress={() => handleTabChange('items')}>
          <Icon
            name="clipboard-outline"
            size={18}
            color={
              activeTab === 'items' ? APP_COLORS.primary : APP_COLORS.darkGray
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'items' && styles.activeTabText,
            ]}>
            Items
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'observations' && styles.activeTab]}
          onPress={() => handleTabChange('observations')}>
          <Icon
            name="document-text"
            size={18}
            color={
              activeTab === 'observations'
                ? APP_COLORS.primary
                : APP_COLORS.darkGray
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'observations' && styles.activeTabText,
            ]}>
            Obs/Comp
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>{renderTabContent()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: APP_COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: APP_COLORS.lightGray,
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: APP_COLORS.secondary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: APP_COLORS.darkGray,
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: APP_COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 2,
    gap: 4,
  },
  activeTab: {
    backgroundColor: APP_COLORS.white,
    shadowColor: APP_COLORS.secondary,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: APP_COLORS.darkGray,
  },
  activeTabText: {
    color: APP_COLORS.primary,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  // Info tab styles
  infoCard: {
    backgroundColor: APP_COLORS.white,
    borderRadius: 8,
    padding: 16,
    shadowColor: APP_COLORS.secondary,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: APP_COLORS.secondary,
  },
  infoGrid: {
    gap: 10,
  },
  infoItem: {
    backgroundColor: APP_COLORS.background,
    borderRadius: 6,
    padding: 10,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: APP_COLORS.darkGray,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: APP_COLORS.secondary,
    fontWeight: '600',
  },
  // Aspects tab styles
  aspectsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  aspectsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: APP_COLORS.secondary,
  },
  aspectsList: {
    gap: 8,
  },
  aspectCard: {
    backgroundColor: APP_COLORS.white,
    borderRadius: 8,
    padding: 12,
    shadowColor: APP_COLORS.secondary,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: APP_COLORS.primary,
  },
  aspectCardSelected: {
    borderLeftColor: APP_COLORS.accent,
    backgroundColor: '#f8fff9',
  },
  aspectCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aspectNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: APP_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aspectNumberText: {
    color: APP_COLORS.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  aspectInfo: {
    flex: 1,
  },
  aspectCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aspectCode: {
    fontSize: 12,
    fontWeight: 'bold',
    color: APP_COLORS.primary,
    marginBottom: 1,
  },
  completedIndicator: {
    backgroundColor: APP_COLORS.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  completedText: {
    color: APP_COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  aspectName: {
    fontSize: 13,
    color: APP_COLORS.secondary,
    lineHeight: 16,
  },
  aspectWeight: {
    backgroundColor: APP_COLORS.lightGray,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  aspectWeightText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: APP_COLORS.secondary,
  },
  aspectIcon: {
    marginLeft: 6,
  },
  aspectDetails: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: APP_COLORS.lightGray,
    gap: 4,
  },
  aspectDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: APP_COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  aspectDetailLabel: {
    fontSize: 10,
    color: APP_COLORS.darkGray,
    fontWeight: '500',
  },
  aspectDetailValue: {
    fontSize: 10,
    color: APP_COLORS.secondary,
    fontWeight: 'bold',
  },
  // Observations tab styles
  observationCard: {
    backgroundColor: APP_COLORS.white,
    borderRadius: 8,
    padding: 16,
    shadowColor: APP_COLORS.secondary,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: APP_COLORS.info,
  },
  commitmentsCard: {
    backgroundColor: APP_COLORS.white,
    borderRadius: 8,
    padding: 16,
    shadowColor: APP_COLORS.secondary,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: APP_COLORS.accent,
  },
  commitmentsList: {
    gap: 8,
  },
  commitmentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  commitmentNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: APP_COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commitmentNumberText: {
    color: APP_COLORS.white,
    fontWeight: 'bold',
    fontSize: 10,
  },
  commitmentText: {
    fontSize: 13,
    color: APP_COLORS.secondary,
    flex: 1,
    lineHeight: 18,
  },
  observationText: {
    fontSize: 13,
    color: APP_COLORS.secondary,
    lineHeight: 18,
  },
  // Items tab styles
  itemsTabContainer: {
    flex: 1,
  },
  selectedAspectHeader: {
    backgroundColor: APP_COLORS.white,
    borderRadius: 8,
    margin: 16,
    marginBottom: 8,
    shadowColor: APP_COLORS.secondary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: APP_COLORS.accent,
  },
  aspectHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  aspectHeaderText: {
    flex: 1,
  },
  selectedAspectTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: APP_COLORS.darkGray,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  selectedAspectCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedAspectCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: APP_COLORS.accent,
    marginBottom: 2,
  },
  completedIndicatorHeader: {
    backgroundColor: APP_COLORS.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  completedTextHeader: {
    color: APP_COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  selectedAspectName: {
    fontSize: 13,
    color: APP_COLORS.secondary,
    lineHeight: 16,
  },
  aspectHeaderWeight: {
    backgroundColor: APP_COLORS.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aspectHeaderWeightText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: APP_COLORS.white,
  },
  itemsFormContainer: {
    flex: 1,
    paddingTop: 0,
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: APP_COLORS.darkGray,
    textAlign: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: APP_COLORS.primary,
    fontWeight: '600',
  },
});
