import React from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ENUMS, BUSINESS_RULES } from '../../../core/constants';

interface Props {
  sheet: {
    startDate: string;
    endDate: string;
    expectedDate: string;
    expectedTime: string;
    visitNumber: string;
    status: string;
    monitorName?: string;
    sampleName?: string;
    footer: string;
    planCode?: string;
    instrumentCode?: string;
    siteInfo?: string;
    totalAspects?: number;
    completedAspects?: number;
  };
  compact?: boolean;
  onPress?: () => void;
}

export const CardStatus = ({ sheet, compact = false, onPress }: Props) => {
  const screenWidth = Dimensions.get('window').width;

  // Función para obtener el color del estado de la visita
  const getStatusColor = (status: string) => {
    const statusColor = BUSINESS_RULES.visitStatusColors.find(
      item => item.status === status
    );
    return statusColor?.color || '#6b7280'; // Color por defecto
  };

  return (
    <Pressable
      style={[
        styles.container,
        { width: screenWidth * 0.95 },
        compact && styles.containerCompact,
      ]}
      onPress={onPress}
    >
      {/* Header con información principal */}
      <View style={[styles.header, compact && styles.headerCompact]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.visitNumber, compact && styles.visitNumberCompact]}>
            Visita #{sheet.visitNumber}
          </Text>
          <Text style={[styles.sampleName, compact && styles.sampleNameCompact]} numberOfLines={1} ellipsizeMode="tail">
            {sheet.sampleName || 'Muestra no disponible'}
          </Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(sheet.status) + '20' },
          compact && styles.statusBadgeCompact,
        ]}>
          <Text style={[
            styles.statusText,
            { color: getStatusColor(sheet.status) },
            compact && styles.statusTextCompact,
          ]}>
            {ENUMS.configuracion.tipoEstadoVisita.descriptions?.[sheet.status]}
          </Text>
        </View>
      </View>

      {/* Información de fechas y horarios */}
      <View style={[styles.content, compact && styles.contentCompact]}>
        <View style={[styles.infoRow, compact && styles.infoRowCompact]}>
          <Ionicons name="calendar-outline" size={compact ? 16 : 20} color="#4b5563" />
          <Text style={[styles.infoText, compact && styles.infoTextCompact]}>
            Fecha: {sheet.expectedDate}
          </Text>
        </View>

        <View style={[styles.infoRow, compact && styles.infoRowCompact]}>
          <Ionicons name="time-outline" size={compact ? 16 : 20} color="#4b5563" />
          <Text style={[styles.infoText, compact && styles.infoTextCompact]}>
            Hora: {sheet.expectedTime}
          </Text>
        </View>

        {!compact && (
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color="#4b5563" />
            <Text style={styles.infoText}>
              Período: {sheet.startDate} - {sheet.endDate}
            </Text>
          </View>
        )}

        {/* Información de plan e instrumento compacta */}
        {(sheet.planCode || sheet.instrumentCode) && !compact && (
          <View style={styles.compactInfo}>
            <View style={styles.compactRow}>
              <View style={styles.compactLeftContainer}>
                {sheet.planCode && (
                  <View style={styles.compactItem}>
                    <Text style={styles.compactLabel}>Plan:</Text>
                    <Text style={styles.compactValue}>{sheet.planCode}</Text>
                  </View>
                )}
                {sheet.instrumentCode && (
                  <View style={styles.compactItem}>
                    <Text style={styles.compactLabel}>Instr.:</Text>
                    <Text style={styles.compactValue}>{sheet.instrumentCode}</Text>
                  </View>
                )}
              </View>
              {(sheet.totalAspects !== undefined && sheet.completedAspects !== undefined) && (
                <View style={styles.compactRightItem}>
                  <Text style={styles.compactLabel}>Asp:</Text>
                  <Text style={[
                    styles.compactValue,
                    sheet.totalAspects === sheet.completedAspects
                      ? styles.completedAspect
                      : styles.pendingAspect,
                  ]}>
                    {sheet.completedAspects}/{sheet.totalAspects}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>

      {/* Footer con información de sede */}
      <View style={[
        styles.footer,
        { backgroundColor: getStatusColor(sheet.status) + '10' },
        compact && styles.footerCompact,
      ]}>
        <View style={styles.footerContent}>
          <Ionicons name="location-outline" size={compact ? 14 : 18} color="#4b5563" />
          <Text style={[compact && styles.footerTextCompact]} numberOfLines={1} ellipsizeMode="tail">
            {sheet.siteInfo || sheet.footer}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    marginHorizontal: 12,
    marginBottom: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 18,
    paddingBottom: 16,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  visitNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  sampleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 24,
    overflow: 'hidden',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    minHeight: 32,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 24,
  },
  infoText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
    lineHeight: 22,
  },
  compactInfo: {
    marginTop: 8,
  },
  compactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  compactLeftContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  compactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactRightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#e5e7eb',
  },
  compactLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  compactValue: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerTextCompact: {
    fontSize: 10,
    color: '#6b7280',
  },
  completedAspect: {
    color: '#00a56eff', // green-500
    fontSize: 15,
    fontWeight: '800',
  },
  pendingAspect: {
    color: '#f59e0b', // amber-500
    fontSize: 15,
    fontWeight: '800',
  },
  // Estilos compactos
  containerCompact: {
    marginHorizontal: 8,
    marginBottom: 12,
  },
  headerCompact: {
    padding: 14,
    paddingBottom: 10,
  },
  visitNumberCompact: {
    fontSize: 12,
    marginBottom: 4,
  },
  sampleNameCompact: {
    fontSize: 14,
    lineHeight: 20,
  },
  statusBadgeCompact: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    minHeight: 28,
  },
  statusTextCompact: {
    fontSize: 11,
  },
  contentCompact: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    gap: 8,
  },
  infoRowCompact: {
    gap: 8,
    minHeight: 20,
  },
  infoTextCompact: {
    fontSize: 13,
    lineHeight: 18,
  },
  footerCompact: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
});
