import {PropsWithChildren, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React from 'react';
import {RootStackParams} from '../routes/StackNavigator';
import {useAuthStore} from '../store/auth.store';
import { PanResponder, View } from 'react-native';
import { useRef } from 'react';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export const AuthProvider = ({children}: PropsWithChildren) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  const {checkStatus, status, logout} = useAuthStore();
  const timerId = useRef<NodeJS.Timeout>();

  const resetTimer = () => {
    if (timerId.current) {
      clearTimeout(timerId.current);
    }
    if (status === 'authenticated') {
      timerId.current = setTimeout(() => {
        console.log('💤 User inactive, logging out...');
        logout();
      }, INACTIVITY_TIMEOUT);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => {
        resetTimer();
        return false;
      },
    }),
  ).current;

  useEffect(() => {
    if (status === 'authenticated') {
      resetTimer();
    } else {
      if (timerId.current) {
        clearTimeout(timerId.current);
      }
    }
    return () => {
      if (timerId.current) {
        clearTimeout(timerId.current);
      }
    };
  }, [status]);

  useEffect(() => {
    checkStatus();
  }, []);

  useEffect(() => {
    if (status !== 'checking') {
      if (status === 'authenticated') {
        navigation.reset({
          index: 0,
          routes: [{name: 'Home'}],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{name: 'Login'}],
        });
      }
    }
  }, [status]);

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      {children}
    </View>
  );
};
