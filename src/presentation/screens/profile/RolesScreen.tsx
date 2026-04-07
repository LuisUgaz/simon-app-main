import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {globalColors, globalStyles} from '../../theme/theme';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {RoundButton} from '../../components';
import {RootStackParams} from '../../routes/StackNavigator';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {RolesList} from './components/RolesList';

export const RolesScreen = () => {
  const {top} = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParams>>();

  return (
    <>
      <View style={{...styles.header, paddingTop: top}}>
        <RoundButton
          icon="arrow-back"
          light
          action={() => navigation.goBack()}
        />
        <View style={styles.titles}>
          <Text style={styles.title}>¡Elija el rol!</Text>
        </View>
      </View>
      <ScrollView style={globalStyles.container}>
        <RolesList />
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    backgroundColor: globalColors.background,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
  },
  titles: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    color: globalColors.dark,
    fontSize: 22,
    fontWeight: 'bold',
  },
});
