import { StyleSheet } from 'react-native';

// Paleta de colores de la aplicación
const APP_COLORS = {
  primary: '#bf0909',    // Rojo principal
  secondary: '#494949',  // Gris oscuro
  accent: '#75a25d',     // Verde acento
  background: '#f5f5f5', // Gris claro de fondo
  white: '#ffffff',
  lightGray: '#e0e0e0',
  darkGray: '#6c757d',
  info: '#17a2b8',
  warning: '#ffc107',
};

export const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  instructions: {
    color: APP_COLORS.darkGray,
    marginBottom: 8,
    fontSize: 13,
    fontStyle: 'italic',
    backgroundColor: APP_COLORS.background,
    padding: 8,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: APP_COLORS.info,
  },
  starsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Permite que las estrellas hagan wrap a la siguiente línea
    marginVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: APP_COLORS.white,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: APP_COLORS.lightGray,
    gap: 12, // Espaciado uniforme entre estrellas y filas
    minHeight: 60, // Altura mínima para mantener consistencia visual
  },
  star: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: APP_COLORS.background,
    // marginRight removido porque ahora usamos gap en el contenedor padre
  },
  starIcon: {
    textAlign: 'center',
  },
  starShape: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: APP_COLORS.lightGray,
    position: 'relative',
  },
  starFilled: {
    borderBottomColor: APP_COLORS.warning,
  },
  starEmpty: {
    borderBottomColor: APP_COLORS.lightGray,
  },
  ratingText: {
    marginTop: 8,
    fontSize: 14,
    color: APP_COLORS.secondary,
    textAlign: 'center',
    fontWeight: '600',
  },
}); 