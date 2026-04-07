import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, RefreshControl, Dimensions, FlatList } from 'react-native';
import { CardStatus } from '../../../../components/general/CardStatus';
import { useMonitoringStore } from '../../../../store/monitoring.store';
import { useHandleCardPress } from '../../../../hooks';
import { useAuthStore } from '../../../../store/auth.store';
import { globalColors } from '../../../../theme/theme';

// Componente separado para el separador
const ItemSeparator = () => <View style={styles.separator} />;

export const VisitsList = ({ reloadKey }: { reloadKey?: number }) => {
  const user = useAuthStore(status => status.user);
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const { getAllOfflineMonitoringData } = useMonitoringStore();
  const { handleCardPress } = useHandleCardPress();

  // Hook para detectar cambios de orientación
  useEffect(() => {
    const onChange = (result: any) => {
      setScreenData(result.window);
    };

    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);

  // Determinar si es tablet (ancho > 768px)
  const isTablet = screenData.width > 768;

  // Calcular número de columnas para tablet
  const getNumColumns = () => {
    if (screenData.width > 1024) {
      return 3; // iPad Pro landscape
    }
    if (screenData.width > 768) {
      return 2; // iPad portrait / tablet
    }
    return 1; // Phone
  };

  const numColumns = getNumColumns();

  const loadVisits = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getAllOfflineMonitoringData(user?.documentNumber || '');
      if (result.success && result.data) {
        // Extraer las visitas de los datos offline
        console.log('result', result.data);
        const visitsData: any[] = [];

        result.data.forEach(monitoringData => {
          try {
            const parsedData = JSON.parse(monitoringData.data);
            visitsData.push(parsedData);
          } catch (error) {
            console.error('Error parseando datos de visita:', error);
          }
        });

        setVisits(visitsData);
      }
    } catch (error) {
      console.error('Error cargando visitas:', error);
    } finally {
      setLoading(false);
    }
  }, [getAllOfflineMonitoringData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadVisits();
    setRefreshing(false);
  }, [loadVisits]);

  useEffect(() => {
    loadVisits();
  }, [loadVisits, reloadKey]);

  const formatDate = (date: Date | string) => {
    if (!date) {
      return 'N/A';
    }
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) {
      return 'N/A';
    }

    const format12Hour = (time: string) => {
      try {
        const [hoursStr, minutesStr] = time.split(':');
        /* istanbul ignore next */
        if (!hoursStr || !minutesStr) return time;

        const hour = parseInt(hoursStr, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutesStr} ${ampm}`;
      } catch (e) {
        return time;
      }
    };

    return `${format12Hour(startTime)} - ${format12Hour(endTime)}`;
  };


  // Función para renderizar cada item de la lista
  const renderVisitItem = useCallback(({ item: visit, index }: { item: any; index: number }) => (
    <View style={[
      styles.cardContainer,
      isTablet && styles.cardContainerTablet,
    ]}>
      <CardStatus
        key={visit.id || index}
        onPress={() => handleCardPress(visit)}
        sheet={{
          startDate: formatDate(visit.visitAnswerData.scheduledDate),
          endDate: formatDate(visit.visitAnswerData.executionEndDate || visit.visitAnswerData.scheduledDate),
          expectedDate: formatDate(visit.visitAnswerData.scheduledDate),
          expectedTime: formatTime(visit.visitAnswerData.startTime, visit.visitAnswerData.endTime),
          visitNumber: visit.visitAnswerData.visitNumber.toString(),
          status: visit.visitAnswerData.status,
          sampleName: visit.sampleData?.lastName
            ? `${visit.sampleData.firstName + ' ' + visit.sampleData.lastName}`.trim()
            : `${visit.sampleData.site?.code} - ${visit.sampleData.site?.name}`,
          footer: 'Monitoreo de Calidad Educativa',
          planCode: visit.monitoringPlanData?.code,
          instrumentCode: visit.monitoringInstrumentData?.code,
          totalAspects: visit.aspectsData?.aspects?.length || 0,
          completedAspects: visit.visitAnswerData?.completedAspects?.length || 0,
          siteInfo: visit.sampleData?.site?.code && visit.sampleData?.site?.name
            ? `${visit.sampleData.site.code}-${visit.sampleData.site.name}`
            : undefined,
        }}
      />
    </View>
  ), [isTablet, handleCardPress]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando visitas...</Text>
      </View>
    );
  }

  if (visits.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No hay visitas disponibles</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={visits}
      renderItem={renderVisitItem}
      keyExtractor={(item, index) => item.id?.toString() || index.toString()}
      numColumns={numColumns}
      key={numColumns} // Forzar re-render cuando cambie el número de columnas
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        isTablet && styles.scrollContentTablet,
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      columnWrapperStyle={isTablet ? styles.row : undefined}
      ItemSeparatorComponent={ItemSeparator}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 20,
    alignItems: 'center',
    paddingBottom: 20,
  },
  scrollContentTablet: {
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
  cardContainer: {
    width: '100%',
  },
  cardContainerTablet: {
    flex: 1,
    marginHorizontal: 8,
  },
  row: {
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  separator: {
    height: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
});
