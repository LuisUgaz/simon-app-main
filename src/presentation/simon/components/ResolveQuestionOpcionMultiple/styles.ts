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
  descriptionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: APP_COLORS.background,
    borderRadius: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: APP_COLORS.lightGray,
  },
  descriptionsText: {
    marginLeft: 8,
    color: APP_COLORS.primary,
    fontWeight: '600',
    fontSize: 13,
  },

  // Mantenemos estos estilos para los radio buttons dentro del dropdown
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: APP_COLORS.background,
    borderRadius: 6,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: APP_COLORS.lightGray,
    backgroundColor: APP_COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioCircleSelected: {
    borderColor: APP_COLORS.primary,
    backgroundColor: APP_COLORS.white,
  },
  radioCircleDisabled: {
    borderColor: APP_COLORS.darkGray,
    backgroundColor: APP_COLORS.background,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: APP_COLORS.primary,
  },
  radioText: {
    flex: 1,
    fontSize: 14,
    color: APP_COLORS.secondary,
    lineHeight: 18,
  },
  radioTextDisabled: {
    color: APP_COLORS.darkGray,
  },
  otherContainer: {
    marginTop: 12,
    padding: 0,
    // backgroundColor: APP_COLORS.background,
    // borderRadius: 6,
    // borderLeftWidth: 1,
    // borderLeftColor: APP_COLORS.accent,
  },
  otherInput: {
    backgroundColor: APP_COLORS.white,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: APP_COLORS.lightGray,
  },

  // Dropdown personalizado
  dropdownContainer: {
    marginTop: 8,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: APP_COLORS.white,
    borderWidth: 1,
    borderColor: APP_COLORS.lightGray,
    borderRadius: 8,
    shadowColor: APP_COLORS.secondary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  dropdownHeaderExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomColor: APP_COLORS.primary,
    borderColor: APP_COLORS.primary,
  },
  dropdownHeaderDisabled: {
    backgroundColor: APP_COLORS.background,
    borderColor: APP_COLORS.lightGray,
  },
  dropdownHeaderText: {
    fontSize: 16,
    color: APP_COLORS.secondary,
    flex: 1,
  },
  dropdownPlaceholder: {
    color: APP_COLORS.darkGray,
    fontStyle: 'italic',
  },
  dropdownHeaderTextDisabled: {
    color: APP_COLORS.darkGray,
  },
  dropdownOptions: {
    backgroundColor: APP_COLORS.white,
    borderWidth: 1,
    borderColor: APP_COLORS.primary,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    shadowColor: APP_COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    maxHeight: 250,
  },
  dropdownOption: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: APP_COLORS.background,
  },
  dropdownOptionLast: {
    borderBottomWidth: 0,
  },
}); 