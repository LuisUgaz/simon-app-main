import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SampleCard } from './SampleCard';
import { SampleDetailModal } from './SampleDetailModal';
import { Sample } from '../../../../../core/entities';
import { globalColors } from '../../../../theme/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface Props {
  samples: Sample[];
  loading: boolean;
  showMore: boolean;
  loadHandler: () => void;
  autoReport: (sample: Sample) => boolean;
  onReload?: () => void;
}

export const SamplesList = ({
  samples,
  showMore,
  loadHandler,
  loading = true,
  autoReport,
  onReload,
}: Props) => {
  const [selectedSample, setSelectedSample] = React.useState<Sample | null>(
    null,
  );
  const [modalVisible, setModalVisible] = React.useState(false);

  const handleDetailPress = (sample: Sample) => {
    setSelectedSample(sample);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedSample(null);
  };

  return (
    <View>
      {samples.map(item => (
        <SampleCard
          key={item.id}
          sample={item}
          autoReport={autoReport(item)}
          onDetailPress={handleDetailPress}
        />
      ))}

      <SampleDetailModal
        visible={modalVisible}
        sample={selectedSample}
        onClose={closeModal}
      />

      {/* Mensaje cuando no hay muestras */}
      {samples.length === 0 && !loading && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Sin muestras disponibles</Text>
          <Text style={styles.emptySubtitle}>
            No se encontraron muestras para este instrumento de monitoreo.
          </Text>
          {onReload && (
            <TouchableOpacity
              style={styles.reloadButton}
              onPress={onReload}
              activeOpacity={0.8}>
              <Ionicons name="refresh-outline" size={20} color="#0437b0" />
              <Text style={styles.reloadButtonText}>Recargar</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {showMore && (
        <View style={styles.buttonContainer}>
          {loading && (
            <ActivityIndicator size="large" color={globalColors.danger} />
          )}

          {samples.length > 0 && !loading && (
            <TouchableOpacity
              style={styles.button}
              onPress={loadHandler}
              activeOpacity={0.8}>
              <Text style={styles.buttonText}>Ver más</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: 16,
    marginBottom: 40,
    alignItems: 'center',
  },
  button: {
    backgroundColor: globalColors.danger,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Sombra en Android
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: globalColors.dark,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: globalColors.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
  reloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f0f9ff',
    borderColor: '#0437b0',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  reloadButtonText: {
    color: '#0437b0',
    fontSize: 16,
    fontWeight: '600',
  },
});


