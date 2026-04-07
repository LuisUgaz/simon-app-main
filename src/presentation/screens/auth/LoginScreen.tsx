import React, {useEffect, useState, useCallback} from 'react';
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  useWindowDimensions,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {RootStackParams} from '../../routes/StackNavigator';
import {useAuthStore} from '../../store';
import {globalColors} from '../../theme/theme';
import Icon from 'react-native-vector-icons/Ionicons';
import {version} from '../../../../package.json';

interface Props extends StackScreenProps<RootStackParams, 'Login'> {}

export const LoginScreen = ({}: Props) => {
  const {login, getCaptcha} = useAuthStore();
  const [isPosting, setIsPosting] = useState(false);
  const [captchaImage, setCaptchaImage] = useState<string>(''); // Cambiar por el valor del captcha generado dinámicamente.
  const [isCaptchaLoading, setIsCaptchaLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    user: '46862309',
    password: 'Darkmagex@123',
    captcha: '',
  });

  const {height} = useWindowDimensions();

  const updateCaptcha = useCallback(async () => {
    try {
      setIsCaptchaLoading(true);
      const captcha = await getCaptcha();
      setCaptchaImage(captcha);
    } catch (error) {
      console.error('Error fetching captcha:', error);
    } finally {
      setIsCaptchaLoading(false);
    }
  }, [getCaptcha]);

  useEffect(() => {
    updateCaptcha();
  }, [updateCaptcha]);

  const onLogin = async () => {
    if (
      form.user.length === 0 ||
      form.password.length === 0 ||
      form.captcha.length === 0
    ) {
      Alert.alert('Error', 'Por favor, complete todos los campos.');
      return;
    }
    setIsPosting(true);

    const wasSuccessful = await login(form.user, form.password, form.captcha);
    setIsPosting(false);

    if (wasSuccessful) return;
    else {
      updateCaptcha();
      setForm({...form, captcha: ''});
    }

    Alert.alert(
      'Error',
      'Usuario o contraseña incorrectos o captcha inválido.',
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{paddingHorizontal: 40}}>
        {/* Logo */}
        <View style={{alignItems: 'center', marginTop: height * 0.05}}>
          <Image
            source={require('../../../assets/img/simon-gris.png')}
            style={styles.logo}
          />
        </View>

        {/* Header */}
        <View style={{alignItems: 'center'}}>
          <Text style={styles.headerText}>Ministerio de Educación</Text>
          <Text style={styles.subText}>
            Sistema de Gestión de la Calidad del Servicio Educativo
          </Text>
        </View>

        {/* Inputs */}
        <View style={{marginTop: 15}}>
          <TextInput
            placeholder="Usuario"
            keyboardType="number-pad"
            autoCapitalize="none"
            maxLength={20}
            value={form.user}
            onChangeText={user => setForm({...form, user})}
            style={[styles.input, styles.inputSpacing]}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Contraseña"
              autoCapitalize="none"
              secureTextEntry={!showPassword}
              maxLength={20}
              value={form.password}
              onChangeText={password => setForm({...form, password})}
              style={[styles.input, styles.passwordInput]}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? 'eye-off' : 'eye'}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Captcha Section */}
        <View style={styles.captchaContainer}>
          <View style={styles.captchaWrapper}>
            {isCaptchaLoading || !captchaImage ? (
              <View style={[styles.captchaImage, styles.captchaPlaceholder]}>
                <ActivityIndicator size="small" color={globalColors.danger} />
                <Text style={styles.captchaPlaceholderText}>Cargando...</Text>
              </View>
            ) : (
              <Image source={{uri: captchaImage}} style={styles.captchaImage} />
            )}
            <TouchableOpacity
              onPress={updateCaptcha}
              style={styles.refreshButton}>
              <Icon name="sync" size={32} color={globalColors.danger} />
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder="Código de verificación"
            autoCapitalize="none"
            value={form.captcha}
            maxLength={4}
            onChangeText={captcha => setForm({...form, captcha})}
            style={[styles.input, styles.inputSpacing]}
          />
        </View>

        {/* Button */}
        <View style={{marginTop: 5}}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={onLogin}
            disabled={isPosting}
            activeOpacity={0.8}>
            {isPosting ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text style={styles.loginButtonText}>Ingresando...</Text>
              </View>
            ) : (
              <Text style={styles.loginButtonText}>Ingresar</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      <View style={{alignItems: 'center'}}>
        <Image
          source={require('../../../assets/img/logo-minedu.png')}
          style={styles.logo}
        />
        <Text style={styles.versionText}>Versión {version}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 200,
    height: 120,
    resizeMode: 'contain',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: globalColors.danger, // Rojo institucional del MINEDU
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  inputSpacing: {
    marginBottom: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  eyeIcon: {
    padding: 10,
  },
  captchaContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: 12,
  },
  captchaWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  captchaText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  captchaImage: {
    height: 75,
    flex: 1,
    resizeMode: 'contain',
    backgroundColor: '#f4f4f4',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  refreshButton: {
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    marginBottom: 10,
  },
  captchaPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  captchaPlaceholderText: {
    fontSize: 12,
    color: '#666',
  },
  loginButton: {
    backgroundColor: globalColors.danger,
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
