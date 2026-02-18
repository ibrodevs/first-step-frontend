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
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useInternshipStore } from '../store/internshipStore';
import { useAuthStore } from '../store/authStore';
import { Colors, Theme } from '../constants/colors';
import { Internship } from '../types';

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

// Современная карточка стажировки
const InternshipCard: React.FC<InternshipCardProps> = ({ internship, onPress, index, viewMode }) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
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

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  if (viewMode === 'grid') {
    return (
      <Animated.View
        style={[
          styles.gridCardWrapper,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.gridCard}
          onPress={handlePress}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[Colors.primary + '10', Colors.accent + '05']}
            style={styles.gridGradient}
          >
            <View style={styles.gridCardHeader}>
              <View style={[styles.gridStatusBadge, styles[`status${deadlineStatus}`]]}>
                <Feather
                  name={
                    deadlineStatus === 'urgent' ? 'zap' : 
                    deadlineStatus === 'soon' ? 'clock' : 
                    deadlineStatus === 'expired' ? 'x-circle' : 'calendar'
                  }
                  size={14}
                  color={
                    deadlineStatus === 'urgent' ? Colors.error :
                    deadlineStatus === 'soon' ? Colors.warning :
                    deadlineStatus === 'expired' ? Colors.gray : Colors.accent
                  }
                />
              </View>
              <View style={[
                styles.gridTypeBadge,
                internship.isPaid ? styles.paidTypeBadge : styles.unpaidTypeBadge
              ]}>
                <Feather
                  name={internship.isPaid ? 'dollar-sign' : 'book-open'}
                  size={12}
                  color={internship.isPaid ? Colors.accent : Colors.gray}
                />
              </View>
            </View>

            <View style={styles.gridCardContent}>
              <Text style={styles.gridCardTitle} numberOfLines={2}>
                {internship.title}
              </Text>

              <Text style={styles.gridCompanyName} numberOfLines={1}>
                {internship.employer.companyName}
              </Text>

              <View style={styles.gridInfoRow}>
                <View style={styles.gridInfoItem}>
                  <Feather name="map-pin" size={12} color={Colors.gray} />
                  <Text style={styles.gridInfoText}>{internship.city}</Text>
                </View>
                <View style={styles.gridInfoItem}>
                  <Feather name="clock" size={12} color={Colors.gray} />
                  <Text style={styles.gridInfoText}>{internship.duration}</Text>
                </View>
              </View>

              <View style={styles.gridSkills}>
                {internship.skills.slice(0, 2).map((skill, idx) => (
                  <View key={idx} style={styles.gridSkillTag}>
                    <Text style={styles.gridSkillText}>{skill}</Text>
                  </View>
                ))}
                {internship.skills.length > 2 && (
                  <View style={styles.gridMoreSkillsTag}>
                    <Text style={styles.gridMoreSkillsText}>
                      +{internship.skills.length - 2}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <View style={styles.cardBlur}>
          <LinearGradient
            colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {internship.title}
                </Text>
                <View style={styles.cardCompany}>
                  <Feather name="briefcase" size={14} color={Colors.accent} />
                  <Text style={styles.cardCompanyText}>
                    {internship.employer.companyName}
                  </Text>
                </View>
              </View>
              <View style={[
                styles.cardBadge,
                internship.isPaid ? styles.paidBadge : styles.unpaidBadge
              ]}>
                <Text style={styles.cardBadgeText}>
                  {internship.isPaid ? 'Оплата' : 'Без оплаты'}
                </Text>
              </View>
            </View>

            <Text style={styles.cardDescription} numberOfLines={2}>
              {internship.description}
            </Text>

            <View style={styles.cardTags}>
              <View style={styles.cardTag}>
                <Feather name="map-pin" size={12} color={Colors.accent} />
                <Text style={styles.cardTagText}>{internship.city}</Text>
              </View>
              <View style={styles.cardTag}>
                <Feather
                  name={
                    internship.format === 'online' ? 'monitor' : 
                    internship.format === 'offline' ? 'map-pin' : 'refresh-cw'
                  }
                  size={12}
                  color={Colors.accent}
                />
                <Text style={styles.cardTagText}>
                  {internship.format === 'online' ? 'Удаленно' :
                   internship.format === 'offline' ? 'В офисе' : 'Гибрид'}
                </Text>
              </View>
              <View style={styles.cardTag}>
                <Feather name="clock" size={12} color={Colors.accent} />
                <Text style={styles.cardTagText}>{internship.duration}</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.cardDeadline}>
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
                  styles.cardDeadlineText,
                  deadlineStatus === 'urgent' && styles.urgentText,
                  deadlineStatus === 'soon' && styles.soonText,
                ]}>
                  {daysUntilDeadline < 0 ? 'Завершена' :
                   daysUntilDeadline === 0 ? 'Сегодня' :
                   `Осталось ${daysUntilDeadline} дн.`}
                </Text>
              </View>
              <View style={styles.cardArrow}>
                <Feather name="arrow-right-circle" size={20} color={Colors.accent} />
              </View>
            </View>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Современный фильтр-чип
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

// Модальное окно сортировки
const SortModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  selectedSort: SortOption;
  onSelect: (sort: SortOption) => void;
}> = ({ visible, onClose, selectedSort, onSelect }) => {
  const sortOptions: { value: SortOption; label: string; icon: keyof typeof Feather.glyphMap }[] = [
    { value: 'date', label: 'Сначала новые', icon: 'calendar' },
    { value: 'popularity', label: 'Популярные', icon: 'trending-up' },
    { value: 'salary', label: 'По зарплате', icon: 'dollar-sign' },
    { value: 'deadline', label: 'Скоро дедлайн', icon: 'clock' },
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
          <View style={styles.modalBlur}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Сортировка</Text>
              <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                <Feather name="x" size={24} color={Colors.white} />
              </TouchableOpacity>
            </View>

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
                    <View style={styles.sortOptionCheck}>
                      <Feather name="check" size={18} color={Colors.white} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export const HomeScreen: React.FC = ({ navigation }: any) => {
  const { internships, isLoading, fetchInternships, applyFilters, filters } = useInternshipStore();
  const { user } = useAuthStore();

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
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  // Мемоизированные данные
  const filteredInternships = useMemo(() => {
    let filtered = [...internships];

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

  const handleRefresh = async () => {
    setRefreshing(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await fetchInternships();
    setRefreshing(false);
  };

  const handlePresetPress = (preset: FilterPreset) => {
    setActivePreset(preset);
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
    <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Верхняя панель */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>С возвращением,</Text>
          <Text style={styles.userName}>{user?.name || user?.email.split('@')[0]}</Text>
        </View>

        <View style={styles.topBarActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={toggleViewMode}
          >
            <Feather
              name={filterState.viewMode === 'grid' ? 'grid' : 'list'}
              size={20}
              color={Colors.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowSortModal(true)}
          >
            <Feather name="sliders" size={20} color={Colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.accent]}
              style={styles.profileGradient}
            >
              <Text style={styles.profileInitial}>
                {user?.email.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Поиск */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color={Colors.gray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск стажировок..."
          placeholderTextColor={Colors.gray + '80'}
          value={filterState.search}
          onChangeText={(text) => setFilterState(prev => ({ ...prev, search: text }))}
          returnKeyType="search"
        />
        {filterState.search.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setFilterState(prev => ({ ...prev, search: '' }));
              applyFilters({ ...filters, search: '' });
            }}
          >
            <Feather name="x" size={18} color={Colors.gray} />
          </TouchableOpacity>
        )}
      </View>

      {/* Быстрые фильтры */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
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

      {/* Статистика */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Найдено <Text style={styles.statsNumber}>{filteredInternships.length}</Text> {getDeclension(filteredInternships.length)}
        </Text>
      </View>
    </Animated.View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Feather name="inbox" size={48} color={Colors.gray} />
      </View>
      <Text style={styles.emptyTitle}>Ничего не найдено</Text>
      <Text style={styles.emptyText}>
        Попробуйте изменить параметры поиска
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
        }}
      >
        <Text style={styles.resetButtonText}>Сбросить фильтры</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && internships.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.loadingText}>Загрузка стажировок...</Text>
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
            onPress={() => navigation.navigate('InternshipDetails', { internshipId: item.id })}
            index={index}
            viewMode={filterState.viewMode}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        key={filterState.viewMode}
        numColumns={filterState.viewMode === 'grid' ? 2 : 1}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
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
const getDeclension = (count: number): string => {
  if (count % 10 === 1 && count % 100 !== 11) return 'стажировка';
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'стажировки';
  return 'стажировок';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.gray,
  },
  listContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#F8F9FA',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  profileGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  filtersContainer: {
    paddingRight: 20,
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
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
    color: Colors.gray,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  statsContainer: {
    paddingTop: 8,
  },
  statsText: {
    fontSize: 14,
    color: Colors.gray,
  },
  statsNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.accent,
  },

  // List View Styles
  cardWrapper: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  cardCompany: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardCompanyText: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '500',
  },
  cardBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paidBadge: {
    backgroundColor: Colors.accent + '15',
  },
  unpaidBadge: {
    backgroundColor: Colors.gray + '10',
  },
  cardBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 12,
    lineHeight: 20,
  },
  cardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  cardTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardTagText: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDeadline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardDeadlineText: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '500',
  },
  urgentText: {
    color: Colors.error,
  },
  soonText: {
    color: Colors.warning,
  },
  cardArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accent + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Grid View Styles
  gridCardWrapper: {
    flex: 1,
    maxWidth: width / 2 - 24,
    marginLeft: 16,
    marginBottom: 12,
  },
  gridCard: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  gridGradient: {
    backgroundColor: Colors.white,
  },
  gridCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  gridStatusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusurgent: {
    backgroundColor: Colors.error + '15',
  },
  statussoon: {
    backgroundColor: Colors.warning + '15',
  },
  statusnormal: {
    backgroundColor: Colors.accent + '10',
  },
  statusexpired: {
    backgroundColor: Colors.gray + '10',
  },
  gridTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paidTypeBadge: {
    backgroundColor: Colors.accent + '15',
  },
  unpaidTypeBadge: {
    backgroundColor: Colors.gray + '10',
  },
  gridCardContent: {
    padding: 12,
    paddingTop: 0,
  },
  gridCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  gridCompanyName: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '500',
    marginBottom: 8,
  },
  gridInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  gridInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gridInfoText: {
    fontSize: 11,
    color: Colors.gray,
  },
  gridSkills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  gridSkillTag: {
    backgroundColor: Colors.accent + '08',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gridSkillText: {
    fontSize: 10,
    color: Colors.accent,
    fontWeight: '500',
  },
  gridMoreSkillsTag: {
    backgroundColor: Colors.gray + '10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gridMoreSkillsText: {
    fontSize: 10,
    color: Colors.gray,
    fontWeight: '600',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
    marginHorizontal: 20,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: 20,
  },
  resetButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  resetButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalBlur: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    gap: 8,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  sortOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sortOptionText: {
    fontSize: 16,
    color: Colors.white,
  },
  sortOptionTextActive: {
    color: Colors.accent,
    fontWeight: '600',
  },
  sortOptionCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
});