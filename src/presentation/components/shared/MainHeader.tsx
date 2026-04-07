import React from 'react';
import {StyleSheet, Text, View, Animated, Pressable} from 'react-native';
import {globalColors} from '../../theme/theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {RootStackParams} from '../../routes/StackNavigator';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface Props {
  user?: string;
  site?: string;
}

export const MainHeader = ({user, site}: Props) => {
  const {top} = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParams>>();
  const animatedValue = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(animatedValue, {
      toValue: 0.95,
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
    <View style={[styles.container, {paddingTop: top}]}>
      {/* Barra superior con logo del ministerio */}
      <View style={styles.topBar}>
        <View style={styles.logoContainer}>
          <Ionicons name="school" size={24} color="#bf0a09" />
          <Text style={styles.logoText}>MINEDU</Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate('Profile')}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Animated.View 
            style={[
              styles.profileButton,
              {
                transform: [{scale: animatedValue}],
              }
            ]}
          >
            <Ionicons name="person-circle" size={32} color="#bf0a09" />
          </Animated.View>
        </Pressable>
      </View>

      {/* Información del usuario */}
      <View style={styles.userInfo}>
        <View style={styles.userContainer}>
          <Text style={styles.welcomeText}>Bienvenido</Text>
          <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
            {user || 'Usuario'}
          </Text>
        </View>
        {site && (
          <Pressable
            onPress={() => navigation.navigate('Profile')}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <Animated.View 
              style={[
                styles.siteContainer,
                {
                  transform: [{scale: animatedValue}],
                }
              ]}
            >
              <Ionicons name="location" size={16} color="#494949" />
              <Text style={styles.siteText} numberOfLines={1} ellipsizeMode="tail">
                {site}
              </Text>
            </Animated.View>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: globalColors.white,
    paddingHorizontal: 20,
    paddingBottom: 16,
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
    marginBottom: 16,
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
    letterSpacing: 1,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  userInfo: {
    gap: 8,
  },
  userContainer: {
    gap: 4,
  },
  welcomeText: {
    fontSize: 14,
    color: '#494949',
    fontWeight: '500',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#494949',
    fontFamily: 'NotoSans-Variable',
  },
  siteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  siteText: {
    fontSize: 14,
    color: '#494949',
    fontWeight: '500',
    fontFamily: 'NotoSans-Variable',
    flex: 1,
  },
});
