import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInternshipStore } from '../store/internshipStore';
import { useAuthStore } from '../store/authStore';
import { Colors, Theme } from '../constants/colors';
import { Internship } from '../types';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

// Типы и интерфейсы
type ViewMode = 'grid' | 'list';
type SortOption = 'date' | 'popularity' | 'salary' | 'deadline';
type FilterPreset = 'all' | 'paid' | 'online' | 'today' | 'week';

interface InternshipCardProps {
  internship: Internship;
  onPress: () => void;
  index: number;
  viewMode: ViewMode;
}

interface FilterState {
  search: string;
  city: string | null;
  format: string | null;
  isPaid: boolean | null;
  sortBy: SortOption;
  viewMode: ViewMode;
}

// Компонент карточки стажировки
const InternshipCard: React.FC<InternshipCardProps> = ({ internship, onPress, index, viewMode }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const daysUntilDeadline = useMemo(() => {
    const deadline = new Date(internship.deadline);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [internship.deadline]);

  const getDeadlineStatus = () => {
    if (daysUntilDeadline < 0) return 'expired';
    if (daysUntilDeadline <= 3) return 'urgent';
    if (daysUntilDeadline <= 7) return 'soon';
    return 'normal';
  };

  const deadlineStatus = getDeadlineStatus();

  if (viewMode === 'grid') {
    return (
      <Animated.View
        style={[
          styles.gridCardWrapper,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.gridCard} 
          onPress={onPress}
          activeOpacity={0.7}
          onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gridCardHeader}
          >
            <Text style={styles.gridCardTitle} numberOfLines={2}>
              {internship.title}
            </Text>
            <View style={styles.gridBadge}>
              <Text style={styles.gridBadgeText}>
                {internship.isPaid ? '💰' : '🎓'}
              </Text>
            </View>
          </LinearGradient>

          <View style={styles.gridCardContent}>
            <View style={styles.gridCompany}>
              <Feather name="briefcase" size={12} color={Colors.accent} />
              <Text style={styles.gridCompanyName} numberOfLines={1}>
                {internship.employer.companyName}
              </Text>
            </View>

            <View style={styles.gridInfo}>
              <View style={styles.gridInfoItem}>
                <Feather name="map-pin" size={12} color={Colors.gray} />
                <Text style={styles.gridInfoText}>{internship.city}</Text>
              </View>
              <View style={styles.gridInfoItem}>
                <Text style={styles.gridInfoEmoji}>
                  {internship.format === 'online' ? '💻' : internship.format === 'offline' ? '🏢' : '🔄'}
                </Text>
                <Text style={styles.gridInfoText}>
                  {internship.format === 'online' ? 'Удал.' : internship.format === 'offline' ? 'Офис' : 'Гибрид'}
                </Text>
              </View>
            </View>

            <View style={styles.gridDeadline}>
              <Feather 
                name="clock" 
                size={12} 
                color={
                  deadlineStatus === 'urgent' ? Colors.error :
                  deadlineStatus === 'soon' ? Colors.warning :
                  Colors.gray
                } 
              />
              <Text style={[
                styles.gridDeadlineText,
                deadlineStatus === 'urgent' && styles.urgentText,
                deadlineStatus === 'soon' && styles.soonText,
              ]}>
                {daysUntilDeadline < 0 ? 'Завершена' : 
                 daysUntilDeadline === 0 ? 'Сегодня' :
                 `${daysUntilDeadline} ${getDaysWord(daysUntilDeadline)}`}
              </Text>
            </View>

            <View style={styles.gridSkills}>
              {internship.skills.slice(0, 2).map((skill, idx) => (
                <View key={idx} style={styles.gridSkillTag}>
                  <Text style={styles.gridSkillText}>{skill}</Text>
                </View>
              ))}
              {internship.skills.length > 2 && (
                <Text style={styles.gridMoreSkills}>+{internship.skills.length - 2}</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.card} 
        onPress={onPress}
        activeOpacity={0.7}
        onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      >
        <LinearGradient
          colors={[Colors.primary, Colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cardAccent}
        />
        
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {internship.title}
            </Text>
            <View style={styles.companyRow}>
              <Feather name="briefcase" size={14} color={Colors.accent} />
              <Text style={styles.companyName}>{internship.employer.companyName}</Text>
            </View>
          </View>
          
          <View style={styles.badgeContainer}>
            <View style={[styles.badge, internship.isPaid ? styles.paidBadge : styles.unpaidBadge]}>
              <Text style={styles.badgeText}>
                {internship.isPaid ? 'Оплачиваемая' : 'Без оплаты'}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.cardDescription} numberOfLines={2}>
          {internship.description}
        </Text>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Feather name="map-pin" size={16} color={Colors.accent} />
            <Text style={styles.infoText}>{internship.city}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>
              {internship.format === 'online' ? '💻' : 
               internship.format === 'offline' ? '🏢' : '🔄'}
            </Text>
            <Text style={styles.infoText}>
              {internship.format === 'online' ? 'Удаленно' :
               internship.format === 'offline' ? 'В офисе' : 'Гибрид'}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Feather name="clock" size={16} color={Colors.accent} />
            <Text style={styles.infoText}>{internship.duration}</Text>
          </View>
        </View>

        <View style={styles.skillsSection}>
          <Text style={styles.skillsTitle}>Требуемые навыки:</Text>
          <View style={styles.skillsContainer}>
            {internship.skills.slice(0, 3).map((skill, idx) => (
              <View key={idx} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
            {internship.skills.length > 3 && (
              <View style={styles.moreSkillsTag}>
                <Text style={styles.moreSkillsText}>+{internship.skills.length - 3}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.deadlineContainer}>
            <Feather 
              name="calendar" 
              size={14} 
              color={
                deadlineStatus === 'urgent' ? Colors.error :
                deadlineStatus === 'soon' ? Colors.warning :
                Colors.gray
              } 
            />
            <Text style={[
              styles.deadlineText,
              deadlineStatus === 'urgent' && styles.urgentText,
              deadlineStatus === 'soon' && styles.soonText,
            ]}>
              {daysUntilDeadline < 0 ? 'Дедлайн истек' :
               daysUntilDeadline === 0 ? 'Дедлайн сегодня' :
               `${daysUntilDeadline} ${getDaysWord(daysUntilDeadline)}`}
            </Text>
          </View>
          
          <View style={styles.applyButton}>
            <Text style={styles.applyButtonText}>Подробнее</Text>
            <Feather name="arrow-right" size={16} color={Colors.accent} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Компонент фильтра
const FilterChip: React.FC<{
  label: string;
  icon?: keyof typeof Feather.glyphMap;
  active: boolean;
  onPress: () => void;
}> = ({ label, icon, active, onPress }) => (
  <TouchableOpacity
    style={[styles.filterChip, active && styles.filterChipActive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    {icon && (
      <Feather 
        name={icon} 
        size={16} 
        color={active ? Colors.white : Colors.gray} 
        style={styles.filterChipIcon}
      />
    )}
    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// Компонент сортировки
const SortModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  selectedSort: SortOption;
  onSelect: (sort: SortOption) => void;
}> = ({ visible, onClose, selectedSort, onSelect }) => {
  const sortOptions: { value: SortOption; label: string; icon: keyof typeof Feather.glyphMap }[] = [
    { value: 'date', label: 'По дате', icon: 'calendar' },
    { value: 'popularity', label: 'По популярности', icon: 'trending-up' },
    { value: 'salary', label: 'По зарплате', icon: 'dollar-sign' },
    { value: 'deadline', label: 'По дедлайну', icon: 'clock' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <LinearGradient
            colors={[Colors.primary, Colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.modalHeader}
          >
            <Text style={styles.modalTitle}>Сортировка</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={Colors.white} />
            </TouchableOpacity>
          </LinearGradient>
          
          <View style={styles.modalBody}>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.sortOption}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <View style={styles.sortOptionLeft}>
                  <Feather 
                    name={option.icon} 
                    size={20} 
                    color={selectedSort === option.value ? Colors.accent : Colors.gray} 
                  />
                  <Text style={[
                    styles.sortOptionText,
                    selectedSort === option.value && styles.sortOptionTextActive
                  ]}>
                    {option.label}
                  </Text>
                </View>
                {selectedSort === option.value && (
                  <Feather name="check" size={20} color={Colors.accent} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export const HomeScreen: React.FC = ({ navigation }: any) => {
  const {
    internships,
    isLoading,
    fetchInternships,
    applyFilters,
    filters,
  } = useInternshipStore();
  
  const { user } = useAuthStore();
  
  // Состояния
  const [filterState, setFilterState] = useState<FilterState>({
    search: '',
    city: null,
    format: null,
    isPaid: null,
    sortBy: 'date',
    viewMode: 'list',
  });
  
  const [activePreset, setActivePreset] = useState<FilterPreset>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showCityFilter, setShowCityFilter] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = useRef(new Animated.Value(1)).current;

  // Мемоизированные данные
  const filteredInternships = useMemo(() => {
    let filtered = [...internships];
    
    // Применяем сортировку
    switch (filterState.sortBy) {
      case 'date':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'deadline':
        filtered.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
        break;
      case 'salary':
        filtered.sort((a, b) => (b.salary || 0) - (a.salary || 0));
        break;
    }
    
    return filtered;
  }, [internships, filterState.sortBy]);

  // Получаем список городов
  useEffect(() => {
    const uniqueCities = Array.from(new Set(internships.map(i => i.city)));
    setCities(uniqueCities);
  }, [internships]);

  useEffect(() => {
    fetchInternships();
  }, []);

  const handleSearch = useCallback(() => {
    applyFilters({ ...filters, search: filterState.search });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [filterState.search, filters, applyFilters]);

  const handleRefresh = async () => {
    setRefreshing(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await fetchInternships();
    setRefreshing(false);
  };

  const handlePresetPress = (preset: FilterPreset) => {
    setActivePreset(preset);
    
    let newFilters = { ...filters };
    
    switch (preset) {
      case 'paid':
        newFilters.isPaid = true;
        newFilters.format = undefined;
        break;
      case 'online':
        newFilters.format = 'online';
        newFilters.isPaid = undefined;
        break;
      case 'today':
        // Фильтр на сегодня
        break;
      case 'week':
        // Фильтр на неделю
        break;
      default:
        newFilters.isPaid = undefined;
        newFilters.format = undefined;
        newFilters.search = '';
        setFilterState(prev => ({ ...prev, search: '' }));
    }
    
    applyFilters(newFilters);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleViewMode = () => {
    setFilterState(prev => ({ 
      ...prev, 
      viewMode: prev.viewMode === 'list' ? 'grid' : 'list' 
    }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.header,
        {
          opacity: scrollY.interpolate({
            inputRange: [0, 100],
            outputRange: [1, 0.95],
            extrapolate: 'clamp',
          }),
          transform: [{
            translateY: scrollY.interpolate({
              inputRange: [0, 100],
              outputRange: [0, -10],
              extrapolate: 'clamp',
            })
          }]
        }
      ]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Верхняя панель */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greetingText}>Добро пожаловать,</Text>
          <Text style={styles.userName}>{user?.name || user?.email.split('@')[0]}</Text>
        </View>
        
        <View style={styles.topBarActions}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={toggleViewMode}
          >
            <Feather 
              name={filterState.viewMode === 'grid' ? 'grid' : 'list'} 
              size={22} 
              color={Colors.primary} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setShowSortModal(true)}
          >
            <Feather name="sliders" size={22} color={Colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.profileGradient}
            >
              <Text style={styles.profileInitial}>
                {user?.email.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Поисковая строка */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color={Colors.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск стажировок по названию или компании"
            placeholderTextColor={Colors.gray + '80'}
            value={filterState.search}
            onChangeText={(text) => setFilterState(prev => ({ ...prev, search: text }))}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            selectionColor={Colors.accent}
          />
          {filterState.search.length > 0 && (
            <TouchableOpacity 
              onPress={() => {
                setFilterState(prev => ({ ...prev, search: '' }));
                applyFilters({ ...filters, search: '' });
              }}
            >
              <Feather name="x" size={20} color={Colors.gray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Быстрые фильтры */}
      <View style={styles.quickFiltersSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickFiltersContainer}
        >
          <FilterChip
            label="Все"
            icon="globe"
            active={activePreset === 'all'}
            onPress={() => handlePresetPress('all')}
          />
          <FilterChip
            label="Оплачиваемые"
            icon="dollar-sign"
            active={activePreset === 'paid'}
            onPress={() => handlePresetPress('paid')}
          />
          <FilterChip
            label="Удаленно"
            icon="wifi"
            active={activePreset === 'online'}
            onPress={() => handlePresetPress('online')}
          />
          <FilterChip
            label="Сегодня"
            icon="sun"
            active={activePreset === 'today'}
            onPress={() => handlePresetPress('today')}
          />
          <FilterChip
            label="Эта неделя"
            icon="calendar"
            active={activePreset === 'week'}
            onPress={() => handlePresetPress('week')}
          />
        </ScrollView>
      </View>

      {/* Город фильтр */}
      {cities.length > 0 && (
        <View style={styles.citySection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cityContainer}
          >
            <TouchableOpacity
              style={[styles.cityChip, !filterState.city && styles.cityChipActive]}
              onPress={() => setFilterState(prev => ({ ...prev, city: null }))}
            >
              <Text style={[styles.cityChipText, !filterState.city && styles.cityChipTextActive]}>
                Все города
              </Text>
            </TouchableOpacity>
            
            {cities.slice(0, 5).map((city) => (
              <TouchableOpacity
                key={city}
                style={[styles.cityChip, filterState.city === city && styles.cityChipActive]}
                onPress={() => setFilterState(prev => ({ ...prev, city }))}
              >
                <Text style={[styles.cityChipText, filterState.city === city && styles.cityChipTextActive]}>
                  {city}
                </Text>
              </TouchableOpacity>
            ))}
            
            {cities.length > 5 && (
              <TouchableOpacity 
                style={styles.moreCitiesChip}
                onPress={() => setShowCityFilter(true)}
              >
                <Text style={styles.moreCitiesText}>+{cities.length - 5}</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      )}

      {/* Статистика */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          Найдено <Text style={styles.statsNumber}>{filteredInternships.length}</Text> {getDeclension(filteredInternships.length)}
        </Text>
        <Text style={styles.statsUpdate}>
          Обновлено только что
        </Text>
      </View>
    </Animated.View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={[Colors.lightAccent, Colors.white]}
        style={styles.emptyGradient}
      >
        <View style={styles.emptyIconContainer}>
          <Feather name="inbox" size={64} color={Colors.gray} />
        </View>
        <Text style={styles.emptyText}>Стажировки не найдены</Text>
        <Text style={styles.emptySubText}>
          Попробуйте изменить параметры поиска{'\n'}
          или расширить географию поиска
        </Text>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => {
            setActivePreset('all');
            setFilterState(prev => ({ 
              ...prev, 
              search: '', 
              city: null,
              format: null,
              isPaid: null 
            }));
            applyFilters({});
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
        >
          <Text style={styles.resetButtonText}>Сбросить все фильтры</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  const renderFooter = () => {
    if (isLoading && internships.length > 0) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={Colors.accent} />
          <Text style={styles.footerText}>Загрузка новых предложений...</Text>
        </View>
      );
    }
    return null;
  };

  if (isLoading && internships.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[Colors.background, Colors.lightAccent]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>Загрузка стажировок</Text>
          <Text style={styles.loadingSubText}>Анализируем лучшие предложения для вас</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={filteredInternships}
        renderItem={({ item, index }) => (
          <InternshipCard
            internship={item}
            onPress={() => {
              navigation.navigate('InternshipDetails', { internshipId: item.id });
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            index={index}
            viewMode={filterState.viewMode}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        key={filterState.viewMode}
        numColumns={filterState.viewMode === 'grid' ? 2 : 1}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.accent]}
            tintColor={Colors.accent}
            progressViewOffset={20}
          />
        }
      />

      <SortModal
        visible={showSortModal}
        onClose={() => setShowSortModal(false)}
        selectedSort={filterState.sortBy}
        onSelect={(sort) => setFilterState(prev => ({ ...prev, sortBy: sort }))}
      />
    </SafeAreaView>
  );
};

// Вспомогательные функции
const getDaysWord = (days: number): string => {
  if (days % 10 === 1 && days % 100 !== 11) return 'день';
  if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100)) return 'дня';
  return 'дней';
};

const getDeclension = (count: number): string => {
  if (count % 10 === 1 && count % 100 !== 11) return 'стажировка';
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'стажировки';
  return 'стажировок';
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
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  loadingSubText: {
    marginTop: Theme.spacing.sm,
    fontSize: 15,
    color: Colors.gray,
  },
  listContent: {
    paddingBottom: Theme.spacing.xl,
  },
  header: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.md,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  greetingText: {
    fontSize: 14,
    color: Colors.gray,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 2,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  profileGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  searchWrapper: {
    marginBottom: Theme.spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.large,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderWidth: 1,
    borderColor: Colors.secondary + '20',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.primary,
    marginLeft: Theme.spacing.sm,
    marginRight: Theme.spacing.sm,
  },
  quickFiltersSection: {
    marginBottom: Theme.spacing.md,
  },
  quickFiltersContainer: {
    paddingRight: Theme.spacing.lg,
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.secondary + '20',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  filterChipIcon: {
    marginRight: 6,
  },
  filterChipText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  citySection: {
    marginBottom: Theme.spacing.md,
  },
  cityContainer: {
    paddingRight: Theme.spacing.lg,
    gap: 8,
  },
  cityChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.secondary + '20',
  },
  cityChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  cityChipText: {
    fontSize: 13,
    color: Colors.primary,
  },
  cityChipTextActive: {
    color: Colors.white,
  },
  moreCitiesChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.lightAccent,
    borderRadius: 20,
  },
  moreCitiesText: {
    fontSize: 13,
    color: Colors.accent,
    fontWeight: '600',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Theme.spacing.xs,
  },
  statsText: {
    fontSize: 14,
    color: Colors.gray,
  },
  statsNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.accent,
  },
  statsUpdate: {
    fontSize: 12,
    color: Colors.gray + '80',
  },
  
  // List View Styles
  cardWrapper: {
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.large,
    padding: Theme.spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.secondary + '10',
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: Theme.borderRadius.large,
    borderTopRightRadius: Theme.borderRadius.large,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.sm,
  },
  titleContainer: {
    flex: 1,
    marginRight: Theme.spacing.sm,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
    lineHeight: 24,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  companyName: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '600',
  },
  badgeContainer: {
    flexDirection: 'row',
  },
  badge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.small,
    alignSelf: 'flex-start',
  },
  paidBadge: {
    backgroundColor: Colors.accent + '15',
  },
  unpaidBadge: {
    backgroundColor: Colors.secondary + '15',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: Theme.spacing.md,
    lineHeight: 20,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    paddingBottom: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary + '10',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoIcon: {
    fontSize: 16,
  },
  infoText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  skillsSection: {
    marginBottom: Theme.spacing.md,
  },
  skillsTitle: {
    fontSize: 13,
    color: Colors.gray,
    marginBottom: Theme.spacing.xs,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  skillTag: {
    backgroundColor: Colors.lightAccent,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.small,
  },
  skillText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  moreSkillsTag: {
    backgroundColor: Colors.white,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.small,
    borderWidth: 1,
    borderColor: Colors.gray + '30',
  },
  moreSkillsText: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deadlineText: {
    fontSize: 12,
    color: Colors.gray,
  },
  urgentText: {
    color: Colors.error,
    fontWeight: '600',
  },
  soonText: {
    color: Colors.warning,
    fontWeight: '600',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  applyButtonText: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '600',
  },

  // Grid View Styles
  gridCardWrapper: {
    flex: 1,
    maxWidth: width / 2 - 20,
    marginLeft: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  gridCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.large,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.secondary + '10',
  },
  gridCardHeader: {
    padding: Theme.spacing.md,
    minHeight: 100,
  },
  gridCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 8,
    lineHeight: 22,
  },
  gridBadge: {
    position: 'absolute',
    top: Theme.spacing.md,
    right: Theme.spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridBadgeText: {
    fontSize: 16,
  },
  gridCardContent: {
    padding: Theme.spacing.md,
  },
  gridCompany: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  gridCompanyName: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '600',
    flex: 1,
  },
  gridInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gridInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gridInfoEmoji: {
    fontSize: 12,
  },
  gridInfoText: {
    fontSize: 11,
    color: Colors.gray,
  },
  gridDeadline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary + '10',
  },
  gridDeadlineText: {
    fontSize: 11,
    color: Colors.gray,
  },
  gridSkills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  gridSkillTag: {
    backgroundColor: Colors.lightAccent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  gridSkillText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '500',
  },
  gridMoreSkills: {
    fontSize: 10,
    color: Colors.gray,
    fontWeight: '600',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
    marginHorizontal: Theme.spacing.lg,
  },
  emptyGradient: {
    alignItems: 'center',
    padding: Theme.spacing.xl,
    borderRadius: Theme.borderRadius.large,
    width: '100%',
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
    lineHeight: 24,
  },
  resetButton: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
    backgroundColor: Colors.accent,
    borderRadius: Theme.borderRadius.medium,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  resetButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  modalBody: {
    padding: Theme.spacing.lg,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray + '10',
  },
  sortOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sortOptionText: {
    fontSize: 16,
    color: Colors.primary,
  },
  sortOptionTextActive: {
    color: Colors.accent,
    fontWeight: '600',
  },

  // Footer
  footerLoader: {
    paddingVertical: Theme.spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    marginTop: Theme.spacing.sm,
    fontSize: 14,
    color: Colors.gray,
  },
});