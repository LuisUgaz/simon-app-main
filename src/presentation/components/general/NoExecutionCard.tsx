import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Asegúrate de tener esta librería instalada

export const NoExecutionCard = () => {
  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={[styles.container, {width: screenWidth * 0.95}]}>
      <View style={styles.iconSection}>
        <Ionicons name="megaphone" size={40} color="#FFAA00" />
      </View>
      <View style={styles.textSection}>
        <Text style={styles.title}>Sin Fichas en Ejecución</Text>
        <Text style={styles.description}>
          Actualmente no hay fichas de monitoreo en ejecución. Te recomendamos
          mantenerte al día con tus programaciones y ejecuciones para evitar
          retrasos en el proceso.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 180,
    backgroundColor: '#f9f9f9', // Fondo en gris claro
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {width: 1, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4, // Sombra para dispositivos Android
    marginHorizontal: 10,
    marginBottom: 15,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  iconSection: {
    flex: 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0', // Fondo gris más oscuro para el ícono
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 10,
  },
  textSection: {
    flex: 0.7,
    justifyContent: 'center',
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4d4d4d', // Gris oscuro para el título
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#696868', // Gris más suave para la descripción
    lineHeight: 20,
  },
});
