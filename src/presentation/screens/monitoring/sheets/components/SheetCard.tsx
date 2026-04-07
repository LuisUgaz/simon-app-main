import React from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { MonitoringInstrument } from '../../../../../core/entities';
import { ENUMS } from '../../../../../core/constants';

interface Props {
  sheet: MonitoringInstrument;
  action: () => void;
  isLoading?: boolean;
}

export const SheetCard = ({ sheet, action, isLoading }: Props) => {
  const { code, name, typeEnum, sampleDescription, monitorsEnums } = sheet;
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

  const getRecordTypeDetails = () => {
    switch (typeEnum) {
      case ENUMS.configuracion.tipoInstrumento.children.fichaObservacion:
        return { color: '#2E7D32', icon: 'eye-outline', label: 'Observación' };
      case ENUMS.configuracion.tipoInstrumento.children.encuesta:
        return { color: '#E65100', icon: 'clipboard-outline', label: 'Encuesta' };
      default:
        return { color: '#1565C0', icon: 'document-text-outline', label: 'Documento' };
    }
  };

  const getMonitors = () => {
    return monitorsEnums
      .map(x => ENUMS.configuracion.tipoActor.descriptions?.[x])
      .join(', ');
  };

  const { color, icon, label } = getRecordTypeDetails();

  return (
    <Pressable
      style={styles.container}
      onPress={action}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isLoading}
    >
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ scale: animatedValue }],
          }
        ]}
      >
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color="#bf0909" />
          </View>
        )}
        {/* Header con tipo de instrumento */}
        <View style={[styles.header, { backgroundColor: color }]}>
          <View style={styles.typeContainer}>
            <Icon name={icon} size={20} color="#fff" />
            <Text style={styles.typeText}>{label}</Text>
          </View>
          <View style={styles.codeBadge}>
            <Text style={styles.codeBadgeText}>{code}</Text>
          </View>
        </View>

        {/* Contenido principal */}
        <View style={styles.content}>
          <Text style={styles.nameText} numberOfLines={3} ellipsizeMode="tail">
            {name}
          </Text>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Icon name="flask-outline" size={16} color="#666" />
              <Text style={styles.infoLabel}>Tipo de muestra:</Text>
              <Text style={styles.infoValue}>{sampleDescription}</Text>
            </View>

            {getMonitors() && (
              <View style={styles.infoRow}>
                <Icon name="people-outline" size={16} color="#666" />
                <Text style={styles.infoLabel}>Monitores:</Text>
                <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="tail">
                  {getMonitors()}
                </Text>
              </View>
            )}
          </View>
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
  codeBadge: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  codeBadgeText: {
    color: '#333',
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    lineHeight: 22,
  },
  infoSection: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
