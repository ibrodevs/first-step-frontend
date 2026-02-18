import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { Colors, Theme } from '../constants/colors';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export const ProfileScreen: React.FC = ({ navigation }: any) => {
  const { user, logout, isLoading } = useAuthStore();

  // Анимации
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Переменные для отслеживания скролла
  const headerHeight = 280;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 120,
        friction: 8,
        mass: 1,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
        mass: 0.8,
      }),
    ]).start();
  }, []);

  // Интерполяция для плавных анимаций header'а
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100, 200],
    outputRange: [0, -50, -headerHeight],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150, 250],
    outputRange: [1, 0.7, 0],
    extrapolate: 'clamp',
  });

  const headerScale = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  });

  const contentOpacity = scrollY.interpolate({
    inputRange: [0, 50, 150],
    outputRange: [1, 1, 0.95],
    extrapolate: 'clamp',
  });

  const handleLogout = () => {
    Alert.alert(
      'Выход из системы',
      'Вы уверены, что хотите выйти?',
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось выйти из системы');
            }
          },
        },
      ]
    );
  };

  const getInitials = (email: string) => {
    const name = email.split('@')[0];
    return name.substring(0, 2).toUpperCase();
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { 
      useNativeDriver: false,
    }
  );

  const menuSections = [
    {
      title: 'Личные данные',
      items: [
        {
          id: 'edit',
          title: 'Редактировать профиль',
          icon: 'edit-2',
          color: Colors.accent,
          onPress: () => navigation.navigate('EditProfile'),
        },
        {
          id: 'settings',
          title: 'Настройки',
          icon: 'settings',
          color: Colors.primary,
          onPress: () => navigation.navigate('Settings'),
        },
      ],
    },
    {
      title: user?.role === 'student' ? 'Моя карьера' : 'Управление',
      items: user?.role === 'student'
        ? [
          {
            id: 'applications',
            title: 'Мои заявки',
            icon: 'file-text',
            color: Colors.success,
            badge: '3',
            onPress: () => navigation.navigate('Applications'),
          },
          {
            id: 'favorites',
            title: 'Избранное',
            icon: 'heart',
            color: Colors.error,
            badge: '12',
            onPress: () => navigation.navigate('Favorites'),
          },
          {
            id: 'recommendations',
            title: 'Рекомендации',
            icon: 'star',
            color: Colors.warning,
            onPress: () => navigation.navigate('Recommendations'),
          },
        ]
        : [
          {
            id: 'my-internships',
            title: 'Мои стажировки',
            icon: 'briefcase',
            color: Colors.success,
            badge: '5',
            onPress: () => navigation.navigate('MyInternships'),
          },
          {
            id: 'applications',
            title: 'Отклики',
            icon: 'users',
            color: Colors.accent,
            badge: '12',
            onPress: () => navigation.navigate('EmployerApplications'),
          },
          {
            id: 'stats',
            title: 'Статистика',
            icon: 'bar-chart-2',
            color: Colors.primary,
            onPress: () => navigation.navigate('Stats'),
          },
        ],
    },
    {
      title: 'Поддержка',
      items: [
        {
          id: 'help',
          title: 'Помощь и обратная связь',
          icon: 'help-circle',
          color: Colors.info,
          onPress: () => navigation.navigate('Help'),
        },
        {
          id: 'about',
          title: 'О приложении',
          icon: 'info',
          color: Colors.gray,
          onPress: () => navigation.navigate('About'),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Градиентный фон хедера */}
      <Animated.View
        style={[
          styles.headerWrapper,
          {
            transform: [
              { translateY: headerTranslateY },
              { scale: headerScale }
            ],
            opacity: headerOpacity,
          }
        ]}
      >
        <LinearGradient
          colors={[Colors.primary, Colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={24} color={Colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Feather name="settings" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[
            styles.profileInfo,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[Colors.white, Colors.lightAccent]}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>
                {user?.email ? getInitials(user.email) : 'U'}
              </Text>
            </LinearGradient>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Feather name="camera" size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.name || user?.email.split('@')[0]}
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>

            <View style={styles.badgeContainer}>
              <View style={styles.roleBadge}>
                <Feather
                  name={user?.role === 'student' ? 'user' : 'briefcase'}
                  size={14}
                  color={Colors.white}
                />
                <Text style={styles.roleText}>
                  {user?.role === 'student' ? 'Соискатель' : 'Работодатель'}
                </Text>
              </View>

              {user?.role === 'student' && (
                <View style={styles.verifiedBadge}>
                  <Feather name="check-circle" size={14} color={Colors.success} />
                  <Text style={styles.verifiedText}>Аккаунт подтвержден</Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
        </LinearGradient>
      </Animated.View>
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={8}
        decelerationRate="fast"
        bounces={true}
        bouncesZoom={false}
      >
        {/* Меню секции */}
        <Animated.View style={{ opacity: contentOpacity }}>
          {menuSections.map((section, sectionIndex) => {
            const sectionDelay = sectionIndex * 100;
            const sectionSlide = scrollY.interpolate({
              inputRange: [0, 100 + sectionDelay],
              outputRange: [20, 0],
              extrapolate: 'clamp',
            });
            
            return (
              <Animated.View
                key={section.title}
                style={[
                  styles.section,
                  {
                    opacity: fadeAnim,
                    transform: [
                      { translateY: sectionSlide }
                    ]
                  }
                ]}
              >
                <Text style={styles.sectionTitle}>{section.title}</Text>

                <View style={styles.menuContainer}>
                  {section.items.map((item, itemIndex) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.menuItem,
                        itemIndex === section.items.length - 1 && styles.menuItemLast
                      ]}
                      onPress={item.onPress}
                      activeOpacity={0.8}
                    >
                      <View style={styles.menuItemLeft}>
                        <View style={[styles.menuIconContainer, { backgroundColor: item.color + '15' }]}>
                          <Feather name={item.icon} size={20} color={item.color} />
                        </View>
                        <Text style={styles.menuTitle}>{item.title}</Text>
                      </View>

                      <View style={styles.menuItemRight}>
                        {item.badge && (
                          <View style={[styles.badge, { backgroundColor: item.color }]}>
                            <Text style={styles.badgeText}>{item.badge}</Text>
                          </View>
                        )}
                        <Feather name="chevron-right" size={20} color={Colors.gray} />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>
            );
          })}
        </Animated.View>

        {/* Кнопка выхода */}
        <Animated.View
          style={[
            styles.logoutSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Feather name="log-out" size={20} color={Colors.error} />
            <Text style={styles.logoutText}>
              {isLoading ? 'Выход...' : 'Выйти из системы'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Версия приложения */}
        <View style={styles.footer}>
          <Text style={styles.version}>Версия 1.0.0</Text>
          <View style={styles.footerLinks}>
            <Text style={styles.footerLink}>Политика конфиденциальности</Text>
            <Text style={styles.footerDot}>•</Text>
            <Text style={styles.footerLink}>Условия использования</Text>
          </View>
          <Text style={styles.copyright}>© 2024 StageLink. Все права защищены</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  headerGradient: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.lg,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Theme.spacing.md,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 15,
    color: Colors.white + 'CC',
    marginBottom: Theme.spacing.md,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white + '20',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.medium,
    gap: 6,
  },
  roleText: {
    fontSize: 13,
    color: Colors.white,
    fontWeight: '600',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.medium,
    gap: 6,
  },
  verifiedText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: Theme.spacing.lg,
    marginTop: -20,
    marginBottom: Theme.spacing.md,
    paddingVertical: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.xl,
    borderRadius: Theme.borderRadius.large,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: Colors.textMuted + '20',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 280, // Высота header для корректного отступа
    paddingBottom: Theme.spacing.xl,
  },
  section: {
    marginTop: Theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: Theme.spacing.sm,
    marginLeft: Theme.spacing.lg,
  },
  menuContainer: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.large,
    marginHorizontal: Theme.spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.textMuted + '08',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  menuTitle: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: 'bold',
  },
  logoutSection: {
    marginTop: Theme.spacing.lg,
    marginHorizontal: Theme.spacing.lg,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error + '10',
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.large,
    gap: Theme.spacing.sm,
  },
  logoutText: {
    fontSize: 16,
    color: Colors.error,
    fontWeight: '600',
  },
  footer: {
    marginTop: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.lg,
    alignItems: 'center',
  },
  version: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: Theme.spacing.sm,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  footerLink: {
    fontSize: 12,
    color: Colors.textMuted,
    textDecorationLine: 'underline',
  },
  footerDot: {
    fontSize: 12,
    color: Colors.gray,
    marginHorizontal: 8,
  },
  copyright: {
    fontSize: 11,
    color: Colors.gray + '80',
  },
});