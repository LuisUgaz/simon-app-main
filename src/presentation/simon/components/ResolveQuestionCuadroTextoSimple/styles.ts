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
        marginBottom: 16,
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
    input: {
        backgroundColor: APP_COLORS.white,
        marginTop: 8,
        borderRadius: 6,
    },
    counter: {
        textAlign: 'right',
        fontSize: 12,
        color: APP_COLORS.darkGray,
        marginTop: 4,
        marginRight: 0,
    },
}); 