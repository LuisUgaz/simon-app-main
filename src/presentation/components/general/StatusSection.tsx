import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { View } from 'react-native';
import { NoExecutionCard } from './NoExecutionCard';
import { ScrollCardStatus } from './ScrollCardStatus';
import { useMonitoringStore } from '../../store/monitoring.store';
import { useAuthStore } from '../../store';

export interface StatusSectionRef {
  refresh: () => void;
}

export const StatusSection = forwardRef<StatusSectionRef>((props, ref) => {
  const user = useAuthStore(status => status.user);
  const [hasData, setHasData] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { getAllOfflineMonitoringData } = useMonitoringStore();

  const checkForOfflineData = useCallback(async () => {
    // Si no hay usuario o documento, no intentamos consultar la base de datos para evitar "bind value at index 1 is null"
    /* 
       ANTES:
       const result = await getAllOfflineMonitoringData(user?.documentNumber || '');
       DESPUÉS:
       Se valida user?.documentNumber antes de llamar a la base de datos para prevenir parámetros nulos.
    */
    if (!user?.documentNumber) {
      console.log('ℹ️ StatusSection: No hay documento de usuario aún, omitiendo consulta SQLite');
      setHasData(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await getAllOfflineMonitoringData(user.documentNumber);

      if (result.success && result.data && result.data.length > 0) {
        setHasData(true);
      } else {
        setHasData(false);
      }
    } catch (error) {
      console.error('Error verificando datos offline:', error);
      setHasData(false);
    } finally {
      setLoading(false);
    }
  }, [getAllOfflineMonitoringData, user?.documentNumber]);

  // Exponer la función de refresh al componente padre
  useImperativeHandle(ref, () => ({
    refresh: checkForOfflineData,
  }), [checkForOfflineData]);

  useEffect(() => {
    // Solo se dispara si el documento del usuario está presente
    /* 
       ANTES:
       checkForOfflineData();
       DESPUÉS:
       Se condiciona la ejecución a que exista user.documentNumber para evitar error bind null.
    */
    if (user?.documentNumber) {
      checkForOfflineData();
    } else {
      setLoading(false);
    }
  }, [user?.documentNumber, checkForOfflineData]);

  if (loading) {
    return <View />; // O un componente de loading
  }

  return (
    <View>
      {!hasData && <NoExecutionCard />}
      {hasData && <ScrollCardStatus />}
    </View>
  );
});

StatusSection.displayName = 'StatusSection';
