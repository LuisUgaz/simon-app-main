import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, StyleSheet, Dimensions, Pressable, Animated } from 'react-native';
import { CardStatus } from './CardStatus';
import { useMonitoringStore } from '../../store/monitoring.store';
import { useHandleCardPress } from '../../hooks';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { RootStackParams } from '../../routes/StackNavigator';
import { NavigationProp } from '@react-navigation/native';
import { useAuthStore } from '../../store/auth.store';
// Obtén el ancho de la pantalla
const screenWidth = Dimensions.get('window').width;

export const ScrollCardStatus = () => {
  const user = useAuthStore(status => status.user);
  // Definir el estado para el índice activo
  const [activeIndex, setActiveIndex] = useState(0);
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { getAllOfflineMonitoringData } = useMonitoringStore();
  const { handleCardPress } = useHandleCardPress();
  const navigation = useNavigation<NavigationProp<RootStackParams>>();

  // Animación para el botón
  const animatedValue = React.useRef(new Animated.Value(1)).current;

  const loadVisits = useCallback(async () => {
    // Si no hay usuario o documento, no intentamos consultar la base de datos
    /* 
       ANTES:
       const result = await getAllOfflineMonitoringData(user?.documentNumber || '');
       DESPUÉS:
       Se valida user?.documentNumber antes de llamar a la base de datos para prevenir parámetros nulos.
    */
    if (!user?.documentNumber) {
      console.log('ℹ️ ScrollCardStatus: No hay documento de usuario aún, omitiendo carga');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await getAllOfflineMonitoringData(user.documentNumber);
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

        // Limitar a máximo 5 visitas para el scroll
        setVisits(visitsData.slice(0, 5));
      }
    } catch (error) {
      console.error('Error cargando visitas:', error);
    } finally {
      setLoading(false);
    }
  }, [getAllOfflineMonitoringData, user?.documentNumber]);

  useEffect(() => {
    /* 
       ANTES:
       loadVisits();
       DESPUÉS:
       Se condiciona la ejecución a que exista user.documentNumber para evitar error bind null.
    */
    if (user?.documentNumber) {
      loadVisits();
    } else {
      setLoading(false);
    }
  }, [user?.documentNumber, loadVisits]);

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.floor(contentOffsetX / (screenWidth * 0.95));
    setActiveIndex(currentIndex);
  };

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


  const handleVerMas = () => {
    navigation.navigate('VisitsList');
  };

  const handlePressIn = () => {
    Animated.spring(animatedValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  if (loading) {
    return <View style={styles.container} />;
  }

  if (visits.length === 0) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      {/* ScrollView Horizontal */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16} // Mejor rendimiento de scroll
        pagingEnabled>
        {visits.map((visit, index) => (
          <CardStatus
            key={visit.id || index}
            compact={true}
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
              siteInfo: visit.sampleData?.site?.code && visit.sampleData?.site?.name
                ? `${visit.sampleData.site.code}-${visit.sampleData.site.name}`
                : undefined,
            }}
          />
        ))}
      </ScrollView>

      {/* Indicadores de puntos */}
      <View style={styles.dotsContainer}>
        {/* Botón Ver más - Al lado izquierdo */}
        <Pressable
          onPress={handleVerMas}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Animated.View
            style={[
              styles.verMasButton,
              {
                transform: [{ scale: animatedValue }],
              },
            ]}
          >
            <Ionicons name="list" size={20} color="#bf0a09" />
          </Animated.View>
        </Pressable>

        {/* Dots */}
        {visits.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { opacity: index === activeIndex ? 1 : 0.3 },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    gap: 15,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#a8a7a7',
    marginHorizontal: 5,
  },
  verMasButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
});
