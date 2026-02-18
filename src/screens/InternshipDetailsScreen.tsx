import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
  Modal,
  TextInput,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useInternshipStore } from '../store/internshipStore';
import { useAuthStore } from '../store/authStore';
import { Colors, Theme } from '../constants/colors';

const { width } = Dimensions.get('window');

// Современный компонент статистики
const StatBadge: React.FC<{ icon: keyof typeof Feather.glyphMap; value: string; label: string; color?: string }> = 
  ({ icon, value, label, color = Colors.accent }) => (
  <View style={[styles.statBadge, { borderLeftColor: color }]}>
    <View style={[styles.statBadgeIcon, { backgroundColor: color + '15' }]}>
      <Feather name={icon} size={18} color={color} />
    </View>
    <View style={styles.statBadgeContent}>
      <Text style={styles.statBadgeValue}>{value}</Text>
      <Text style={styles.statBadgeLabel}>{label}</Text>
    </View>
  </View>
);

// Современное модальное окно
const ApplyModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSubmit: (coverLetter: string) => void;
  isLoading: boolean;
  companyName: string;
}> = ({ visible, onClose, onSubmit, isLoading, companyName }) => {
  const [coverLetter, setCoverLetter] = useState('');
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          mass: 0.8,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(300);
      fadeAnim.setValue(0);
      setCoverLetter('');
    }
  }, [visible]);

  const characterCount = coverLetter.length;
  const isValid = characterCount >= 50;

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.modalDismiss} activeOpacity={1} onPress={onClose} />
        
        <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.modalBlur}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Отклик на стажировку</Text>
                <Text style={styles.modalSubtitle}>в {companyName}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                <Feather name="x" size={24} color={Colors.gray} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.textAreaWrapper}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Расскажите, почему вы хотите пройти эту стажировку..."
                  placeholderTextColor={Colors.gray + '80'}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  value={coverLetter}
                  onChangeText={setCoverLetter}
                  maxLength={1000}
                />
                <View style={styles.characterCounter}>
                  <Text style={[
                    styles.characterCount,
                    characterCount >= 50 ? styles.characterCountValid : styles.characterCountInvalid
                  ]}>
                    {characterCount}/1000
                  </Text>
                </View>
              </View>

              <View style={styles.modalTips}>
                <View style={styles.modalTipsHeader}>
                  <Feather name="lightbulb" size={16} color={Colors.accent} />
                  <Text style={styles.modalTipsTitle}>Советы для отличного отклика:</Text>
                </View>
                {[
                  'Опишите свой релевантный опыт',
                  'Объясните мотивацию',
                  'Упомяните ключевые навыки',
                ].map((tip, index) => (
                  <View key={index} style={styles.modalTip}>
                    <Feather name="check-circle" size={16} color={Colors.success} />
                    <Text style={styles.modalTipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={onClose}>
                <Text style={styles.modalCancelText}>Отмена</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSubmitButton, (!isValid || isLoading) && styles.modalSubmitButtonDisabled]}
                onPress={() => onSubmit(coverLetter)}
                disabled={!isValid || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <>
                    <Text style={styles.modalSubmitText}>Отправить</Text>
                    <Feather name="arrow-right" size={18} color={Colors.white} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// Компонент секции
const DetailSection: React.FC<{
  title: string;
  icon: keyof typeof Feather.glyphMap;
  children: React.ReactNode;
}> = ({ title, icon, children }) => {
  const [expanded, setExpanded] = useState(true);
  const rotateAnim = useRef(new Animated.Value(1)).current;

  const toggleExpand = () => {
    Animated.timing(rotateAnim, {
      toValue: expanded ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setExpanded(!expanded);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.section}>
      <TouchableOpacity style={styles.sectionHeader} onPress={toggleExpand} activeOpacity={0.7}>
        <View style={styles.sectionHeaderLeft}>
          <View style={styles.sectionIcon}>
            <Feather name={icon} size={18} color={Colors.accent} />
          </View>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Feather name="chevron-down" size={20} color={Colors.gray} />
        </Animated.View>
      </TouchableOpacity>

      {expanded && (
        <Animated.View style={styles.sectionContent}>
          {children}
        </Animated.View>
      )}
    </View>
  );
};

export const InternshipDetailsScreen: React.FC<any> = ({ route, navigation }) => {
  const { internshipId } = route.params;
  const { currentInternship, isLoading, fetchInternshipById, applyToInternship } = useInternshipStore();
  const { user } = useAuthStore();

  // Состояния
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [applying, setApplying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'requirements' | 'company'>('overview');

  // Анимации
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100, 200],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    fetchInternshipById(internshipId);

    // Устанавливаем начальное состояние анимации
    fadeAnim.setValue(0);
    slideAnim.setValue(30);

    // Запускаем анимации с задержкой для плавного появления
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          mass: 1,
          stiffness: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }, 100);

    return () => clearTimeout(timer);
  }, [internshipId]);

  const daysUntilDeadline = useMemo(() => {
    if (!currentInternship?.deadline) return null;
    const deadline = new Date(currentInternship.deadline);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [currentInternship?.deadline]);

  const deadlineStatus = useMemo(() => {
    if (!daysUntilDeadline) return 'normal';
    if (daysUntilDeadline < 0) return 'expired';
    if (daysUntilDeadline <= 3) return 'urgent';
    if (daysUntilDeadline <= 7) return 'soon';
    return 'normal';
  }, [daysUntilDeadline]);

  const handleShare = async () => {
    try {
      await Share.share({
        title: currentInternship?.title,
        message: `Стажировка: ${currentInternship?.title} в ${currentInternship?.employer.companyName}`,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error(error);
    }
  };

  const handleApply = useCallback(async (coverLetter: string) => {
    setApplying(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await applyToInternship(internshipId, coverLetter);
      setApplyModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Отклик отправлен!', 'Работодатель рассмотрит вашу кандидацию.');
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Ошибка', 'Не удалось отправить отклик');
    } finally {
      setApplying(false);
    }
  }, [internshipId]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#ffffff', '#00b2c2']}
          style={styles.loadingGradient}
        >
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={Colors.white} />
            <Text style={styles.loadingText}>Загружаем стажировку...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (!currentInternship) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={48} color={Colors.error} />
        <Text style={styles.errorTitle}>Стажировка не найдена</Text>
        <Text style={styles.errorText}>Проверьте подключение к интернету</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => fetchInternshipById(internshipId)}
        >
          <Text style={styles.retryText}>Попробовать снова</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const canApply = user?.role === 'student' && 
    currentInternship.status === 'active' && 
    daysUntilDeadline && daysUntilDeadline > 0;

  return (
    <>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

        {/* Статичная кнопка назад */}
        <View style={styles.staticBackButton}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonStatic}>
            <Feather name="arrow-left" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Анимированный хедер */}
        <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
          <View style={styles.headerBlur}>
            <View style={styles.headerContent}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                <Feather name="arrow-left" size={20} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {currentInternship.title}
              </Text>
              <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
                <Feather name="share-2" size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          {/* Hero секция */}
          <Animated.View style={[styles.heroSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.heroGradient}>
              <View style={styles.heroContent}>
                <View style={styles.heroHeader}>
                  <View style={styles.heroBadge}>
                    <Feather 
                      name={currentInternship.status === 'active' ? 'check-circle' : 'clock'} 
                      size={12} 
                      color={Colors.accent} 
                    />
                    <Text style={styles.heroBadgeText}>
                      {currentInternship.status === 'active' ? 'Активна' : 'Скоро'}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.favoriteButton} 
                    onPress={() => {
                      setIsFavorite(!isFavorite);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Feather 
                      name={isFavorite ? 'heart' : 'heart'} 
                      size={22} 
                      color={isFavorite ? Colors.error : Colors.gray} 
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.heroTitle}>{currentInternship.title}</Text>

                <View style={styles.heroCompany}>
                  <View style={styles.heroCompanyLogo}>
                    <LinearGradient
                      colors={['#4A90E2', '#357ABD']}
                      style={styles.heroCompanyLogoGradient}
                    >
                      <Feather name="briefcase" size={20} color={Colors.white} />
                    </LinearGradient>
                    <Text style={styles.heroCompanyInitial}>
                      {currentInternship.employer.companyName.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.heroCompanyInfo}>
                    <Text style={styles.heroCompanyName}>
                      {currentInternship.employer.companyName}
                    </Text>
                    <View style={styles.heroCompanyDetails}>
                      <View style={styles.heroCompanyRating}>
                        {[1,2,3,4,5].map((_, i) => (
                          <Feather 
                            key={i} 
                            name="star" 
                            size={12} 
                            color={i < 4 ? Colors.warning : Colors.gray + '40'} 
                          />
                        ))}
                        <Text style={styles.ratingText}>4.2</Text>
                      </View>
                      <View style={styles.companyLocation}>
                        <Feather name="map-pin" size={12} color={Colors.gray} />
                        <Text style={styles.locationText}>Москва, Россия</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Кнопка подать заявку в hero секции */}
                <TouchableOpacity
                  style={styles.heroApplyButton}
                  onPress={() => setApplyModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <View style={styles.heroApplyButtonContent}>
                    <Text style={styles.heroApplyButtonText}>Подать заявку</Text>
                    <Feather name="arrow-right" size={16} color={Colors.white} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* Статистика */}
          <View style={styles.statsContainer}>
            <StatBadge icon="users" value="24" label="откликов" color={Colors.accent} />
            <StatBadge icon="eye" value="156" label="просмотров" color={Colors.success} />
            <StatBadge 
              icon="clock" 
              value={daysUntilDeadline ? `${daysUntilDeadline} дн.` : '—'} 
              label="осталось" 
              color={deadlineStatus === 'urgent' ? Colors.error : Colors.warning}
            />
          </View>

          {/* Табы */}
          <View style={styles.tabsContainer}>
            {(['overview', 'requirements', 'company'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab === 'overview' ? 'Обзор' : 
                   tab === 'requirements' ? 'Требования' : 'Компания'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Контент табов */}
          <View style={styles.tabContent}>
            {activeTab === 'overview' && (
              <>
                <DetailSection title="Описание" icon="file-text">
                  <Text style={styles.sectionText}>{currentInternship.description}</Text>
                </DetailSection>

                <DetailSection title="Обязанности" icon="briefcase">
                  <Text style={styles.sectionText}>
                    {currentInternship.responsibilities || 'Не указаны'}
                  </Text>
                </DetailSection>

                <View style={styles.conditionsContainer}>
                  <View style={styles.conditionItem}>
                    <View style={styles.conditionIcon}>
                      <Feather name="dollar-sign" size={18} color={Colors.accent} />
                    </View>
                    <Text style={styles.conditionLabel}>Оплата</Text>
                    <Text style={styles.conditionValue}>
                      {currentInternship.isPaid ? 'Оплачиваемая' : 'Без оплаты'}
                    </Text>
                  </View>

                  <View style={styles.conditionItem}>
                    <View style={styles.conditionIcon}>
                      <Feather name="calendar" size={18} color={Colors.accent} />
                    </View>
                    <Text style={styles.conditionLabel}>Длительность</Text>
                    <Text style={styles.conditionValue}>{currentInternship.duration}</Text>
                  </View>

                  <View style={styles.conditionItem}>
                    <View style={styles.conditionIcon}>
                      <Feather name="users" size={18} color={Colors.accent} />
                    </View>
                    <Text style={styles.conditionLabel}>Набор</Text>
                    <Text style={styles.conditionValue}>{currentInternship.positions || 1} чел.</Text>
                  </View>
                </View>
              </>
            )}

            {activeTab === 'requirements' && (
              <>
                <DetailSection title="Требования" icon="check-circle">
                  <Text style={styles.sectionText}>{currentInternship.requirements}</Text>
                </DetailSection>

                <View style={styles.skillsCard}>
                  <Text style={styles.skillsTitle}>Необходимые навыки</Text>
                  <View style={styles.skillsContainer}>
                    {currentInternship.skills.map((skill, index) => (
                      <View key={index} style={styles.skillTag}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.experienceCard}>
                  <Feather name="award" size={20} color={Colors.accent} />
                  <View style={styles.experienceContent}>
                    <Text style={styles.experienceLabel}>Опыт работы</Text>
                    <Text style={styles.experienceValue}>
                      {currentInternship.experience || 'Без опыта'}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {activeTab === 'company' && (
              <>
                <DetailSection title="О компании" icon="info">
                  <Text style={styles.sectionText}>{currentInternship.employer.description}</Text>
                </DetailSection>

                <View style={styles.contactsCard}>
                  <Text style={styles.contactsTitle}>Контакты</Text>
                  
                  {currentInternship.employer.website && (
                    <TouchableOpacity style={styles.contactItem}>
                      <View style={styles.contactIcon}>
                        <Feather name="globe" size={14} color={Colors.accent} />
                      </View>
                      <Text style={styles.contactText}>{currentInternship.employer.website}</Text>
                    </TouchableOpacity>
                  )}

                  {currentInternship.employer.email && (
                    <TouchableOpacity style={styles.contactItem}>
                      <View style={styles.contactIcon}>
                        <Feather name="mail" size={14} color={Colors.accent} />
                      </View>
                      <Text style={styles.contactText}>{currentInternship.employer.email}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>

          {/* Бейдж срочности */}
          {deadlineStatus === 'urgent' && (
            <View style={styles.urgentBanner}>
              <Feather name="alert-triangle" size={20} color={Colors.white} />
              <View>
                <Text style={styles.urgentBannerTitle}>Срочно! Осталось {daysUntilDeadline} дня</Text>
                <Text style={styles.urgentBannerText}>Успейте подать заявку</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Футер с кнопкой */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => setApplyModalVisible(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.accent, Colors.accent + 'CC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.applyGradient}
            >
              <View>
                <Text style={styles.applyButtonTitle}>Откликнуться</Text>
                <Text style={styles.applyButtonSubtitle}>
                  {currentInternship.deadline ? 
                    `до ${new Date(currentInternship.deadline).toLocaleDateString()}` : 
                    'подать заявку'
                  }
                </Text>
              </View>
              <Feather name="send" size={22} color={Colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Модальное окно */}
      <ApplyModal
        visible={applyModalVisible}
        onClose={() => setApplyModalVisible(false)}
        onSubmit={handleApply}
        isLoading={applying}
        companyName={currentInternship.employer.companyName}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: Colors.white,
    fontWeight: '600',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  staticBackButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 10,
    left: 16,
    zIndex: 200,
  },
  backButtonStatic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerBlur: {
    backgroundColor: 'rgba(248, 249, 250, 0.95)',
    paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0),
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    marginBottom: 16,
  },
  heroGradient: {
    paddingTop: Platform.OS === 'ios' ? 100 : (StatusBar.currentHeight || 0) + 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    position: 'relative',
    overflow: 'hidden',
  },
  heroDecorations: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroDecoration: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroDecoration1: {
    width: 120,
    height: 120,
    top: -60,
    right: -30,
  },
  heroDecoration2: {
    width: 80,
    height: 80,
    bottom: -40,
    left: -20,
  },
  heroDecoration3: {
    width: 60,
    height: 60,
    top: 60,
    left: width - 80,
  },
  heroContent: {
    gap: 16,
    position: 'relative',
    zIndex: 1,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  heroBadgeText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '600',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 40,
  },
  heroCompany: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroCompanyLogo: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  heroCompanyLogoGradient: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCompanyInitial: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heroCompanyInfo: {
    flex: 1,
  },
  heroCompanyName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  heroCompanyDetails: {
    gap: 6,
  },
  heroCompanyRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '600',
    marginLeft: 4,
  },
  companyLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '500',
  },
  heroApplyButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  heroApplyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  heroApplyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 8,
  },
  statBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 10,
    borderRadius: 12,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statBadgeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statBadgeContent: {
    flex: 1,
  },
  statBadgeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  statBadgeLabel: {
    fontSize: 10,
    color: Colors.gray,
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: Colors.white,
  },
  tabActive: {
    backgroundColor: Colors.accent,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray,
  },
  tabTextActive: {
    color: Colors.white,
  },
  tabContent: {
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: Colors.white,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.accent + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  sectionContent: {
    padding: 16,
    paddingTop: 0,
  },
  sectionText: {
    fontSize: 14,
    color: Colors.gray,
    lineHeight: 20,
  },
  conditionsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  conditionItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  conditionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.accent + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  conditionLabel: {
    fontSize: 11,
    color: Colors.gray,
  },
  conditionValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  skillsCard: {
    backgroundColor: Colors.white,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  skillsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: Colors.accent + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillText: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '500',
  },
  experienceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  experienceContent: {
    flex: 1,
  },
  experienceLabel: {
    fontSize: 12,
    color: Colors.gray,
    marginBottom: 2,
  },
  experienceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  contactsCard: {
    backgroundColor: Colors.white,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contactsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  contactIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.accent + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactText: {
    fontSize: 13,
    color: Colors.text,
  },
  urgentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error,
    marginHorizontal: 16,
    marginBottom: 80,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  urgentBannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  urgentBannerText: {
    fontSize: 12,
    color: Colors.white + 'CC',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: 'transparent',
  },
  applyButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  applyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  applyButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 4,
  },
  applyButtonSubtitle: {
    fontSize: 11,
    color: Colors.white + 'CC',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalDismiss: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 2,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    gap: 20,
  },
  textAreaWrapper: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray + '20',
    overflow: 'hidden',
  },
  textArea: {
    padding: 16,
    fontSize: 14,
    color: Colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCounter: {
    padding: 8,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: Colors.gray + '10',
  },
  characterCount: {
    fontSize: 12,
  },
  characterCountValid: {
    color: Colors.success,
  },
  characterCountInvalid: {
    color: Colors.error,
  },
  modalTips: {
    backgroundColor: Colors.accent + '05',
    padding: 16,
    borderRadius: 12,
  },
  modalTipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  modalTipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  modalTip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  modalTipText: {
    fontSize: 13,
    color: Colors.gray,
  },
  modalFooter: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray + '30',
  },
  modalCancelText: {
    fontSize: 14,
    color: Colors.gray,
    fontWeight: '600',
  },
  modalSubmitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  modalSubmitButtonDisabled: {
    opacity: 0.5,
  },
  modalSubmitText: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '600',
  },
});