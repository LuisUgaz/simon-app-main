import React from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { MonitoringPlan } from '../../../../../core/entities';
import { ENUMS } from '../../../../../core/constants';

interface Props {
  plan: MonitoringPlan;
  action: () => void;
  isLoading?: boolean;
}

export const PlanCard = ({ plan, action, isLoading }: Props) => {
  const { code, name } = plan;
  const animatedValue = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(animatedValue, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getPlanTypeColor = () => {
    return plan.enuType ===
      ENUMS.configuracion.tipoPlanMonitoreo.children.nacional
      ? '#2E7D32'
      : '#1565C0';
  };

  const getPlanTypeIcon = () => {
    return plan.enuType ===
      ENUMS.configuracion.tipoPlanMonitoreo.children.nacional
      ? 'flag'
      : 'location';
  };

  const getDisplayType = () => {
    if (plan.site?.name) {
      return plan.site.name;
    }
    return (
      ENUMS.configuracion.tipoPlanMonitoreo.descriptions?.[plan.enuType] || ''
    );
  };

  return (
    <Pressable
      style={styles.container}
      onPress={action}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isLoading}>
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ scale: animatedValue }],
          },
        ]}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color="#bf0909" />
          </View>
        )}
        {/* Header con tipo de plan */}
        <View style={[styles.header, { backgroundColor: getPlanTypeColor() }]}>
          <View style={styles.typeContainer}>
            <Icon name={getPlanTypeIcon()} size={20} color="#fff" />
            <Text style={styles.typeText}>{getDisplayType()}</Text>
          </View>
          <View style={styles.yearContainer}>
            <Text style={styles.yearText}>{plan.period ?? '----'}</Text>
          </View>
        </View>

        {/* Contenido principal */}
        <View style={styles.content}>
          <View style={styles.codeContainer}>
            <Icon name="barcode-outline" size={16} color="#494949" />
            <Text style={styles.codeText}>{code}</Text>
          </View>

          <Text style={styles.nameText} numberOfLines={3} ellipsizeMode="tail">
            {name ?? ''}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  card: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  yearContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  yearText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
    gap: 8,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  codeText: {
    fontSize: 15,
    color: '#494949',
    fontWeight: '600',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    lineHeight: 22,
  },
  footer: {
    marginTop: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
