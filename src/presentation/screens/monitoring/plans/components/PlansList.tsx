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
import { PlanCard } from './PlanCard';
import { MonitoringPlan } from '../../../../../core/entities';
import { globalColors } from '../../../../theme/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface Props {
  plans: MonitoringPlan[];
  loading: boolean;
  showMore: boolean;
  loadHandler: () => void;
  onReload?: () => void;
}

export const PlanList = ({
  plans,
  showMore,
  loadHandler,
  loading = true,
  onReload,
}: Props) => {
  const navigation = useNavigation<NavigationProp<RootStackParams>>();
  const [loadingPlanId, setLoadingPlanId] = React.useState<string | null>(null);

  const handlePlanPress = (item: MonitoringPlan) => {
    if (loadingPlanId) return;
    setLoadingPlanId(item.code);
    // Usar setTimeout para permitir que el spinner se renderice antes de la navegación
    setTimeout(() => {
      navigation.navigate('Sheets', { plan: item });
      setLoadingPlanId(null);
    }, 50);
  };

  return (
    <View>
      {plans.map(item => (
        <PlanCard
          key={item.code}
          plan={item}
          action={() => handlePlanPress(item)}
          isLoading={loadingPlanId === item.code}
        />
      ))}

      {/* Mensaje cuando no hay planes de monitoreo */}
      {plans.length === 0 && !loading && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Sin planes de monitoreo disponibles</Text>
          <Text style={styles.emptySubtitle}>
            No se encontraron planes de monitoreo para mostrar.
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

          {plans.length > 0 && !loading && (
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
