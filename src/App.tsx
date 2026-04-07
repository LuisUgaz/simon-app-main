import 'react-native-gesture-handler';
import React, {useEffect, useState} from 'react';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import {StackNavigator} from './presentation/routes/StackNavigator';
import {PaperProvider} from 'react-native-paper';
import IonIcon from 'react-native-vector-icons/Ionicons';
import {AuthProvider} from './presentation/providers';
import {useAuthStore} from './presentation/store';
import {OfflineStatusBar} from './presentation/components/shared/OffLineStatusBar';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
// import LocalizedFormat from 'dayjs/plugin/LocalizedFormat';
import {Snackbar} from './presentation/components/general/Snackbar';
import {useAppStore} from './presentation/store/app.store';
import JailMonkey from 'jail-monkey';
import {StyleSheet, Text, View, BackHandler} from 'react-native';

// Habilitar el plugin
dayjs.extend(customParseFormat);
// dayjs.extend(LocalizedFormat);

export const App = () => {
  const navigationRef = useNavigationContainerRef(); // Referencia al contenedor de navegación
  const {isAuthenticated, logout, incrementLogoutAttempts, getLogoutAttempts} =
    useAuthStore(); // Método de tu Auth Store

  // Snackbar global
  const snackbarVisible = useAppStore(state => state.visible);
  const snackbarMessage = useAppStore(state => state.message);
  const snackbarType = useAppStore(state => state.type);
  const hideSnackbar = useAppStore(state => state.hideSnackbar);

  const [isRooted, setIsRooted] = useState(false);

  // useEffect(() => {
  //   // Verificar si el dispositivo está rooteado/jailbroken o tiene hooks (Frida, Xposed)
  //   if (JailMonkey.isJailBroken() || JailMonkey.hookDetected()) {
  //     setIsRooted(true);
  //     // Finalizar la app después de mostrar el mensaje brevemente o permitir que la UI bloquee.
  //     // Si se requiere finalizar "inmediatamente", podríamos llamar a exitApp aquí, pero no se vería el mensaje.
  //     // Se opta por mostrar el mensaje y bloquear.
  //   }
  // }, []);

  // Removed flaky navigation listener logic


  if (isRooted) {
    return (
      <View style={styles.container}>
        <IonIcon name="warning-outline" size={80} color="#e74c3c" />
        <Text style={styles.title}>Dispositivo no seguro</Text>
        <Text style={styles.message}>
          Esta aplicación no puede ejecutarse en dispositivos con acceso Root,
          Jailbreak o con herramientas de manipulación (Frida/Xposed) activas.
        </Text>
        <Text
          style={[styles.message, {marginTop: 20, fontWeight: 'bold'}]}
          onPress={() => BackHandler.exitApp()}>
          CERRAR APLICACIÓN
        </Text>
      </View>
    );
  }

  return (
    <>
      <PaperProvider
        settings={{
          icon: props => <IonIcon {...props} />,
        }}>
        <NavigationContainer ref={navigationRef}>
          <AuthProvider>
            {/* Barra de estado offline */}
            <OfflineStatusBar />
            {/* Navegador de pantallas */}
            <StackNavigator />
          </AuthProvider>
        </NavigationContainer>
      </PaperProvider>
      <Snackbar
        visible={snackbarVisible}
        message={snackbarMessage}
        type={snackbarType}
        onDismiss={hideSnackbar}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
