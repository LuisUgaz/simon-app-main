import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { globalColors, globalStyles } from '../../../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RoundButton } from '../../../components';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { RootStackParams } from '../../../routes/StackNavigator';
import { SheetsList } from './components/SheetsList';
import { PlanInfoModal } from './components/PlanInfoModal';
import { MonitoringInstrument, MonitoringPlan } from '../../../../core/entities';
import { StatusPageResponse } from '../../../../infraestructure';
import { useMonitoringStore } from '../../../store';
import Ionicons from 'react-native-vector-icons/Ionicons';

export const SheetsScreen = () => {
  const { top } = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParams>>();
  const params = useRoute<RouteProp<RootStackParams, 'Sheets'>>().params;
  const currentPlan = useMonitoringStore(state => state.currentMonitoringPlan);
  const { getInstruments, setCurrentPlan, clearInstrument } = useMonitoringStore(
    state => state,
  );

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  // instruments grid states
  const [instruments, setInstruments] = useState<MonitoringInstrument[]>([]);
  const [lastKeyForPaginate, setLastKeyForPaginate] = useState<string>('');
  const [pageSize] = useState<number>(10);
  const [flagShowMore, setFlagShowMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [_withError, setWithError] = useState<boolean>(false);

  useEffect(() => {
    setCurrentPlan(params.plan);
    if (params.plan) searchHandler(params.plan);

    return () => {
      clearInstrument();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchHandler = useCallback((plan: MonitoringPlan) => {
    if (isLoading) {
      return false;
    }

    setWithError(false);
    setIsLoading(true);
    getInstruments(
      { page: 1, pageSize: pageSize } as any,
      '', //pageSise
      lastKeyForPaginate,
      plan.id,
    )
      .then((value: StatusPageResponse<MonitoringInstrument[]>) => {
        setIsLoading(false);
        if (!value.status.success) {
          setWithError(true);
          setInstruments([]);
        } else {
          if (value['data'].length > 0) {
            setLastKeyForPaginate(value['data'][value['data'].length - 1].key);
          } else {
            setFlagShowMore(false);
          }
          setInstruments(instruments.concat(value['data']));
        }
      })
      .catch(_value => {
        setIsLoading(false);
        setWithError(true);
      });
  }, [isLoading, pageSize, lastKeyForPaginate, instruments, getInstruments, setWithError, setIsLoading, setLastKeyForPaginate, setFlagShowMore, setInstruments]);

  const handleInfoPress = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <View style={{ ...styles.header, paddingTop: top }}>
        <View style={styles.buttons}>
          <RoundButton
            icon="arrow-back"
            light
            action={() => navigation.goBack()}
          />
          <View style={styles.rightSection}>
            <View style={styles.label}>
              <Text style={styles.labelText}>Plan: {currentPlan?.code}</Text>
            </View>
            <Pressable style={styles.infoButton} onPress={handleInfoPress}>
              <Ionicons name="information-circle-outline" size={24} color="#494949" />
            </Pressable>
          </View>
        </View>
        <View style={styles.titles}>
          <Text style={styles.title}>Fichas de monitoreo</Text>
        </View>
      </View>
      <ScrollView style={globalStyles.container}>
        <SheetsList
          instruments={instruments}
          loading={isLoading}
          showMore={flagShowMore}
          loadHandler={() => searchHandler(currentPlan!)}
          onReload={() => searchHandler(currentPlan!)}
        />
      </ScrollView>

      <PlanInfoModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        plan={currentPlan || null}
      />
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
  buttons: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  label: {
    backgroundColor: '#4d4d4d',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  labelText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  infoButton: {
    padding: 4,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
