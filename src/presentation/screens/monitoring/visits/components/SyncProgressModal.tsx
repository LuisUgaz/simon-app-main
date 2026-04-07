import React from 'react';
import {View, Text, StyleSheet, Modal, ActivityIndicator} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {globalColors} from '../../../../theme/theme';

export interface SyncProgressModalProps {
  visible: boolean;
  currentVisit: number;
  totalVisits: number;
  currentVisitName?: string;
  statusText?: string;
}

export const SyncProgressModal = ({
  visible,
  currentVisit,
  totalVisits,
  currentVisitName = '',
  statusText = 'Sincronizando...',
}: SyncProgressModalProps) => {
  // Calculate percentages
  const visitPercentage = totalVisits > 0 ? Math.round((currentVisit / totalVisits) * 100) : 0;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Icon name="sync-outline" size={32} color={globalColors.primary} />
            <Text style={styles.title}>Sincronizando Visitas</Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                Progreso de la sincronización
              </Text>
              <Text style={styles.progressText}>
                {currentVisit} de {totalVisits} visitas
              </Text>
            </View>

            {/* Overall Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {width: `${visitPercentage}%`, backgroundColor: globalColors.green},
                ]}
              />
            </View>

            <View style={styles.visitInfo}>
              <Text style={styles.visitName} numberOfLines={1} ellipsizeMode="tail">
                {currentVisitName || `Visita ${currentVisit}`}
              </Text>
              <Text style={styles.statusText}>{statusText}</Text>
            </View>
          </View>

          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={globalColors.primary} />
            <Text style={styles.loadingText}>Por favor espere...</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: globalColors.dark,
    marginLeft: 10,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: globalColors.gray,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: globalColors.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: globalColors.primary,
  },
  visitInfo: {
    marginBottom: 16,
  },
  visitName: {
    fontSize: 16,
    fontWeight: '600',
    color: globalColors.dark,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: globalColors.gray,
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: globalColors.gray,
  },
});
