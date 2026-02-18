import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    StatusBar,
    Animated,
    Dimensions,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Theme } from '../constants/colors';
import { internshipService } from '../services/internshipService';
import { Application } from '../types';

const { width } = Dimensions.get('window');

// Типы статусов
type ApplicationStatus = 'sent' | 'viewed' | 'accepted' | 'rejected';

interface StatusConfig {
    label: string;
    icon: keyof typeof Feather.glyphMap;
    color: string;
    gradient: string[];
}

// Конфигурация статусов
const STATUS_CONFIG: Record<ApplicationStatus, StatusConfig> = {
    sent: {
        label: 'Отправлено',
        icon: 'send',
        color: Colors.primary,
        gradient: [Colors.primary + '20', Colors.primary + '05'],
    },
    viewed: {
        label: 'Просмотрено',
        icon: 'eye',
        color: Colors.warning,
        gradient: [Colors.warning + '20', Colors.warning + '05'],
    },
    accepted: {
        label: 'Принято',
        icon: 'check-circle',
        color: Colors.success,
        gradient: [Colors.success + '20', Colors.success + '05'],
    },
    rejected: {
        label: 'Отклонено',
        icon: 'x-circle',
        color: Colors.error,
        gradient: [Colors.error + '20', Colors.error + '05'],
    },
};

// Компонент карточки отклика
const ApplicationCard: React.FC<{ item: Application; index: number; onPress: () => void }> = ({ 
    item, 
    index, 
    onPress 
}) => {
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const status = item.status as ApplicationStatus;
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.sent;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                damping: 12,
                mass: 0.8,
                stiffness: 150,
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

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    };

    return (
        <Animated.View
            style={[
                styles.cardWrapper,
                {
                    opacity: opacityAnim,
                    transform: [{ scale: scaleAnim }],
                },
            ]}
        >
            <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
                <LinearGradient
                    colors={config.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card}
                >
                    {/* Индикатор статуса */}
                    <View style={[styles.statusIndicator, { backgroundColor: config.color }]} />

                    <View style={styles.cardHeader}>
                        <View style={styles.companyInfo}>
                            <View style={styles.companyLogo}>
                                <Text style={styles.companyInitial}>
                                    {item.internship.employer.companyName.charAt(0)}
                                </Text>
                            </View>
                            <View style={styles.companyDetails}>
                                <Text style={styles.companyName} numberOfLines={1}>
                                    {item.internship.employer.companyName}
                                </Text>
                                <View style={styles.dateContainer}>
                                    <Feather name="calendar" size={12} color={Colors.gray} />
                                    <Text style={styles.date}>
                                        {new Date(item.dateApplied).toLocaleDateString('ru-RU', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={[styles.statusBadge, { backgroundColor: config.color + '15' }]}>
                            <Feather name={config.icon} size={14} color={config.color} />
                            <Text style={[styles.statusText, { color: config.color }]}>
                                {config.label}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.title} numberOfLines={2}>
                        {item.internship.title}
                    </Text>

                    <View style={styles.cardFooter}>
                        <View style={styles.location}>
                            <Feather name="map-pin" size={14} color={Colors.gray} />
                            <Text style={styles.locationText} numberOfLines={1}>
                                {item.internship.city}
                            </Text>
                        </View>

                        <View style={styles.format}>
                            <Feather 
                                name={item.internship.format === 'online' ? 'monitor' :
                                      item.internship.format === 'offline' ? 'map-pin' : 'refresh-cw'}
                                size={12}
                                color={Colors.accent}
                            />
                            <Text style={styles.formatText}>
                                {item.internship.format === 'online' ? 'Удаленно' :
                                 item.internship.format === 'offline' ? 'В офисе' : 'Гибрид'}
                            </Text>
                        </View>

                        <Feather name="chevron-right" size={18} color={Colors.gray} />
                    </View>

                    {/* Прогресс отклика */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View 
                                style={[
                                    styles.progressFill, 
                                    { 
                                        width: status === 'accepted' ? '100%' :
                                               status === 'rejected' ? '100%' :
                                               status === 'viewed' ? '66%' : '33%',
                                        backgroundColor: status === 'rejected' ? Colors.error :
                                                        status === 'accepted' ? Colors.success :
                                                        status === 'viewed' ? Colors.warning : Colors.primary
                                    }
                                ]} 
                            />
                        </View>
                        <Text style={styles.progressText}>
                            {status === 'accepted' ? 'Принято' :
                             status === 'rejected' ? 'Отказ' :
                             status === 'viewed' ? 'Просмотрено' : 'Отправлено'}
                        </Text>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

// Компонент статистики
const StatsBar: React.FC<{ applications: Application[] }> = ({ applications }) => {
    const stats = {
        total: applications.length,
        sent: applications.filter(a => a.status === 'sent').length,
        viewed: applications.filter(a => a.status === 'viewed').length,
        accepted: applications.filter(a => a.status === 'accepted').length,
        rejected: applications.filter(a => a.status === 'rejected').length,
    };

    return (
        <View style={styles.statsContainer}>
            <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.total}</Text>
                <Text style={styles.statLabel}>Всего</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: Colors.primary }]}>{stats.sent}</Text>
                <Text style={styles.statLabel}>Активные</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: Colors.warning }]}>{stats.viewed}</Text>
                <Text style={styles.statLabel}>Просмотры</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: Colors.success }]}>{stats.accepted}</Text>
                <Text style={styles.statLabel}>Принято</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: Colors.error }]}>{stats.rejected}</Text>
                <Text style={styles.statLabel}>Отказы</Text>
            </View>
        </View>
    );
};

export const ApplicationsScreen: React.FC = () => {
    const navigation = useNavigation();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all');
    const scrollY = useRef(new Animated.Value(0)).current;

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 50],
        outputRange: [1, 0.9],
        extrapolate: 'clamp',
    });

    const loadApplications = async () => {
        try {
            const data = await internshipService.getMyApplications();
            setApplications(data);
        } catch (error) {
            console.error('Failed to load applications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadApplications();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await loadApplications();
    };

    const filteredApplications = applications.filter(app => 
        filter === 'all' ? true : app.status === filter
    );

    const renderHeader = () => (
        <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
            <View style={styles.headerTop}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    style={styles.backButton}
                >
                    <Feather name="arrow-left" size={22} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Мои отклики</Text>
                <View style={styles.headerRight} />
            </View>

            <StatsBar applications={applications} />

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersContainer}
            >
                <TouchableOpacity
                    style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                        Все
                    </Text>
                </TouchableOpacity>

                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <TouchableOpacity
                        key={key}
                        style={[
                            styles.filterChip,
                            filter === key && { backgroundColor: config.color + '15' }
                        ]}
                        onPress={() => setFilter(key as ApplicationStatus)}
                    >
                        <Feather 
                            name={config.icon} 
                            size={14} 
                            color={filter === key ? config.color : Colors.gray} 
                        />
                        <Text style={[
                            styles.filterText,
                            filter === key && { color: config.color, fontWeight: '600' }
                        ]}>
                            {config.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </Animated.View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.accent} />
                <Text style={styles.loadingText}>Загрузка откликов...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            <FlatList
                data={filteredApplications}
                renderItem={({ item, index }) => (
                    <ApplicationCard
                        item={item}
                        index={index}
                        onPress={() => navigation.navigate('InternshipDetails', { 
                            internshipId: item.internship.id 
                        })}
                    />
                )}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={renderHeader}
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
                        onRefresh={onRefresh}
                        colors={[Colors.accent]}
                        tintColor={Colors.accent}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconContainer}>
                            <Feather name="inbox" size={48} color={Colors.gray} />
                        </View>
                        <Text style={styles.emptyTitle}>Нет откликов</Text>
                        <Text style={styles.emptyText}>
                            {filter !== 'all' 
                                ? `Нет откликов со статусом "${STATUS_CONFIG[filter as ApplicationStatus]?.label}"`
                                : 'Вы еще не откликнулись ни на одну стажировку'
                            }
                        </Text>
                        <TouchableOpacity
                            style={styles.browseButton}
                            onPress={() => navigation.navigate('Home')}
                        >
                            <LinearGradient
                                colors={[Colors.accent, Colors.accent + 'CC']}
                                style={styles.browseGradient}
                            >
                                <Text style={styles.browseText}>Найти стажировки</Text>
                                <Feather name="arrow-right" size={18} color={Colors.white} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                }
            />
        </SafeAreaView>
    );
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
        marginTop: 12,
        fontSize: 15,
        color: Colors.gray,
    },
    header: {
        backgroundColor: Colors.white,
        paddingTop: 8,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray + '10',
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.gray + '05',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
    },
    headerRight: {
        width: 40,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Colors.white,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 11,
        color: Colors.gray,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: Colors.gray + '15',
    },
    filtersContainer: {
        paddingHorizontal: 16,
        gap: 8,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: Colors.gray + '05',
        borderRadius: 20,
        gap: 6,
    },
    filterChipActive: {
        backgroundColor: Colors.accent + '15',
    },
    filterText: {
        fontSize: 13,
        color: Colors.gray,
    },
    filterTextActive: {
        color: Colors.accent,
        fontWeight: '600',
    },
    listContent: {
        paddingBottom: 20,
    },
    cardWrapper: {
        marginHorizontal: 16,
        marginBottom: 12,
    },
    card: {
        borderRadius: 20,
        padding: 16,
        position: 'relative',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statusIndicator: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 4,
        height: '100%',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
        paddingLeft: 4,
    },
    companyInfo: {
        flexDirection: 'row',
        flex: 1,
        marginRight: 12,
    },
    companyLogo: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: Colors.accent + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    companyInitial: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.accent,
    },
    companyDetails: {
        flex: 1,
    },
    companyName: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    date: {
        fontSize: 11,
        color: Colors.gray,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 12,
        paddingLeft: 4,
        lineHeight: 22,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 4,
        marginBottom: 12,
    },
    location: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        gap: 4,
    },
    locationText: {
        fontSize: 12,
        color: Colors.gray,
        maxWidth: 120,
    },
    format: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginRight: 'auto',
    },
    formatText: {
        fontSize: 12,
        color: Colors.gray,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingLeft: 4,
    },
    progressBar: {
        flex: 1,
        height: 4,
        backgroundColor: Colors.gray + '10',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    progressText: {
        fontSize: 11,
        color: Colors.gray,
        fontWeight: '500',
        width: 70,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
        paddingHorizontal: 32,
    },
    emptyIconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
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
        fontSize: 14,
        color: Colors.gray,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    browseButton: {
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: Colors.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    browseGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 14,
        gap: 8,
    },
    browseText: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.white,
    },
});