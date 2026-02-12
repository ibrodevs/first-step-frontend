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
import { useInternshipStore } from '../store/internshipStore';
import { useAuthStore } from '../store/authStore';
import { Colors, Theme } from '../constants/colors';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Markdown from 'react-native-markdown-display';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  InternshipDetails: { internshipId: number };
};

type InternshipDetailsScreenRouteProp = RouteProp<RootStackParamList, 'InternshipDetails'>;
type InternshipDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'InternshipDetails'>;

interface Props {
  route: InternshipDetailsScreenRouteProp;
  navigation: InternshipDetailsScreenNavigationProp;
}

// Компонент статистики
const StatBadge: React.FC<{ icon: keyof typeof Feather.glyphMap; value: string; label: string }> = ({ icon, value, label }) => (
  <View style={styles.statBadge}>
    <View style={styles.statBadgeIcon}>
      <Feather name={icon} size={16} color={Colors.accent} />
    </View>
    <View style={styles.statBadgeContent}>
      <Text style={styles.statBadgeValue}>{value}</Text>
      <Text style={styles.statBadgeLabel}>{label}</Text>
    </View>
  </View>
);

// Компонент модального окна отклика
const ApplyModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSubmit: (coverLetter: string) => void;
  isLoading: boolean;
}> = ({ visible, onClose, onSubmit, isLoading }) => {
  const [coverLetter, setCoverLetter] = useState('');
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
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
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View 
        style={[
          styles.modalOverlay,
          { opacity: fadeAnim }
        ]}
      >
        <TouchableOpacity 
          style={styles.modalDismiss}
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <Animated.View 
          style={[
            styles.modalContent,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.modalHeader}
          >
            <View style={styles.modalHeaderLeft}>
              <Feather name="send" size={24} color={Colors.white} />
              <Text style={styles.modalTitle}>Отклик на стажировку</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={Colors.white} />
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.modalBody}>
            <Text style={styles.modalSubtitle}>
              Сопроводительное письмо
            </Text>
            
            <View style={styles.textAreaContainer}>
              <TextInput
                style={styles.textArea}
                placeholder="Расскажите, почему вы подходите для этой стажировки. Укажите ваш опыт, навыки и мотивацию..."
                placeholderTextColor={Colors.gray + '80'}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                value={coverLetter}
                onChangeText={setCoverLetter}
                selectionColor={Colors.accent}
                maxLength={1000}
              />
              
              <View style={styles.characterCounter}>
                <Text style={[
                  styles.characterCount,
                  characterCount >= 50 ? styles.characterCountValid : styles.characterCountInvalid
                ]}>
                  {characterCount}/1000
                </Text>
                {characterCount < 50 && (
                  <Text style={styles.characterHint}>
                    Минимум 50 символов
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.modalTips}>
              <View style={styles.modalTip}>
                <Feather name="check-circle" size={16} color={Colors.success} />
                <Text style={styles.modalTipText}>Опишите релевантный опыт</Text>
              </View>
              <View style={styles.modalTip}>
                <Feather name="check-circle" size={16} color={Colors.success} />
                <Text style={styles.modalTipText}>Объясните вашу мотивацию</Text>
              </View>
              <View style={styles.modalTip}>
                <Feather name="check-circle" size={16} color={Colors.success} />
                <Text style={styles.modalTipText}>Укажите ключевые навыки</Text>
              </View>
            </View>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={onClose}
            >
              <Text style={styles.modalCancelText}>Отмена</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.modalSubmitButton,
                (!isValid || isLoading) && styles.modalSubmitButtonDisabled
              ]}
              onPress={() => onSubmit(coverLetter)}
              disabled={!isValid || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <>
                  <Text style={styles.modalSubmitText}>Отправить</Text>
                  <Feather name="arrow-right" size={18} color={Colors.white} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// Компонент секции с переключением
const ExpandableSection: React.FC<{
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
      <TouchableOpacity 
        style={styles.sectionHeader} 
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.sectionHeaderLeft}>
          <View style={styles.sectionIcon}>
            <Feather name={icon} size={20} color={Colors.accent} />
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

export const InternshipDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { internshipId } = route.params;
  const { currentInternship, isLoading, fetchInternshipById, applyToInternship } = useInternshipStore();
  const { user } = useAuthStore();

  // Состояния
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [applying, setApplying] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'requirements' | 'company'>('overview');
  
  // Анимации
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetchInternshipById(internshipId);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.2)),
      }),
    ]).start();
  }, [internshipId]);

  // Анимация заголовка
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100, 200],
    outputRange: [1, 0.8, 0],
    extrapolate: 'clamp',
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -100],
    extrapolate: 'clamp',
  });

  // Мемоизированные данные
  const daysUntilDeadline = useMemo(() => {
    if (!currentInternship?.deadline) return null;
    const deadline = new Date(currentInternship.deadline);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
        message: `Стажировка: ${currentInternship?.title} в ${currentInternship?.employer.companyName}\n\n${currentInternship?.description}\n\nПодробнее в приложении StageLink`,
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
      
      Alert.alert(
        '✓ Заявка отправлена!',
        'Работодатель рассмотрит вашу кандидацию в ближайшее время. Вы получите уведомление о решении.',
        [
          { 
            text: 'Отлично', 
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Ошибка',
        error.response?.data?.message || 'Не удалось отправить заявку. Попробуйте позже.'
      );
    } finally {
      setApplying(false);
    }
  }, [internshipId]);

  if (isLoading || !currentInternship) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[Colors.background, Colors.lightAccent]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>Загрузка информации</Text>
          <Text style={styles.loadingSubText}>о стажировке...</Text>
        </View>
      </View>
    );
  }

  const status = formatStatus[currentInternship.status] || formatStatus.active;
  const isExpired = new Date(currentInternship.deadline) < new Date();
  const canApply = user?.role === 'student' && 
                   currentInternship.status === 'active' && 
                   !isExpired;

  return (
    <>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        {/* Анимированный хедер */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: headerOpacity,
              transform: [{ translateY: headerTranslateY }]
            }
          ]}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => navigation.goBack()}
              >
                <Feather name="arrow-left" size={24} color={Colors.white} />
              </TouchableOpacity>
              
              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {currentInternship.title}
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={handleShare}
              >
                <Feather name="share-2" size={22} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          {/* Hero секция */}
          <Animated.View 
            style={[
              styles.heroSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <View style={styles.heroContent}>
                <View style={styles.heroHeader}>
                  <View style={styles.heroBadgeContainer}>
                    <View style={[styles.heroBadge, { backgroundColor: Colors.white + '20' }]}>
                      <Feather name={status.icon} size={14} color={Colors.white} />
                      <Text style={styles.heroBadgeText}>{status.text}</Text>
                    </View>
                    
                    <View style={[styles.heroBadge, { backgroundColor: Colors.white + '20' }]}>
                      <Text style={styles.heroBadgeText}>
                        ID: {currentInternship.id}
                      </Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity style={styles.favoriteButton}>
                    <Feather name="heart" size={24} color={Colors.white} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.heroTitle}>{currentInternship.title}</Text>
                
                <View style={styles.heroCompany}>
                  <View style={styles.heroCompanyLogo}>
                    <Text style={styles.heroCompanyInitial}>
                      {currentInternship.employer.companyName.charAt(0)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.heroCompanyName}>
                      {currentInternship.employer.companyName}
                    </Text>
                    <View style={styles.heroCompanyRating}>
                      <Feather name="star" size={14} color={Colors.warning} />
                      <Feather name="star" size={14} color={Colors.warning} />
                      <Feather name="star" size={14} color={Colors.warning} />
                      <Feather name="star" size={14} color={Colors.warning} />
                      <Feather name="star" size={14} color={Colors.warning + '80'} />
                      <Text style={styles.heroCompanyRatingText}>4.8</Text>
                    </View>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Статистика */}
          <View style={styles.statsGrid}>
            <StatBadge 
              icon="users" 
              value="24" 
              label="Откликов" 
            />
            <StatBadge 
              icon="eye" 
              value="156" 
              label="Просмотров" 
            />
            <StatBadge 
              icon="clock" 
              value={daysUntilDeadline ? `${daysUntilDeadline} дн.` : '—'} 
              label="Дедлайн" 
            />
          </View>

          {/* Информационные карточки */}
          <View style={styles.infoCards}>
            <View style={styles.infoCard}>
              <View style={[styles.infoCardIcon, { backgroundColor: Colors.accent + '15' }]}>
                <Feather name="map-pin" size={20} color={Colors.accent} />
              </View>
              <View style={styles.infoCardContent}>
                <Text style={styles.infoCardLabel}>Локация</Text>
                <Text style={styles.infoCardValue}>{currentInternship.city}</Text>
              </View>
            </View>
            
            <View style={styles.infoCard}>
              <View style={[styles.infoCardIcon, { backgroundColor: Colors.accent + '15' }]}>
                <Text style={styles.infoCardEmoji}>{formatIcon[currentInternship.format]}</Text>
              </View>
              <View style={styles.infoCardContent}>
                <Text style={styles.infoCardLabel}>Формат работы</Text>
                <Text style={styles.infoCardValue}>{formatLabel[currentInternship.format]}</Text>
              </View>
            </View>
            
            <View style={styles.infoCard}>
              <View style={[styles.infoCardIcon, { backgroundColor: Colors.accent + '15' }]}>
                <Feather name="clock" size={20} color={Colors.accent} />
              </View>
              <View style={styles.infoCardContent}>
                <Text style={styles.infoCardLabel}>Длительность</Text>
                <Text style={styles.infoCardValue}>{currentInternship.duration}</Text>
              </View>
            </View>
          </View>

          {/* Дедлайн предупреждение */}
          {deadlineStatus === 'urgent' && (
            <View style={styles.urgentBanner}>
              <Feather name="alert-triangle" size={20} color={Colors.white} />
              <View style={styles.urgentBannerContent}>
                <Text style={styles.urgentBannerTitle}>Срочно! Дедлайн через {daysUntilDeadline} дня</Text>
                <Text style={styles.urgentBannerText}>Успейте подать заявку</Text>
              </View>
            </View>
          )}

          {deadlineStatus === 'expired' && (
            <View style={styles.expiredBanner}>
              <Feather name="clock" size={20} color={Colors.white} />
              <View style={styles.urgentBannerContent}>
                <Text style={styles.urgentBannerTitle}>Дедлайн истек</Text>
                <Text style={styles.urgentBannerText}>Набор на эту стажировку завершен</Text>
              </View>
            </View>
          )}

          {/* Табы */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
              onPress={() => setActiveTab('overview')}
            >
              <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
                Обзор
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'requirements' && styles.tabActive]}
              onPress={() => setActiveTab('requirements')}
            >
              <Text style={[styles.tabText, activeTab === 'requirements' && styles.tabTextActive]}>
                Требования
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'company' && styles.tabActive]}
              onPress={() => setActiveTab('company')}
            >
              <Text style={[styles.tabText, activeTab === 'company' && styles.tabTextActive]}>
                Компания
              </Text>
            </TouchableOpacity>
          </View>

          {/* Контент табов */}
          {activeTab === 'overview' && (
            <View style={styles.tabContent}>
              {/* Описание */}
              <ExpandableSection title="Описание стажировки" icon="file-text">
                <Text style={styles.sectionText}>
                  {currentInternship.description}
                </Text>
              </ExpandableSection>

              {/* Задачи */}
              <ExpandableSection title="Задачи и обязанности" icon="briefcase">
                <Text style={styles.sectionText}>
                  {currentInternship.responsibilities || 'Не указаны'}
                </Text>
              </ExpandableSection>

              {/* Условия работы */}
              <View style={styles.conditionsGrid}>
                <View style={styles.conditionItem}>
                  <Feather name="dollar-sign" size={18} color={Colors.accent} />
                  <Text style={styles.conditionLabel}>Оплата</Text>
                  <Text style={styles.conditionValue}>
                    {currentInternship.isPaid ? 'Оплачиваемая' : 'Без оплаты'}
                  </Text>
                  {currentInternship.salary && (
                    <Text style={styles.conditionDetail}>
                      от {currentInternship.salary} ₽
                    </Text>
                  )}
                </View>
                
                <View style={styles.conditionItem}>
                  <Feather name="calendar" size={18} color={Colors.accent} />
                  <Text style={styles.conditionLabel}>Начало</Text>
                  <Text style={styles.conditionValue}>
                    {currentInternship.startDate 
                      ? new Date(currentInternship.startDate).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })
                      : 'Гибкое'}
                  </Text>
                </View>
                
                <View style={styles.conditionItem}>
                  <Feather name="users" size={18} color={Colors.accent} />
                  <Text style={styles.conditionLabel}>Набор</Text>
                  <Text style={styles.conditionValue}>
                    {currentInternship.positions || 1} мест
                  </Text>
                </View>
              </View>
            </View>
          )}

          {activeTab === 'requirements' && (
            <View style={styles.tabContent}>
              {/* Требования */}
              <ExpandableSection title="Ключевые требования" icon="check-circle">
                <Text style={styles.sectionText}>
                  {currentInternship.requirements}
                </Text>
              </ExpandableSection>

              {/* Навыки */}
              <View style={styles.skillsWrapper}>
                <View style={styles.skillsHeader}>
                  <Feather name="code" size={18} color={Colors.accent} />
                  <Text style={styles.skillsHeaderText}>Необходимые навыки</Text>
                  <View style={styles.skillsCount}>
                    <Text style={styles.skillsCountText}>{currentInternship.skills.length}</Text>
                  </View>
                </View>
                <View style={styles.skillsContainer}>
                  {currentInternship.skills.map((skill, index) => (
                    <View key={index} style={styles.skillTag}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Опыт */}
              <View style={styles.experienceCard}>
                <View style={styles.experienceHeader}>
                  <Feather name="award" size={20} color={Colors.accent} />
                  <Text style={styles.experienceTitle}>Опыт работы</Text>
                </View>
                <Text style={styles.experienceValue}>
                  {currentInternship.experience || 'Без опыта'}
                </Text>
              </View>
            </View>
          )}

          {activeTab === 'company' && (
            <View style={styles.tabContent}>
              {/* О компании */}
              <ExpandableSection title="О компании" icon="info">
                <Text style={styles.sectionText}>
                  {currentInternship.employer.description}
                </Text>
              </ExpandableSection>

              {/* Контакты */}
              <View style={styles.contactsCard}>
                <Text style={styles.contactsTitle}>Контакты</Text>
                
                {currentInternship.employer.website && (
                  <TouchableOpacity style={styles.contactRow}>
                    <View style={styles.contactIcon}>
                      <Feather name="globe" size={16} color={Colors.accent} />
                    </View>
                    <Text style={styles.contactText}>{currentInternship.employer.website}</Text>
                  </TouchableOpacity>
                )}
                
                {currentInternship.employer.email && (
                  <TouchableOpacity style={styles.contactRow}>
                    <View style={styles.contactIcon}>
                      <Feather name="mail" size={16} color={Colors.accent} />
                    </View>
                    <Text style={styles.contactText}>{currentInternship.employer.email}</Text>
                  </TouchableOpacity>
                )}
                
                {currentInternship.employer.phone && (
                  <TouchableOpacity style={styles.contactRow}>
                    <View style={styles.contactIcon}>
                      <Feather name="phone" size={16} color={Colors.accent} />
                    </View>
                    <Text style={styles.contactText}>{currentInternship.employer.phone}</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Социальные сети */}
              <View style={styles.socialLinks}>
                <Text style={styles.socialTitle}>Мы в соцсетях</Text>
                <View style={styles.socialIcons}>
                  <TouchableOpacity style={styles.socialIcon}>
                    <Feather name="linkedin" size={22} color={Colors.gray} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialIcon}>
                    <Feather name="twitter" size={22} color={Colors.gray} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialIcon}>
                    <Feather name="facebook" size={22} color={Colors.gray} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialIcon}>
                    <Feather name="instagram" size={22} color={Colors.gray} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Метки/теги */}
          {currentInternship.tags && currentInternship.tags.length > 0 && (
            <View style={styles.tagsWrapper}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tagsContainer}
              >
                {currentInternship.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Дополнительная информация */}
          {currentInternship.benefits && (
            <View style={styles.benefitsCard}>
              <LinearGradient
                colors={[Colors.success + '10', Colors.success + '05']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.benefitsGradient}
              >
                <View style={styles.benefitsHeader}>
                  <Feather name="gift" size={20} color={Colors.success} />
                  <Text style={styles.benefitsTitle}>Преимущества стажировки</Text>
                </View>
                <Text style={styles.benefitsText}>{currentInternship.benefits}</Text>
              </LinearGradient>
            </View>
          )}

          {/* Похожие стажировки */}
          <View style={styles.similarSection}>
            <Text style={styles.similarTitle}>Похожие стажировки</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.similarContainer}
            >
              {[1, 2, 3].map((item) => (
                <TouchableOpacity key={item} style={styles.similarCard}>
                  <View style={styles.similarCardHeader}>
                    <Text style={styles.similarCardTitle}>UX/UI Designer</Text>
                    <Text style={styles.similarCardCompany}>TechCorp</Text>
                  </View>
                  <View style={styles.similarCardFooter}>
                    <Text style={styles.similarCardCity}>Москва</Text>
                    <Text style={styles.similarCardSalary}>от 50 000 ₽</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Animated.ScrollView>

        {/* Футер с кнопкой */}
        {canApply && (
          <Animated.View 
            style={[
              styles.footer,
              { transform: [{ scale: buttonScaleAnim }] }
            ]}
          >
            <LinearGradient
              colors={[Colors.accent, Colors.accent + 'CC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.applyButton}
            >
              <TouchableOpacity
                style={styles.applyButtonTouchable}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setApplyModalVisible(true);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.applyButtonContent}>
                  <View>
                    <Text style={styles.applyButtonTitle}>Откликнуться на стажировку</Text>
                    <Text style={styles.applyButtonSubtitle}>
                      Дедлайн: {new Date(currentInternship.deadline).toLocaleDateString('ru-RU')}
                    </Text>
                  </View>
                  <Feather name="send" size={24} color={Colors.white} />
                </View>
              </TouchableOpacity>
            </LinearGradient>
            
            <Text style={styles.footerHint}>
              ⚡ 92% работодателей отвечают в течение 3 дней
            </Text>
          </Animated.View>
        )}

        {/* Футер для работодателя */}
        {user?.role === 'employer' && user.id === currentInternship.employerId && (
          <View style={styles.employerFooter}>
            <TouchableOpacity 
              style={styles.employerStatButton}
              onPress={() => navigation.navigate('Applications', { internshipId })}
            >
              <View style={styles.employerStatIcon}>
                <Feather name="users" size={20} color={Colors.accent} />
              </View>
              <View>
                <Text style={styles.employerStatValue}>24</Text>
                <Text style={styles.employerStatLabel}>Откликов</Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.employerActions}>
              <TouchableOpacity style={styles.employerEditButton}>
                <Feather name="edit-2" size={18} color={Colors.white} />
                <Text style={styles.employerEditText}>Редактировать</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.employerMoreButton}>
                <Feather name="more-vertical" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>

      {/* Модальное окно отклика */}
      <ApplyModal
        visible={applyModalVisible}
        onClose={() => setApplyModalVisible(false)}
        onSubmit={handleApply}
        isLoading={applying}
      />
    </>
  );
};

// Константы форматов
const formatStatus = {
  active: { text: 'Активна', color: Colors.success, icon: 'check-circle' },
  closed: { text: 'Закрыта', color: Colors.error, icon: 'x-circle' },
  draft: { text: 'Черновик', color: Colors.warning, icon: 'edit' }
};

const formatIcon = {
  online: '💻',
  offline: '🏢',
  hybrid: '🔄'
};

const formatLabel = {
  online: 'Удаленная работа',
  offline: 'Работа в офисе',
  hybrid: 'Гибридный формат'
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Theme.spacing.lg,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
  },
  loadingSubText: {
    marginTop: Theme.spacing.sm,
    fontSize: 14,
    color: Colors.gray,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerGradient: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: Theme.spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: Theme.spacing.md,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 120,
  },
  heroSection: {
    marginBottom: Theme.spacing.lg,
  },
  heroGradient: {
    paddingTop: (StatusBar.currentHeight || 44) + 20,
    paddingBottom: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.xl,
  },
  heroContent: {
    marginTop: Theme.spacing.lg,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  heroBadgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  heroBadgeText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '600',
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: Theme.spacing.lg,
    lineHeight: 40,
  },
  heroCompany: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroCompanyLogo: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCompanyInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  heroCompanyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  heroCompanyRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  heroCompanyRatingText: {
    fontSize: 12,
    color: Colors.white,
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    gap: Theme.spacing.sm,
  },
  statBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.medium,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statBadgeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  statBadgeContent: {
    flex: 1,
  },
  statBadgeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statBadgeLabel: {
    fontSize: 10,
    color: Colors.gray,
    marginTop: 2,
  },
  infoCards: {
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    gap: 8,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.medium,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  infoCardEmoji: {
    fontSize: 24,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardLabel: {
    fontSize: 11,
    color: Colors.gray,
    marginBottom: 2,
  },
  infoCardValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  urgentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error,
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.medium,
    gap: 12,
  },
  expiredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray,
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.medium,
    gap: 12,
  },
  urgentBannerContent: {
    flex: 1,
  },
  urgentBannerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 2,
  },
  urgentBannerText: {
    fontSize: 12,
    color: Colors.white + 'CC',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: Theme.borderRadius.medium,
    backgroundColor: Colors.white,
  },
  tabActive: {
    backgroundColor: Colors.accent,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  tabTextActive: {
    color: Colors.white,
  },
  tabContent: {
    paddingHorizontal: Theme.spacing.lg,
  },
  section: {
    backgroundColor: Colors.white,
    marginBottom: Theme.spacing.md,
    borderRadius: Theme.borderRadius.large,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.md,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.accent + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  sectionContent: {
    padding: Theme.spacing.md,
    paddingTop: 0,
  },
  sectionText: {
    fontSize: 15,
    color: Colors.gray,
    lineHeight: 22,
  },
  conditionsGrid: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginBottom: Theme.spacing.md,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.large,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  conditionItem: {
    flex: 1,
    alignItems: 'center',
  },
  conditionLabel: {
    fontSize: 11,
    color: Colors.gray,
    marginTop: 4,
  },
  conditionValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 2,
  },
  conditionDetail: {
    fontSize: 11,
    color: Colors.accent,
    marginTop: 2,
  },
  skillsWrapper: {
    backgroundColor: Colors.white,
    marginBottom: Theme.spacing.md,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.large,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  skillsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  skillsHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginLeft: 8,
    flex: 1,
  },
  skillsCount: {
    backgroundColor: Colors.accent + '10',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillsCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accent,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: Colors.accent + '10',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skillText: {
    fontSize: 13,
    color: Colors.accent,
    fontWeight: '600',
  },
  experienceCard: {
    backgroundColor: Colors.white,
    marginBottom: Theme.spacing.md,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.large,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  experienceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  experienceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 8,
  },
  experienceValue: {
    fontSize: 14,
    color: Colors.gray,
  },
  contactsCard: {
    backgroundColor: Colors.white,
    marginBottom: Theme.spacing.md,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.large,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contactsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Theme.spacing.md,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  contactIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.accent + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactText: {
    fontSize: 14,
    color: Colors.primary,
  },
  socialLinks: {
    backgroundColor: Colors.white,
    marginBottom: Theme.spacing.md,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.large,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  socialTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray,
    marginBottom: Theme.spacing.md,
  },
  socialIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  socialIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gray + '05',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsWrapper: {
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  tagsContainer: {
    paddingRight: Theme.spacing.lg,
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gray + '20',
  },
  tagText: {
    fontSize: 13,
    color: Colors.gray,
  },
  benefitsCard: {
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  benefitsGradient: {
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.large,
  },
  benefitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.success,
    marginLeft: 8,
  },
  benefitsText: {
    fontSize: 14,
    color: Colors.gray,
    lineHeight: 20,
  },
  similarSection: {
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  similarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Theme.spacing.md,
  },
  similarContainer: {
    paddingRight: Theme.spacing.lg,
    gap: 12,
  },
  similarCard: {
    width: 200,
    backgroundColor: Colors.white,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.large,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  similarCardHeader: {
    marginBottom: 8,
  },
  similarCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  similarCardCompany: {
    fontSize: 12,
    color: Colors.accent,
  },
  similarCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  similarCardCity: {
    fontSize: 11,
    color: Colors.gray,
  },
  similarCardSalary: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray + '10',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 10,
  },
  applyButton: {
    borderRadius: Theme.borderRadius.large,
    overflow: 'hidden',
  },
  applyButtonTouchable: {
    paddingVertical: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.lg,
  },
  applyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  applyButtonTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  applyButtonSubtitle: {
    color: Colors.white + 'CC',
    fontSize: 12,
  },
  footerHint: {
    textAlign: 'center',
    fontSize: 11,
    color: Colors.gray,
    marginTop: Theme.spacing.sm,
  },
  employerFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray + '10',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 10,
  },
  employerStatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  employerStatIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.accent + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  employerStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  employerStatLabel: {
    fontSize: 11,
    color: Colors.gray,
    marginTop: 2,
  },
  employerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  employerEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Theme.borderRadius.medium,
    gap: 8,
  },
  employerEditText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  employerMoreButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.gray + '05',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.lg,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  modalBody: {
    padding: Theme.spacing.lg,
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: Theme.spacing.sm,
  },
  textAreaContainer: {
    marginBottom: Theme.spacing.md,
  },
  textArea: {
    borderWidth: 1,
    borderColor: Colors.gray + '20',
    borderRadius: Theme.borderRadius.medium,
    padding: Theme.spacing.md,
    fontSize: 15,
    color: Colors.primary,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCounter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
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
  characterHint: {
    fontSize: 11,
    color: Colors.error,
  },
  modalTips: {
    backgroundColor: Colors.accent + '05',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.medium,
    gap: 8,
  },
  modalTip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTipText: {
    fontSize: 13,
    color: Colors.gray,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.gray + '10',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: Theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.gray + '30',
  },
  modalCancelText: {
    fontSize: 15,
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
    borderRadius: Theme.borderRadius.medium,
    gap: 8,
  },
  modalSubmitButtonDisabled: {
    opacity: 0.5,
  },
  modalSubmitText: {
    fontSize: 15,
    color: Colors.white,
    fontWeight: '600',
  },
});

// Добавляем недостающие цвета
Colors.lightAccent = Colors.accent + '10';
Colors.success = '#34C759';
Colors.warning = '#FF9500';
Colors.error = '#FF3B30';