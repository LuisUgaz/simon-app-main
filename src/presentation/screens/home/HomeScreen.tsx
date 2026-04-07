import React, { useRef } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { globalStyles } from '../../theme/theme';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { MainCard, MainHeader, StatusSection } from '../../components';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { RootStackParams } from '../../routes/StackNavigator';
import { MonitoringModeType } from '../../../core/constants';
import { useAuthStore, useMonitoringStore } from '../../store';
import { StatusSectionRef } from '../../components/general/StatusSection';
import { ROLE_ADMINISTRATOR, ROLE_DIRECTOR_IIEE, ROLE_TEACHER_IIEE } from '../../../core/constants/roles.constanst';

export const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParams>>();
  const setModeMonitoring = useMonitoringStore(state => state.setMode);
  const user = useAuthStore(state => state.user);
  const site = useAuthStore(state => state.currentSite);
  const currentRole = useAuthStore(state => state.currentRole);
  const isOffLine = useAuthStore(state => state.isOffLine);
  const statusSectionRef = useRef<StatusSectionRef>(null);

  const goToMainScreenByMode = (mode: MonitoringModeType) => {
    setModeMonitoring(mode);
    navigation.navigate('Plans', { mode });
  };

  const getSiteDisplay = () => {
    return site?.name ? `${site?.code} - ${site?.name}` : '';
  };

  // Verificar si el rol actual es Director o Docente de IIEE
  const isDirectorOrTeacher = currentRole?.code === ROLE_DIRECTOR_IIEE || currentRole?.code === ROLE_TEACHER_IIEE;
  const isAdministrator = currentRole?.code === ROLE_ADMINISTRATOR;

  // Refrescar StatusSection cada vez que se enfoque la pantalla
  useFocusEffect(
    React.useCallback(() => {
      // Refrescar el StatusSection cuando se accede a la pantalla
      if (statusSectionRef.current) {
        statusSectionRef.current.refresh();
      }
    }, [])
  );

  return (
    <>
      <MainHeader user={user?.fullName} site={getSiteDisplay()} />
      <ScrollView style={globalStyles.container}>
        <StatusSection ref={statusSectionRef} />

        {/* Mensaje cuando no hay rol o sede seleccionada */}
        {!currentRole && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageTitle}>Configuración requerida</Text>
            <Text style={styles.messageText}>
              Por favor, seleccione el rol y sede con el que desea usar la aplicación SIMON.
            </Text>
          </View>
        )}
        {/* Cards según el rol del usuario */}
        {currentRole && !isOffLine && (
          <>
            {/* Programación solo para roles que NO sean Director o Docente */}
            {(!isDirectorOrTeacher && !isAdministrator) && (
              <>
                {/* <MainCard
                  title="Muestras"
                  description="Genera muestras de monitoreo"
                  iconName="people"
                  action={() => goToMainScreenByMode('SAMPLES')}
                /> */}
                <MainCard
                  title="Programación"
                  description="Calendariza tus muestras seleccionadas"
                  iconName="calendar"
                  action={() => goToMainScreenByMode('SCHEDULE')}
                />
              </>
            )}

            {/* Ejecución para todos los roles */}
            {!isAdministrator && (
              <MainCard
                title="Ejecución"
                description="Realiza tus monitoreos planificados"
                iconName="checkmark-circle"
                action={() => goToMainScreenByMode('EXECUTION')}
              />
            )}
            {isAdministrator && (
              <View style={styles.adminMessageContainer}>
                <Icon
                  name="information-circle-outline"
                  size={28}
                  color="#0c5460"
                />
                <View style={styles.textContainer}>
                  <Text style={styles.adminMessageText}>
                    El rol administrador no cuenta con las opciones de
                    programación y ejecución de muestras de monitoreo en esta
                    versión.
                  </Text>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    backgroundColor: '#FFF3CD',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  adminMessageContainer: {
    backgroundColor: '#d1ecf1',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#17a2b8',
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  adminMessageText: {
    fontSize: 14,
    color: '#0c5460',
    lineHeight: 20,
  },
});
