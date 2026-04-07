import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  MonitoringInstrument,
  VisitAnswer,
  Aspect,
} from '../../../../../core/entities';
import Icon from 'react-native-vector-icons/Ionicons';
import {useMonitoringStore} from '../../../../store/monitoring.store';
import {InstrumentItemsForm} from './InstrumentItemsForm';

const {height: screenHeight} = Dimensions.get('window');

// Paleta de colores de la aplicación
const APP_COLORS = {
  primary: '#bf0909',    // Rojo principal
  secondary: '#494949',  // Gris oscuro
  accent: '#75a25d',     // Verde acento
  background: '#f5f5f5', // Gris claro de fondo
  white: '#ffffff',
  lightGray: '#e0e0e0',
  darkGray: '#6c757d',
  success: '#75a25d',
  info: '#17a2b8',
};

type TabType = 'info' | 'aspects' | 'items' | 'observations';

interface InstrumentInfoDrawerProps {
  visible: boolean;
  onClose: () => void;
  instrument?: MonitoringInstrument;
  visitAnswer?: VisitAnswer;
}

export const InstrumentInfoDrawer: React.FC<InstrumentInfoDrawerProps> = ({
  visible,
  onClose,
  instrument,
  visitAnswer,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('aspects');
  const [selectedAspect, setSelectedAspect] = useState<Aspect | null>(null);
  
  const { getItemsByInstrumentAspect, setCurrentInstrumentItems, setCurrentSelectedAspect } = useMonitoringStore();

  const handleAspectPress = async (aspect: Aspect) => {
    setSelectedAspect(aspect);
    setCurrentSelectedAspect(aspect); // Guardar en el store global
    console.log('Aspecto seleccionado:', {
      id: aspect.id,
      code: aspect.code,
      name: aspect.name,
      componentId: aspect.componentId,
      indicatorId: aspect.indicatorId,
      resultId: aspect.resultId,
      weighted: aspect.weighted,
    });

    // Obtener items del aspecto seleccionado
    if (instrument?.id) {
      try {
        const response = await getItemsByInstrumentAspect(instrument.id, aspect.id);
        if (response.success && response.data) {
          setCurrentInstrumentItems(response.data);
          console.log('Items del aspecto obtenidos:', response.data);
          // Cambiar automáticamente a la pestaña de items si hay datos
          if (response.data.length > 0) {
            setActiveTab('items');
          }
        } else {
          console.error('Error al obtener items del aspecto:', response.message);
          setCurrentInstrumentItems([]);
        }
      } catch (error) {
        console.error('Error al obtener items del aspecto:', error);
        setCurrentInstrumentItems([]);
      }
    }
  };

  const hasObservationsOrCommitments =
    visitAnswer?.observation ||
    (visitAnswer?.commitments && visitAnswer.commitments.length > 0);

  if (!instrument) {
    return null;
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
                    {instrument.typeDescription}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Muestra</Text>
                  <Text style={styles.infoValue}>
                    {instrument.sampleDescription}
                  </Text>
                </View>
                {instrument.component && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Componente</Text>
                    <Text style={styles.infoValue}>{instrument.component}</Text>
                  </View>
                )}
                {instrument.result && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Resultado</Text>
                    <Text style={styles.infoValue}>{instrument.result}</Text>
                  </View>
                )}
                {instrument.indicator && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Indicador</Text>
                    <Text style={styles.infoValue}>{instrument.indicator}</Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        );

      case 'aspects':
        return (
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
                        <Text style={styles.aspectCode}>{aspect.code}</Text>
                        <Text style={styles.aspectName}>{aspect.name}</Text>
                      </View>
                      <View style={styles.aspectWeight}>
                        <Text style={styles.aspectWeightText}>
                          {aspect.weighted}%
                        </Text>
                      </View>
                    </View>

                    {selectedAspect?.id === aspect.id && (
                      <View style={styles.aspectDetails}>
                        <View style={styles.aspectDetailItem}>
                          <Text style={styles.aspectDetailLabel}>Componente</Text>
                          <Text style={styles.aspectDetailValue}>{aspect.componentId}</Text>
                        </View>
                        <View style={styles.aspectDetailItem}>
                          <Text style={styles.aspectDetailLabel}>Resultado</Text>
                          <Text style={styles.aspectDetailValue}>{aspect.resultId}</Text>
                        </View>
                        <View style={styles.aspectDetailItem}>
                          <Text style={styles.aspectDetailLabel}>Indicador</Text>
                          <Text style={styles.aspectDetailValue}>{aspect.indicatorId}</Text>
                        </View>
                      </View>
                    )}

                    <Icon
                      name={
                        selectedAspect?.id === aspect.id
                          ? 'chevron-up'
                          : 'chevron-down'
                      }
                      size={18}
                      color={APP_COLORS.secondary}
                      style={styles.aspectIcon}
                    />
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
        );

      case 'items':
        return <InstrumentItemsForm />;

      case 'observations':
        return (
          <ScrollView
            style={styles.tabContent}
            showsVerticalScrollIndicator={false}>
            {visitAnswer?.observation && (
              <View style={styles.observationCard}>
                <View style={styles.cardHeader}>
                  <Icon name="document-text" size={20} color={APP_COLORS.info} />
                  <Text style={styles.cardTitle}>Observaciones</Text>
                </View>
                <Text style={styles.observationText}>
                  {visitAnswer.observation}
                </Text>
              </View>
            )}

            {visitAnswer?.commitments && visitAnswer.commitments.length > 0 && (
              <View style={styles.commitmentsCard}>
                <View style={styles.cardHeader}>
                  <Icon name="checkmark-done" size={20} color={APP_COLORS.success} />
                  <Text style={styles.cardTitle}>
                    Compromisos ({visitAnswer.commitments.length})
                  </Text>
                </View>
                <View style={styles.commitmentsList}>
                  {visitAnswer.commitments.map((commitment, index) => (
                    <View key={index} style={styles.commitmentItem}>
                      <View style={styles.commitmentNumber}>
                        <Text style={styles.commitmentNumberText}>
                          {index + 1}
                        </Text>
                      </View>
                      <Text style={styles.commitmentText}>{commitment}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {!hasObservationsOrCommitments && (
              <View style={styles.emptyState}>
                <Icon
                  name="document-outline"
                  size={40}
                  color={APP_COLORS.darkGray}
                />
                <Text style={styles.emptyText}>
                  No hay observaciones o compromisos disponibles
                </Text>
              </View>
            )}
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.drawer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Icon name="clipboard" size={24} color={APP_COLORS.primary} />
              <View>
                <Text style={styles.headerTitle}>Ficha de Monitoreo</Text>
                <Text style={styles.headerSubtitle}>{instrument.code}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={20} color={APP_COLORS.secondary} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'info' && styles.activeTab]}
              onPress={() => setActiveTab('info')}>
              <Icon
                name="information-circle"
                size={18}
                color={
                  activeTab === 'info'
                    ? APP_COLORS.primary
                    : APP_COLORS.darkGray
                }
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'info' && styles.activeTabText,
                ]}>
                Información
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'aspects' && styles.activeTab]}
              onPress={() => setActiveTab('aspects')}>
              <Icon
                name="list"
                size={18}
                color={
                  activeTab === 'aspects'
                    ? APP_COLORS.primary
                    : APP_COLORS.darkGray
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
              onPress={() => setActiveTab('items')}>
              <Icon
                name="clipboard-outline"
                size={18}
                color={
                  activeTab === 'items'
                    ? APP_COLORS.primary
                    : APP_COLORS.darkGray
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

            {hasObservationsOrCommitments && (
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'observations' && styles.activeTab,
                ]}
                onPress={() => setActiveTab('observations')}>
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
            )}
          </View>

          {/* Content */}
          {renderTabContent()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(73, 73, 73, 0.6)',
    justifyContent: 'flex-end',
  },
  drawer: {
    backgroundColor: APP_COLORS.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: '90%',
    maxHeight: screenHeight * 0.9,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: APP_COLORS.lightGray,
    backgroundColor: APP_COLORS.background,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
  closeButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: APP_COLORS.lightGray,
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
  aspectCode: {
    fontSize: 12,
    fontWeight: 'bold',
    color: APP_COLORS.primary,
    marginBottom: 1,
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
});
