import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { globalColors, globalStyles } from '../../../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RoundButton } from '../../../components';
import {
  NavigationProp,
  RouteProp,
  StackActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { RootStackParams } from '../../../routes/StackNavigator';
import { PlanList } from './components/PlansList';
import { SearchBar, EmptyState } from '../../../components/shared';
import { MonitoringPlan, Site } from '../../../../core/entities';
import {
  BUSINESS_RULES,
  ROLE_DIRECTOR_IIEE,
  ROLE_TEACHER_IIEE,
} from '../../../../core/constants';
import { useAuthStore, useMonitoringStore } from '../../../store';
import { StatusPageResponse } from '../../../../infraestructure';

export const PlansScreen = () => {
  const { top } = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParams>>();
  const params = useRoute<RouteProp<RootStackParams, 'Plans'>>().params;
  const [label, setLabel] = useState<string>();
  const currentSite = useAuthStore(state => state.currentSite);
  const currentInstitution = useAuthStore(state => state.currentInstitution);
  const getPlans = useMonitoringStore(state => state.getPlans);

  // plans grid states
  const [plans, setPlans] = useState<MonitoringPlan[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lastKeyForPaginate, setLastKeyForPaginate] = useState<string>('');
  const [pageSize] = useState<number>(10);
  const [flagShowMore, setFlagShowMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [withError, setWithError] = useState<boolean>(false);

  const [withoutInstitution, setWithoutInstitution] = useState<boolean>(false);

  useEffect(() => {
    setLabel(
      params.mode === 'SCHEDULE'
        ? 'Programación'
        : params.mode === 'EXECUTION'
          ? 'Ejecución'
          : 'Muestras',
    );
  }, [params.mode]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (currentSite) {
        searchHandler(currentSite, searchQuery, true);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, currentSite]);

  const searchHandler = (site: Site, query: string = '', isNewSearch: boolean = false) => {
    if (isLoading && !isNewSearch) return false;

    const currentLastKey = isNewSearch ? '' : lastKeyForPaginate;
    
    // determina si es usuario administrador
    let isDirector = currentSite?.roleCode === ROLE_DIRECTOR_IIEE;
    if (!isDirector) { isDirector = currentSite?.roleCode === ROLE_TEACHER_IIEE; }
    const codigoActor = BUSINESS_RULES.rolActorRelations.find(
      x => x.rol === currentSite?.roleCode,
    );

    if (isDirector && !currentInstitution) {
      setWithoutInstitution(true);
      return false;
    }

    setWithoutInstitution(false);
    setWithError(false);
    setIsLoading(true);

    if (isNewSearch) {
      setLastKeyForPaginate('');
      setFlagShowMore(true);
    }

    getPlans(
      { page: 1, pageSize: pageSize } as any,
      query,
      currentLastKey,
      site,
      isDirector,
      false,
      codigoActor?.actor,
      isDirector ? currentInstitution : undefined,
    )
      .then((value: StatusPageResponse<MonitoringPlan[]>) => {
        setIsLoading(false);
        if (!value.status.success) {
          setWithError(true);
          if (isNewSearch) setPlans([]);
        } else {
          const newData = value['data'] || [];
          if (newData.length > 0) {
            setLastKeyForPaginate(newData[newData.length - 1].key);
            setPlans(prev => isNewSearch ? newData : [...prev, ...newData]);
          } else {
            setFlagShowMore(false);
            if (isNewSearch) setPlans([]);
          }
        }
      })
      .catch(() => {
        setIsLoading(false);
        setWithError(true);
      });
  };

  return (
    <>
      <View style={{ ...styles.header, paddingTop: top }}>
        <View style={styles.buttons}>
          <RoundButton
            icon="close"
            light
            action={() => navigation.dispatch(StackActions.popToTop())}
          />
          <View style={styles.label}>
            <Text style={styles.labelText}>{label}</Text>
          </View>
        </View>
        <View style={styles.titles}>
          <Text style={styles.title}>Planes de monitoreo</Text>
        </View>
      </View>
      <SearchBar 
        value={searchQuery} 
        onChangeText={setSearchQuery} 
        placeholder="Buscar plan..." 
      />
      <ScrollView style={globalStyles.container}>
        {plans.length === 0 && !isLoading && !withError ? (
          <EmptyState message="No se encontraron planes de monitoreo" />
        ) : (
          <PlanList
            plans={plans}
            loading={isLoading}
            showMore={flagShowMore}
            loadHandler={() => searchHandler(currentSite!, searchQuery, false)}
            onReload={() => searchHandler(currentSite!, searchQuery, true)}
          />
        )}
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
  buttons: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    backgroundColor: '#575656',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  labelText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
