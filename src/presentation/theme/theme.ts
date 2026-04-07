import { StyleSheet } from 'react-native';

export const globalColors = {
  primary: '#d8d5d5',
  secondary: '#4D4D4D',
  tertiary: '#3a0ca3',
  success: '#4cc9f0',
  warning: '#fca311',
  danger: '#d32f2f',
  dark: '#22223b',
  white: '#fff',
  gray: '#4D4D4D',
  shadowWhite: '#d8d5d5',
  green: '#00880bff',

  background: '#fff',
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: globalColors.background,
  },

  header: {
    padding: 20,
    backgroundColor: globalColors.background,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  primaryButton: {
    backgroundColor: globalColors.primary,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },

  buttonText: {
    color: globalColors.background,
    fontSize: 18,
  },
});
