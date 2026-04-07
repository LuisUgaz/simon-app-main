import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Animated } from 'react-native';
import { globalColors, globalStyles } from '../../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RoundButton } from '../../components';
import {
  NavigationProp,
  StackActions,
  useNavigation,
} from '@react-navigation/native';
import { RootStackParams } from '../../routes/StackNavigator';
import { OptionsList } from './components/OptionsList';
import { useAuthStore } from '../../store';
import Ionicons from 'react-native-vector-icons/Ionicons';

export const ProfilesScreen = () => {
  const { top, bottom } = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParams>>();
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const isOffLine = useAuthStore(state => state.isOffLine);
  const animatedValue = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(animatedValue, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.mainContainer}>
      <View style={[styles.header, { paddingTop: top }]}>
        <View style={styles.topBar}>
          <RoundButton
            icon="close"
            light
            action={() => navigation.dispatch(StackActions.popToTop())}
          />
          <View style={styles.logoContainer}>
            <Ionicons name="school" size={20} color="#bf0a09" />
            <Text style={styles.logoText}>Perfil</Text>
          </View>
        </View>

        <View style={styles.userSection}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={48} color="#bf0a09" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>Hola</Text>
            <Text style={styles.userName}>{user?.names || 'Usuario'}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={globalStyles.container} showsVerticalScrollIndicator={false}>
        <OptionsList />
      </ScrollView>

      {/* Botón de cerrar sesión siempre al final */}
      {!isOffLine && (
        <View style={[styles.logoutContainer, { paddingBottom: bottom + 16 }]}>
          <Pressable
            onPress={logout}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <Animated.View
              style={[
                styles.logoutButton,
                {
                  transform: [{ scale: animatedValue }],
                },
              ]}
            >
              <View style={styles.logoutIconContainer}>
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color={globalColors.white}
                />
              </View>
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            </Animated.View>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: globalColors.white,
    paddingHorizontal: 20,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#bf0a09',
    letterSpacing: 0.5,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#f0f0f0',
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  greeting: {
    fontSize: 16,
    color: '#494949',
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#494949',
    fontFamily: 'NotoSans-Variable',
  },
  userRole: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    fontFamily: 'NotoSans-Variable',
  },
  logoutContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d32f2f',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    gap: 12,
  },
  logoutIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: globalColors.white,
  },
});
