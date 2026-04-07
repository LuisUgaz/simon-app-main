import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import dayjs from 'dayjs';
import { MonitoringPlan } from '../../../../../core/entities';

interface Props {
  visible: boolean;
  onClose: () => void;
  plan: MonitoringPlan | null;
}

export const PlanInfoModal = ({ visible, onClose, plan }: Props) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(animatedValue, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(animatedValue, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, animatedValue]);

  if (!plan) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [
                {
                  scale: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
              opacity: animatedValue,
            },
          ]}
        >
          {/* Header del modal */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Ionicons name="information-circle" size={24} color="#494949" />
              <Text style={styles.title}>Información del Plan</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </Pressable>
          </View>

          {/* Contenido del modal */}
          <ScrollView style={styles.content}>
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Ionicons name="barcode-outline" size={20} color="#494949" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Código del Plan</Text>
                  <Text style={styles.infoValue}>{plan.code}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="document-text-outline" size={20} color="#494949" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Nombre del Plan</Text>
                  <Text style={styles.infoValue}>{plan.name}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={20} color="#494949" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Periodo</Text>
                  <Text style={styles.infoValue}>
                    {dayjs(plan.startDate).format('DD/MM/YYYY')} -{' '}
                    {dayjs(plan.endDate).format('DD/MM/YYYY')}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="school-outline" size={20} color="#494949" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Etapa</Text>
                  <Text style={styles.infoValue}>{plan.stageDescription}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="book-outline" size={20} color="#494949" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Modalidad</Text>
                  <Text style={styles.infoValue}>{plan.modeDescription}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={20} color="#494949" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Año</Text>
                  <Text style={styles.infoValue}>{plan.period || 'No especificado'}</Text>
                </View>
              </View>

              {plan.site?.name && (
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={20} color="#494949" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Sede</Text>
                    <Text style={styles.infoValue}>{plan.site.name}</Text>
                  </View>
                </View>
              )}

              {plan.actors && plan.actors.length > 0 && (
                <View style={styles.infoRow}>
                  <Ionicons name="people-outline" size={20} color="#494949" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Actores</Text>
                    <Text style={styles.infoValue}>
                      {plan.actors.map(actor => actor.nombre).join(', ')}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Botón de cerrar */}
          <View style={styles.footer}>
            <Pressable style={styles.closeModalButton} onPress={onClose}>
              <Text style={styles.closeModalText}>Cerrar</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 20,
    maxWidth: 400,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#494949',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  infoSection: {
    gap: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    lineHeight: 22,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  closeModalButton: {
    backgroundColor: '#494949',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeModalText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 