import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { Colors, Theme } from '../constants/colors';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export const LoginScreen: React.FC = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  const { login, isLoading } = useAuthStore();

  // Анимации
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.2)),
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    // Анимация нажатия кнопки
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await login(email, password);
    } catch (error: any) {
      Alert.alert(
        'Ошибка входа',
        error.response?.data?.message || 'Неверный email или пароль',
        [
          { 
            text: 'Попробовать снова',
            style: 'cancel'
          }
        ]
      );
    }
  };

  const handleRegisterPress = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => navigation.navigate('Register'));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
            }
          ]}
        >
          {/* Декоративный элемент сверху */}
          <View style={styles.decorativeTop} />
          
          {/* Логотип/Заголовок */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>S</Text>
              </View>
            </View>
            <Text style={styles.title}>С возвращением</Text>
            <Text style={styles.subtitle}>
              Войдите, чтобы продолжить поиск стажировки
            </Text>
          </View>

          {/* Форма */}
          <View style={styles.form}>
            {/* Email поле */}
            <View style={styles.inputWrapper}>
              <Text style={[styles.label, emailFocused && styles.labelFocused]}>
                Email
              </Text>
              <View style={[
                styles.inputContainer,
                emailFocused && styles.inputContainerFocused
              ]}>
              <Feather 
                name="mail" 
                size={20} 
                color={emailFocused ? Colors.accent : Colors.gray} 
                style={styles.inputIcon}
              />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="example@email.com"
                  placeholderTextColor={Colors.gray + '80'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  selectionColor={Colors.accent}
                />
              </View>
            </View>

            {/* Пароль поле */}
            <View style={styles.inputWrapper}>
              <Text style={[styles.label, passwordFocused && styles.labelFocused]}>
                Пароль
              </Text>
              <View style={[
                styles.inputContainer,
                passwordFocused && styles.inputContainerFocused
              ]}>
                <Feather 
                  name="lock" 
                  size={20} 
                  color={passwordFocused ? Colors.accent : Colors.gray} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Введите пароль"
                  placeholderTextColor={Colors.gray + '80'}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  selectionColor={Colors.accent}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Feather 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color={Colors.gray}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Забыли пароль */}
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>
                Забыли пароль?
              </Text>
            </TouchableOpacity>

            {/* Кнопка входа */}
            <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
              <TouchableOpacity
                style={[
                  styles.button,
                  (!email || !password) && styles.buttonDisabled,
                  isLoading && styles.buttonLoading
                ]}
                onPress={handleLogin}
                disabled={isLoading || !email || !password}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Войти</Text>
                    <Feather name="arrow-right" size={20} color={Colors.white} />
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Разделитель */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>или</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Кнопка регистрации */}
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegisterPress}
              activeOpacity={0.7}
            >
              <Text style={styles.registerButtonText}>
                Создать новый аккаунт
              </Text>
            </TouchableOpacity>

            {/* Дополнительная информация */}
            <View style={styles.infoContainer}>
              <Feather name="info" size={14} color={Colors.gray} />
              <Text style={styles.infoText}>
                Входя в систему, вы соглашаетесь с нашими{' '}
                <Text style={styles.infoLink}>Условиями использования</Text> и{' '}
                <Text style={styles.infoLink}>Политикой конфиденциальности</Text>
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.xxl,
    justifyContent: 'center',
  },
  content: {
  },
  decorativeTop: {
    position: 'absolute',
    top: -200,
    left: -50,
    right: -50,
    height: 300,
    backgroundColor: Colors.primary + '10',
    borderRadius: 200,
    transform: [{ scaleX: 1.5 }],
  },
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl * 2,
  },
  logoContainer: {
    marginBottom: Theme.spacing.lg,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.white,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Theme.spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: Theme.spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray,
    marginBottom: Theme.spacing.xs,
    marginLeft: 4,
  },
  labelFocused: {
    color: Colors.accent,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.secondary + '30',
    borderRadius: Theme.borderRadius.large,
    paddingHorizontal: Theme.spacing.md,
    backgroundColor: Colors.white,
    shadowColor: Colors.gray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    height: 56,
  },
  inputContainerFocused: {
    borderColor: Colors.accent,
    shadowColor: Colors.accent,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  inputIcon: {
    marginRight: Theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.primary,
    paddingVertical: Theme.spacing.sm,
  },
  eyeIcon: {
    padding: Theme.spacing.sm,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Theme.spacing.xl,
  },
  forgotPasswordText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    backgroundColor: Colors.accent,
    paddingVertical: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.xl,
    borderRadius: Theme.borderRadius.large,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
  },
  buttonLoading: {
    opacity: 0.8,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginRight: Theme.spacing.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Theme.spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.secondary + '20',
  },
  dividerText: {
    marginHorizontal: Theme.spacing.md,
    color: Colors.gray,
    fontSize: 14,
  },
  registerButton: {
    paddingVertical: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.large,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.accent,
    backgroundColor: 'transparent',
  },
  registerButtonText: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.md,
  },
  infoText: {
    flex: 1,
    marginLeft: Theme.spacing.sm,
    color: Colors.gray,
    fontSize: 12,
    lineHeight: 18,
  },
  infoLink: {
    color: Colors.accent,
    fontWeight: '600',
  },
});