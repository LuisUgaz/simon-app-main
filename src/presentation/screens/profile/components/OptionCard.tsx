import React, {useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {globalColors} from '../../../theme/theme';

interface Props {
  title: string;
  subTitle?: string;
  icon?: string;
  iconLeft?: string;
  show?: boolean;
  loadingAfterAction?: boolean;
  action?: () => void;
  color?: string;
}

export const OptionCard = ({
  title,
  subTitle,
  icon,
  iconLeft,
  show = true,
  action,
  loadingAfterAction = false,
  color = '#bf0a09',
}: Props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const animatedValue = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(animatedValue, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const clickAction = () => {
    if (loadingAfterAction) setLoading(true);
    if (action) action();
  };

  if (!show) return null;

  return (
    <Pressable
      style={styles.container}
      onPress={clickAction}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!show}>
      <Animated.View 
        style={[
          styles.card,
          {
            transform: [{scale: animatedValue}],
          }
        ]}
      >
        {/* Icono izquierdo */}
        {iconLeft && (
          <View style={[styles.iconContainer, {backgroundColor: color}]}>
            <Icon name={iconLeft} size={20} color={globalColors.white} />
          </View>
        )}

        {/* Contenido principal */}
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          {subTitle && <Text style={styles.subtitle}>{subTitle}</Text>}
        </View>

        {/* Icono derecho o loading */}
        <View style={styles.rightSection}>
          {loading ? (
            <ActivityIndicator size="small" color={color} />
          ) : (
            icon && (
              <View style={styles.arrowContainer}>
                <Icon name={icon} size={18} color="#494949" />
              </View>
            )
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: globalColors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    minHeight: 72,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#494949',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  rightSection: {
    marginLeft: 12,
  },
  arrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
