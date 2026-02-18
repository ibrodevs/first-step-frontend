import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Theme } from '../constants/colors';
import { internshipService } from '../services/internshipService';
import { Application } from '../types';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export const ApplicationsScreen: React.FC = () => {
    const navigation = useNavigation();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

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

    const onRefresh = () => {
        setRefreshing(true);
        loadApplications();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'accepted':
                return Colors.success;
            case 'rejected':
                return Colors.error; // Red
            case 'viewed':
                return Colors.warning;
            case 'sent':
            default:
                return Colors.primary; // Cyan
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'accepted':
                return 'Принято';
            case 'rejected':
                return 'Отклонено';
            case 'viewed':
                return 'Просмотрено';
            case 'sent':
                return 'Отправлено';
            default:
                return 'Отправлено';
        }
    };

    const renderItem = ({ item }: { item: Application }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('InternshipDetails', { internshipId: item.internship.id })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.companyInfo}>
                    <Text style={styles.companyName}>{item.internship.employer.companyName}</Text>
                    <Text style={styles.date}>{new Date(item.dateApplied).toLocaleDateString()}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {getStatusText(item.status)}
                    </Text>
                </View>
            </View>

            <Text style={styles.title}>{item.internship.title}</Text>

            <View style={styles.footer}>
                <Text style={styles.city}>
                    <Feather name="map-pin" size={14} color={Colors.textMuted} /> {item.internship.city}
                </Text>
                <Feather name="chevron-right" size={20} color={Colors.textMuted} />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Мои отклики</Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={applications}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Feather name="file-text" size={64} color={Colors.textMuted + '40'} />
                            <Text style={styles.emptyText}>У вас пока нет откликов</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Theme.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray + '20',
    },
    backButton: {
        marginRight: Theme.spacing.md,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: Theme.spacing.lg,
    },
    card: {
        backgroundColor: Colors.white,
        padding: Theme.spacing.lg,
        borderRadius: Theme.borderRadius.medium,
        marginBottom: Theme.spacing.md,
        shadowColor: Colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: Colors.textMuted + '10',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Theme.spacing.sm,
    },
    companyInfo: {
        flex: 1,
    },
    companyName: {
        fontSize: 14,
        color: Colors.textMuted,
        marginBottom: 4,
    },
    date: {
        fontSize: 12,
        color: Colors.textMuted + '80',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: Theme.spacing.md,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    city: {
        fontSize: 14,
        color: Colors.textMuted,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptyText: {
        marginTop: Theme.spacing.md,
        fontSize: 16,
        color: Colors.textMuted,
    },
});
