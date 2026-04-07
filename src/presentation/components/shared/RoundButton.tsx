import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {globalColors} from '../../theme/theme';

interface Props {
  icon: string;
  action: () => void;
  light?: boolean;
  color?: string;
  green?: boolean;
}

export const RoundButton = ({icon, action, light, color, green}: Props) => {
  return (
    <Pressable
      onPress={action}
      style={({pressed}) => [
        !light ? styles.button : styles.buttonDefault,
        pressed && styles.buttonPressed,
        green && styles.buttonGreen,
      ]}>
      <Icon name={icon} size={18} color={color || globalColors.dark} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 'auto',
    backgroundColor: globalColors.white,
    padding: 7,
    borderRadius: '50%',
    shadowColor: '#4d4d4d',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    // Sombra para Android
    elevation: 8,
  },
  buttonDefault: {
    backgroundColor: globalColors.shadowWhite,
    padding: 7,
    borderRadius: '50%',
  },
  buttonPressed: {
    backgroundColor: globalColors.shadowWhite,
  },
  buttonGreen: {
    backgroundColor: globalColors.green,
  },
});
