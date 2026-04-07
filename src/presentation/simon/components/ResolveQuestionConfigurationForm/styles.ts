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
  error: '#dc3545',
  success: '#75a25d',
};

export const styles = StyleSheet.create({
  container: {
    padding: 4,
    marginBottom: 4,
    backgroundColor: APP_COLORS.white,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: APP_COLORS.lightGray,
  },
  disabledContainer: {
    backgroundColor: APP_COLORS.background,
    borderLeftColor: APP_COLORS.darkGray,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 12,
    color: APP_COLORS.secondary,
    lineHeight: 22,
  },
  disabledText: {
    color: APP_COLORS.darkGray,
  },
  errorText: {
    color: APP_COLORS.error,
  },
  // Nuevo estilo para preguntas activas/válidas
  validContainer: {
    borderLeftColor: APP_COLORS.accent,
  },
  // Nuevo estilo para preguntas con errores
  errorContainer: {
    borderLeftColor: APP_COLORS.error,
  },
}); 