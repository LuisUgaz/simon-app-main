import React, {useState} from 'react';
import {View, Text, StyleSheet, Switch, Animated, Pressable} from 'react-native';
import {OptionCard} from './OptionCard';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {RootStackParams} from '../../../routes/StackNavigator';
import {useAuthStore} from '../../../store';
import {StorageAdapter} from '../../../../config/adapters/storage-adapter';
import Icon from 'react-native-vector-icons/Ionicons';
import { OFFLINE_STATUS_CODE } from '@env';
import {globalColors} from '../../../theme/theme';

export const OptionsList = () => {
  const isOffLine = useAuthStore(state => state.isOffLine);
  const setIsOffLine = useAuthStore(state => state.setIsOffLine);
  const navigation = useNavigation<NavigationProp<RootStackParams>>();
  const animatedValue = React.useRef(new Animated.Value(1)).current;

  const [options] = useState<any>([
    {
      id: 1,
      title: 'Cambiar rol o Sede',
      iconLeft: 'school-outline',
      icon: 'chevron-forward',
      onLine: false,
      action: () => navigation.navigate('Roles'),
      color: '#bf0a09',
    },
  ]);

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

  const toggleOfflineMode = () => {
    const mode = !isOffLine;
    if (mode) {
      StorageAdapter.setItem(OFFLINE_STATUS_CODE, mode);
    } else {
      StorageAdapter.removeItem(OFFLINE_STATUS_CODE);
    }

    setIsOffLine(!isOffLine);
  };

  const iconBackgroundColor = isOffLine ? '#494949' : '#bf0a09';

  return (
    <View style={styles.container}>
      {/* Renderizar las opciones existentes */}
      {options.map((item: any) => (
        <OptionCard
          key={item.id}
          title={item.title}
          icon={item.icon}
          iconLeft={item.iconLeft}
          action={item.action}
          show={(isOffLine && !item.onLine) || !isOffLine}
          color={item.color}
        />
      ))}

      {/* Toggle para modo offline con nuevo diseño */}
      <View style={styles.offlineToggleContainer}>
        <Pressable
          onPress={toggleOfflineMode}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Animated.View
            style={[
              styles.offlineCard,
              {
                transform: [{scale: animatedValue}],
              },
            ]}
          >
            <View style={styles.offlineLeftSection}>
              <View style={[styles.offlineIconContainer, {backgroundColor: iconBackgroundColor}]}>
                <Icon
                  name={isOffLine ? 'cloud-offline-outline' : 'cloud-outline'}
                  size={20}
                  color={globalColors.white}
                />
              </View>
              <View style={styles.offlineTextContainer}>
                <Text style={styles.offlineTitle}>Modo Sin Conexión</Text>
                <Text style={styles.offlineSubtitle}>
                  {isOffLine ? 'Activado' : 'Desactivado'}
                </Text>
              </View>
            </View>
            <Switch
              value={isOffLine}
              onValueChange={toggleOfflineMode}
              trackColor={{false: '#e0e0e0', true: '#bf0a09'}}
              thumbColor={isOffLine ? globalColors.white : '#f4f4f4'}
              ios_backgroundColor="#e0e0e0"
            />
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 8,
  },
  offlineToggleContainer: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  offlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  offlineLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  offlineIconContainer: {
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
  offlineTextContainer: {
    flex: 1,
  },
  offlineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#494949',
    marginBottom: 2,
  },
  offlineSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
});
