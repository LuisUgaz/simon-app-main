import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParams } from '../../../../routes/StackNavigator';
import { SheetCard } from './SheetCard';
import { MonitoringInstrument } from '../../../../../core/entities';
import { globalColors } from '../../../../theme/theme';
import { useMonitoringStore } from '../../../../store';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface Props {
  instruments: MonitoringInstrument[];
  loading: boolean;
  showMore: boolean;
  loadHandler: () => void;
  onReload?: () => void;
}

export const SheetsList = ({
  instruments,
  showMore,
  loadHandler,
  loading = true,
  onReload,
}: Props) => {
  const navigation = useNavigation<NavigationProp<RootStackParams>>();
  const getInstrument = useMonitoringStore(state => state.getInstrument);

  const [loadingSheetId, setLoadingSheetId] = React.useState<string | null>(null);

  const getSheet = async (sheet: MonitoringInstrument) => {
    if (loadingSheetId) return; // Evitar doble toque
    setLoadingSheetId(sheet.code);
    try {
      const response = await getInstrument(sheet.id);
      console.log('instrument data', response);
      navigation.navigate('Samples', { sheet: response.data! });
    } catch (error) {
      console.error('Error fetching instrument:', error);
      // Aquí se podría mostrar un toast o alerta
    } finally {
      setLoadingSheetId(null);
    }
  };

  return (
    <View>
      {instruments.map(item => (
        <SheetCard
          key={item.code}
          sheet={item}
          action={() => getSheet(item)}
          isLoading={loadingSheetId === item.code}
        />
      ))}

      {/* Mensaje cuando no hay fichas de monitoreo */}
      {instruments.length === 0 && !loading && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Sin fichas de monitoreo</Text>
          <Text style={styles.emptySubtitle}>
            No se encontraron instrumentos de monitoreo disponibles para tu perfil.
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

          {instruments.length > 0 && !loading && (
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
