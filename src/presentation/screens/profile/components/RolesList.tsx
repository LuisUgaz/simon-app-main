import React, {useState} from 'react';
import {View} from 'react-native';
import {OptionCard} from './OptionCard';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {RootStackParams} from '../../../routes/StackNavigator';
import {useAuthStore} from '../../../store';

export const RolesList = () => {
  const navigation = useNavigation<NavigationProp<RootStackParams>>();
  const roles = useAuthStore(state => state.roles);

  return (
    <View>
      {roles.map(item => (
        <OptionCard
          key={item.id}
          title={item.name}
          icon={'chevron-forward'}
          action={() => navigation.navigate('Sites', {code: item.code})}
        />
      ))}
    </View>
  );
};
