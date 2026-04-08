import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { SearchBar, EmptyState } from '../../../components/shared';
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lastKeyForPaginate, setLastKeyForPaginate] = useState<string>('');
  const [pageSize] = useState<number>(10);
  const [flagShowMore, setFlagShowMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [withError, setWithError] = useState<boolean>(false);

  const searchHandler = useCallback((plan: MonitoringPlan, query: string = '', isNewSearch: boolean = false) => {
    if (isLoading && !isNewSearch) return false;

    const currentLastKey = isNewSearch ? '' : lastKeyForPaginate;

    setWithError(false);
    setIsLoading(true);

    if (isNewSearch) {
      setLastKeyForPaginate('');
      setFlagShowMore(true);
    }

    getInstruments(
      { page: 1, pageSize: pageSize } as any,
      query,
      currentLastKey,
      plan.id,
    )
      .then((value: StatusPageResponse<MonitoringInstrument[]>) => {
        setIsLoading(false);
        if (!value.status.success) {
          setWithError(true);
          if (isNewSearch) setInstruments([]);
        } else {
          const newData = value['data'] || [];
          if (newData.length > 0) {
            setLastKeyForPaginate(newData[newData.length - 1].key);
            setInstruments(prev => isNewSearch ? newData : [...prev, ...newData]);
          } else {
            setFlagShowMore(false);
            if (isNewSearch) setInstruments([]);
          }
        }
      })
      .catch(() => {
        setIsLoading(false);
        setWithError(true);
      });
  }, [isLoading, pageSize, lastKeyForPaginate, getInstruments]);

  useEffect(() => {
    setCurrentPlan(params.plan);
    return () => {
      clearInstrument();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (params.plan) {
        searchHandler(params.plan, searchQuery, true);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, params.plan]);

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
            <RoundButton
              icon="information-outline"
              light
              action={handleInfoPress}
            />
          </View>
        </View>
        <View style={styles.titles}>
          <Text style={styles.title}>Fichas de monitoreo</Text>
        </View>
      </View>
      <SearchBar 
        value={searchQuery} 
        onChangeText={setSearchQuery} 
        placeholder="Buscar ficha..." 
      />
      <ScrollView style={globalStyles.container}>
        {instruments.length === 0 && !isLoading && !withError ? (
          <EmptyState message="No se encontraron fichas de monitoreo" />
        ) : (
          <SheetsList
            instruments={instruments}
            loading={isLoading}
            showMore={flagShowMore}
            loadHandler={() => searchHandler(params.plan, searchQuery, false)}
            onReload={() => searchHandler(params.plan, searchQuery, true)}
          />
        )}
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
