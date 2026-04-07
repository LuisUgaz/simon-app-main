import {createStackNavigator} from '@react-navigation/stack';
import {HomeScreen} from '../screens/home/HomeScreen';
import {ProfilesScreen} from '../screens/profile/ProfilesScreen';
import {RolesScreen} from '../screens/profile/RolesScreen';
import {SitesScreen} from '../screens/profile/SitesScreen';
import {PlansScreen} from '../screens/monitoring/plans/PlansScreen';
import {SheetsScreen} from '../screens/monitoring/sheets/SheetsScreen';
import {SamplesScreen} from '../screens/monitoring/sample/SampleScreen';
import {MonitoringModeType} from '../../core/constants';
import {LoginScreen} from '../screens/auth/LoginScreen';
import {SampleDetailScreen} from '../screens/monitoring/sample/SampleDetailScreen';
import {
  MonitoringInstrument,
  MonitoringPlan,
} from '../../core/entities';
import {SampleVisitScreen} from '../screens/monitoring/sample/SampleVisitScreen';
import {SampleVisitExecutionScreen} from '../screens/monitoring/sample/SampleVisitExecutionScreen';
import {SampleVisitFormScreen} from '../screens/monitoring/sample/SampleVisitFormScreen';
import {VisitsListScreen} from '../screens/monitoring/visits/VisitsListScreen';

export type RootStackParams = {
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Roles: undefined;
  Sites: {code: string};
  Plans: {mode: MonitoringModeType};
  Sheets: {plan: MonitoringPlan};
  Samples: {sheet: MonitoringInstrument};
  SampleDetail: undefined;
  SampleVisit: undefined;
  SampleVisitExecution: undefined;
  SampleVisitForm: undefined;
  VisitsList: undefined;
};

const Stack = createStackNavigator<RootStackParams>();

export const StackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: {
          elevation: 0,
          shadowColor: 'transparent',
        },
        detachPreviousScreen: true,
      }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfilesScreen} />
      <Stack.Screen name="Roles" component={RolesScreen} />
      <Stack.Screen name="Sites" component={SitesScreen} />
      <Stack.Screen name="Plans" component={PlansScreen} />
      <Stack.Screen name="Sheets" component={SheetsScreen} />
      <Stack.Screen name="Samples" component={SamplesScreen} />
      <Stack.Screen name="SampleDetail" component={SampleDetailScreen} />
      <Stack.Screen name="SampleVisit" component={SampleVisitScreen} />
      <Stack.Screen name="SampleVisitExecution" component={SampleVisitExecutionScreen} />
      <Stack.Screen name="SampleVisitForm" component={SampleVisitFormScreen} />
      <Stack.Screen name="VisitsList" component={VisitsListScreen} />
    </Stack.Navigator>
  );
};
