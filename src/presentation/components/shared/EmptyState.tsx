import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { globalColors } from '../../theme/theme';

interface Props {
  message?: string;
  icon?: string;
}

export const EmptyState = ({ 
  message = 'No se encontraron resultados', 
  icon = 'search-outline' 
}: Props) => {
  return (
    <View style={styles.container}>
      <Icon name={icon} size={64} color={globalColors.gray} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  text: {
    fontSize: 16,
    color: globalColors.gray,
    textAlign: 'center',
    marginTop: 16,
  },
});
