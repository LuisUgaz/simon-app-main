import React, {useEffect} from 'react';
import { Text, StyleSheet, Animated} from 'react-native';
import {useAuthStore} from '../../store';
import {StorageAdapter} from '../../../config/adapters/storage-adapter';
import { OFFLINE_STATUS_CODE } from '@env';

export const OfflineStatusBar = () => {
  const isOffLine = useAuthStore(state => state.isOffLine);
  const setIsOffLine = useAuthStore(state => state.setIsOffLine);

  useEffect(() => {
    StorageAdapter.getItem(OFFLINE_STATUS_CODE).then(value => {
      StorageAdapter.setItem(OFFLINE_STATUS_CODE, value);
      setIsOffLine(Boolean(value));
    });
    // await StorageAdapter.setItem(OFFLINE_STATUS_CODE, resp.token);
    // // Suscribirse a los cambios en el estado de la red
    // const unsubscribe = NetInfo.addEventListener(state => {
    //   console.log('NETWORK', state.isConnected);
    //   setIsOffLine(!state.isConnected); // Si no está conectado, muestra la barra
    // });

    // return () => {
    //   // Limpia la suscripción cuando el componente se desmonta
    //   unsubscribe();
    // };
  }, []);

  if (!isOffLine) return null; // Si hay conexión, no renderiza la barra

  return (
    <Animated.View style={styles.container}>
      <Text style={styles.text}>Modo Sin Conexión Activado!</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0, // Posición inferior
    left: 0,
    right: 0,
    height: 25,
    backgroundColor: '#856404',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999, // Asegura que esté encima de otros componentes
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
