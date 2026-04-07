import React, { useState } from 'react';
import { View } from 'react-native';
import { OptionCard } from './OptionCard';
import {
  NavigationProp,
  RouteProp,
  StackActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { RootStackParams } from '../../../routes/StackNavigator';
import { useAuthStore } from '../../../store';
import { Site } from '../../../../core/entities';

export const SitesList = () => {
  const navigation = useNavigation<NavigationProp<RootStackParams>>();
  const params = useRoute<RouteProp<RootStackParams, 'Sites'>>().params;
  const sites = useAuthStore(state => state.sites);
  const setCurrentSite = useAuthStore(state => state.setCurrentSite);

  const actionHandler = async (site: Site) => {
    setCurrentSite(site).then(res => {
      navigation.dispatch(StackActions.popToTop());
    });
  };

  const sitesFiltered = () => {
    return sites.filter(x => x.roleCode === params.code);
  };

  return (
    <View>
      {sitesFiltered().map(item => (
        <OptionCard
          key={item.code}
          title={item.name}
          subTitle={item.code}
          icon={'navigate'}
          action={() => actionHandler(item)}
          loadingAfterAction
        />
      ))}
    </View>
  );
};
