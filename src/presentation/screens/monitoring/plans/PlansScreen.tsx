import React, { useCallback, useEffect, useState } from 'react';
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
import { Institution, MonitoringPlan, Site } from '../../../../core/entities';
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
  const [lastKeyForPaginate, setLastKeyForPaginate] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(10);
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
    if (currentSite) searchHandler(currentSite);
  }, [currentSite]);

  const searchHandler = (site: Site) => {
    if (isLoading) {
      return false;
    }
    // determina si es usuario administrador
    let isDirector = currentSite?.roleCode === ROLE_DIRECTOR_IIEE;
    if (!isDirector) { isDirector = currentSite?.roleCode === ROLE_TEACHER_IIEE; }
    const codigoActor = BUSINESS_RULES.rolActorRelations.find(
      x => x.rol === currentSite?.roleCode,
    );

    setWithoutInstitution(false);
    if (isDirector) {
      if (!currentInstitution) {
        setWithoutInstitution(true);
        return false;
      }
    }

    setWithError(false);
    setIsLoading(true);
    console.log('get plans', site);
    getPlans(
      { page: 1, pageSize: pageSize } as any,
      '', //pageSise
      lastKeyForPaginate,
      site,
      isDirector,
      false, // es culminado
      codigoActor?.actor,
      isDirector ? currentInstitution : undefined,
    )
      .then((value: StatusPageResponse<MonitoringPlan[]>) => {
        setIsLoading(false);
        if (!value.status.success) {
          setWithError(true);
          setPlans([]);
        } else {
          if (value['data'].length > 0) {
            setLastKeyForPaginate(value['data'][value['data'].length - 1].key);
          } else {
            setFlagShowMore(false);
          }
          setPlans(plans.concat(value['data']));
        }
      })
      .catch(value => {
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
      <ScrollView style={globalStyles.container}>
        <PlanList
          plans={plans}
          loading={isLoading}
          showMore={flagShowMore}
          loadHandler={() => searchHandler(currentSite!)}
          onReload={() => searchHandler(currentSite!)}
        />
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
});
