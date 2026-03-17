import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { Colors, Theme } from '../constants/colors';
import { Feather as Icon } from '@expo/vector-icons';
import { API_BASE_URL_VALUE } from '../services/api';

const { width } = Dimensions.get('window');

export const RegisterScreen: React.FC = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'employer'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Состояния фокуса
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  const { register, isLoading } = useAuthStore();

  const [toast, setToast] = useState<null | { type: 'success' | 'error'; message: string }>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(-16)).current;
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const hideToast = () => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }

    Animated.parallel([
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(toastTranslateY, {
        toValue: -16,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => setToast(null));
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }

    setToast({ type, message });
    toastOpacity.setValue(0);
    toastTranslateY.setValue(-16);

    Animated.parallel([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(toastTranslateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();

    toastTimerRef.current = setTimeout(() => {
      hideToast();
    }, 3000);
  };

  const translateRegisterError = (raw: string): string => {
    const s = (raw || '').trim();
    if (!s) return '';
    const map: Record<string, string> = {
      'Email already exists': 'Этот email уже зарегистрирован',
      'Passwords do not match.': 'Пароли не совпадают',
      'Password must be at least 8 characters.': 'Пароль должен содержать минимум 8 символов',
      'Password must contain letters and digits.': 'Пароль должен содержать буквы и цифры',
      'This field is required.': 'Это поле обязательно',
    };
    return map[s] ?? s;
  };

  const extractRegisterErrorMessage = (error: any): string => {
    const data = error?.response?.data;
    if (!data) return '';

    // DRF APIException обычно: { detail: "..." }
    if (typeof data.detail === 'string') {
      return translateRegisterError(data.detail);
    }

    // DRF validation обычно: { field: ["msg1", "msg2"] }
    if (typeof data === 'object') {
      for (const key of Object.keys(data)) {
        const value = (data as any)[key];
        if (typeof value === 'string') return translateRegisterError(value);
        if (Array.isArray(value) && typeof value[0] === 'string') return translateRegisterError(value[0]);
      }
    }

    // На всякий случай поддержим старый формат
    const legacy = data?.error?.message;
    if (typeof legacy === 'string') return translateRegisterError(legacy);

    return '';
  };

  const handleRegister = async () => {
    // Валидация
    if (!email || !password || !confirmPassword) {
      showToast('error', 'Заполните все поля');
      return;
    }

    if (password !== confirmPassword) {
      showToast('error', 'Пароли не совпадают');
      return;
    }

    if (password.length < 8) {
      showToast('error', 'Пароль должен содержать минимум 8 символов');
      return;
    }

    const strongRegex = /^(?=.*[A-Za-z])(?=.*\d).+$/;
    if (!strongRegex.test(password)) {
      showToast('error', 'Пароль должен содержать буквы и цифры');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('error', 'Введите корректный email адрес');
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
      await register(email, password, role);

      showToast('success', 'Аккаунт успешно создан');
    } catch (error: any) {
      const apiMessage = extractRegisterErrorMessage(error);
      const message = !error.response
        ? `Что-то не получилось. Не удалось подключиться к серверу (${API_BASE_URL_VALUE}).`
        : apiMessage
          ? `Что-то не получилось: ${apiMessage}`
          : 'Что-то не получилось. Попробуйте ещё раз.';

      showToast('error', message);
    }
  };

  const handleLoginPress = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => navigation.navigate('Login'));
  };

  const RoleSelector = () => (
    <View style={styles.roleContainer}>
      <Text style={[styles.label, styles.roleLabel]}>Выберите роль</Text>
      <View style={styles.roleButtons}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            role === 'student' && styles.roleButtonActive,
          ]}
          onPress={() => setRole('student')}
          activeOpacity={0.7}
        >
          <Icon
            name="user"
            size={20}
            color={role === 'student' ? Colors.white : Colors.accent}
            style={styles.roleIcon}
          />
          <Text
            style={[
              styles.roleButtonText,
              role === 'student' && styles.roleButtonTextActive,
            ]}
          >
            Соискатель
          </Text>
          {role === 'student' && (
            <View style={styles.roleCheck}>
              <Icon name="check" size={16} color={Colors.white} />
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleButton,
            role === 'employer' && styles.roleButtonActive,
          ]}
          onPress={() => setRole('employer')}
          activeOpacity={0.7}
        >
          <Icon
            name="briefcase"
            size={20}
            color={role === 'employer' ? Colors.white : Colors.accent}
            style={styles.roleIcon}
          />
          <Text
            style={[
              styles.roleButtonText,
              role === 'employer' && styles.roleButtonTextActive,
            ]}
          >
            Работодатель
          </Text>
          {role === 'employer' && (
            <View style={styles.roleCheck}>
              <Icon name="check" size={16} color={Colors.white} />
            </View>
          )}
        </TouchableOpacity>
      </View>
      <Text style={styles.roleHint}>
        {role === 'student'
          ? '📚 Доступ к стажировкам и программам'
          : 'Публикация вакансий и поиск талантов'
        }
      </Text>
    </View>
  );

  // Индикатор сложности пароля
  const PasswordStrengthIndicator = () => {
    const getStrength = () => {
      if (password.length === 0) return 0;
      if (password.length < 6) return 1;
      if (password.length < 8) return 2;
      return 3;
    };

    const strength = getStrength();
    const strengthText = ['', 'Слабый', 'Средний', 'Надежный'];
    const strengthColor = ['', Colors.warning, Colors.accent, Colors.success];

    if (password.length === 0) return null;

    return (
      <View style={styles.strengthContainer}>
        <View style={styles.strengthBars}>
          {[1, 2, 3].map((level) => (
            <View
              key={level}
              style={[
                styles.strengthBar,
                level <= strength && { backgroundColor: strengthColor[strength] },
              ]}
            />
          ))}
        </View>
        <Text style={[styles.strengthText, { color: strengthColor[strength] }]}>
          {strengthText[strength]}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {toast && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.toast,
            toast.type === 'success' ? styles.toastSuccess : styles.toastError,
            {
              top: (Platform.OS === 'web' ? Theme.spacing.lg : insets.top + Theme.spacing.sm),
              opacity: toastOpacity,
              transform: [{ translateY: toastTranslateY }],
            },
          ]}
        >
          <Icon
            name={toast.type === 'success' ? 'check-circle' : 'alert-circle'}
            size={18}
            color={Colors.white}
            style={styles.toastIcon}
          />
          <Text style={styles.toastText}>{toast.message}</Text>
        </Animated.View>
      )}

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
          {/* Декоративный элемент */}
          <View style={styles.decorativeTop} />

          {/* Кнопка назад */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color={Colors.primary} />
          </TouchableOpacity>

          {/* Заголовок */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>S</Text>
              </View>
            </View>
            <Text style={styles.title}>Создать аккаунт</Text>
            <Text style={styles.subtitle}>
              Присоединяйтесь к сообществу профессионалов
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
                <Icon
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
                <Icon
                  name="lock"
                  size={20}
                  color={passwordFocused ? Colors.accent : Colors.gray}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Минимум 8 символов"
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
                  <Icon
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={Colors.gray}
                  />
                </TouchableOpacity>
              </View>
              <PasswordStrengthIndicator />
            </View>

            {/* Подтверждение пароля */}
            <View style={styles.inputWrapper}>
              <Text style={[styles.label, confirmFocused && styles.labelFocused]}>
                Подтвердите пароль
              </Text>
              <View style={[
                styles.inputContainer,
                confirmFocused && styles.inputContainerFocused,
                confirmPassword && password !== confirmPassword && styles.inputContainerError
              ]}>
                <Icon
                  name="shield"
                  size={20}
                  color={confirmFocused ? Colors.accent : Colors.gray}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Повторите пароль"
                  placeholderTextColor={Colors.gray + '80'}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  onFocus={() => setConfirmFocused(true)}
                  onBlur={() => setConfirmFocused(false)}
                  selectionColor={Colors.accent}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Icon
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={20}
                    color={Colors.gray}
                  />
                </TouchableOpacity>
              </View>
              {confirmPassword && password !== confirmPassword && (
                <Text style={styles.errorText}>Пароли не совпадают</Text>
              )}
            </View>

            {/* Селектор роли */}
            <RoleSelector />

            {/* Кнопка регистрации */}
            <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
              <TouchableOpacity
                style={[
                  styles.button,
                  (!email || !password || !confirmPassword || password !== confirmPassword || password.length < 8)
                  && styles.buttonDisabled,
                  isLoading && styles.buttonLoading
                ]}
                onPress={handleRegister}
                disabled={isLoading || !email || !password || !confirmPassword || password !== confirmPassword || password.length < 8}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Зарегистрироваться</Text>
                    <Icon name="user-plus" size={20} color={Colors.white} />
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Разделитель */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>уже есть аккаунт?</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Кнопка входа */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLoginPress}
              activeOpacity={0.7}
            >
              <Text style={styles.loginButtonText}>
                Войти в систему
              </Text>
            </TouchableOpacity>

            {/* Условия использования */}
            <View style={styles.termsContainer}>
              <Icon name="shield" size={14} color={Colors.gray} />
              <Text style={styles.termsText}>
                Регистрируясь, вы принимаете{' '}
                <Text style={styles.termsLink}>Условия использования</Text> и{' '}
                <Text style={styles.termsLink}>Политику конфиденциальности</Text>
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
    position: 'relative',
  },
  toast: {
    position: 'absolute',
    left: Theme.spacing.xl,
    right: Theme.spacing.xl,
    zIndex: 9999,
    elevation: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.medium,
    shadowColor: Colors.gray,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  toastSuccess: {
    backgroundColor: Colors.success,
  },
  toastError: {
    backgroundColor: Colors.error,
  },
  toastIcon: {
    marginRight: Theme.spacing.sm,
  },
  toastText: {
    flex: 1,
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.xxl,
  },
  content: {
  },
  decorativeTop: {
    position: 'absolute',
    top: -200,
    left: -50,
    right: -50,
    height: 300,
    backgroundColor: Colors.primary + '08',
    borderRadius: 200,
    transform: [{ scaleX: 1.5 }],
  },
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl * 2,
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
    padding: Theme.spacing.sm,
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
  inputContainerError: {
    borderColor: Colors.error,
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
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Theme.spacing.xs,
    marginLeft: 4,
  },
  strengthBars: {
    flexDirection: 'row',
    marginRight: Theme.spacing.sm,
  },
  strengthBar: {
    width: 30,
    height: 4,
    backgroundColor: Colors.secondary + '20',
    borderRadius: 2,
    marginRight: 4,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: Theme.spacing.xs,
    marginLeft: 4,
  },
  roleContainer: {
    marginBottom: Theme.spacing.xl,
  },
  roleLabel: {
    marginBottom: Theme.spacing.sm,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  roleButton: {
    flex: 1,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.large,
    borderWidth: 1.5,
    borderColor: Colors.accent + '30',
    alignItems: 'center',
    backgroundColor: Colors.white,
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative',
  },
  roleButtonActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  roleIcon: {
    marginRight: Theme.spacing.xs,
  },
  roleButtonText: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '600',
  },
  roleButtonTextActive: {
    color: Colors.white,
  },
  roleCheck: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.success,
    borderRadius: 12,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleHint: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: Theme.spacing.sm,
    textAlign: 'center',
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
    textTransform: 'lowercase',
  },
  loginButton: {
    paddingVertical: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.large,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.accent,
    backgroundColor: 'transparent',
  },
  loginButtonText: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.md,
  },
  termsText: {
    flex: 1,
    marginLeft: Theme.spacing.sm,
    color: Colors.gray,
    fontSize: 12,
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.accent,
    fontWeight: '600',
  },
});