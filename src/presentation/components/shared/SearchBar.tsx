import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { globalColors } from '../../theme/theme';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ value, onChangeText, placeholder = 'Buscar...' }: Props) => {
  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        placeholder={placeholder}
        placeholderTextColor={globalColors.gray}
        textColor={globalColors.dark}
        value={value}
        onChangeText={onChangeText}
        left={<TextInput.Icon icon="search" color={globalColors.dark} size={20} />}
        right={
          value.length > 0 ? (
            <TextInput.Icon icon="close" color={globalColors.dark} onPress={() => onChangeText('')} />
          ) : null
        }
        outlineStyle={styles.outline}
        style={styles.input}
        dense
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: globalColors.background,
  },
  input: {
    backgroundColor: '#fff',
  },
  outline: {
    borderRadius: 8,
    borderColor: '#ccc',
  },
});
