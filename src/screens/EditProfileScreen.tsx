import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Theme } from '../constants/colors';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { StudentProfile } from '../types';
import { profileService } from '../services/profileService';
import * as ImagePicker from 'expo-image-picker';

export const EditProfileScreen: React.FC = () => {
    const navigation = useNavigation();
    const { user, studentProfile, setStudentProfile } = useAuthStore();

    const fallbackFullName = useMemo(
        () => studentProfile?.fullName || user?.email?.split('@')[0] || '',
        [studentProfile?.fullName, user?.email]
    );

    const [fullName, setFullName] = useState(fallbackFullName);
    const [description, setDescription] = useState(studentProfile?.description || '');
    const [city, setCity] = useState(studentProfile?.city || '');
    const [university, setUniversity] = useState(studentProfile?.university || '');
    const [skills, setSkills] = useState(studentProfile?.skills?.join(', ') || '');
    const [avatarUrl, setAvatarUrl] = useState<string>('');
    const [avatarLocalUri, setAvatarLocalUri] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);

    const loadMe = async () => {
        if (!user) return;
        setIsLoadingProfile(true);
        try {
            const me = await profileService.getMe();
            const mergedName = `${me.first_name} ${me.last_name}`.trim();
            setFullName(mergedName || fallbackFullName);
            setDescription(me.about || '');
            setCity(me.city || '');
            setUniversity(me.university || '');
            setSkills(Array.isArray(me.skills) ? me.skills.join(', ') : '');
            setAvatarUrl(me.avatar_url || '');
        } catch (e) {
            // silent
        } finally {
            setIsLoadingProfile(false);
        }
    };

    useEffect(() => {
        loadMe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    useFocusEffect(
        React.useCallback(() => {
            loadMe();
        }, [user?.id])
    );

    const pickAvatar = async () => {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
            Alert.alert('Нет доступа', 'Разрешите доступ к галерее, чтобы выбрать фото');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85,
        });

        if (result.canceled) return;
        const uri = result.assets?.[0]?.uri;
        if (uri) setAvatarLocalUri(uri);
    };

    const handleSave = async () => {
        if (!user) {
            Alert.alert('Ошибка', 'Нужно войти в аккаунт');
            return;
        }

        if (isSaving) return;
        setIsSaving(true);

        try {
            const parts = fullName.trim().split(/\s+/).filter(Boolean);
            const first_name = parts[0] || '';
            const last_name = parts.slice(1).join(' ');

            const skillsArray = skills
                .split(',')
                .map((s) => s.trim())
                .filter((s) => s.length > 0);

            const shouldUseMultipart = !!avatarLocalUri;
            const updated = shouldUseMultipart
                ? await (async () => {
                    const form = new FormData();
                    form.append('first_name', first_name);
                    form.append('last_name', last_name);
                    form.append('city', city);
                    form.append('about', description);
                    form.append('university', university);
                    form.append('skills', JSON.stringify(skillsArray));

                    const filename = avatarLocalUri.split('/').pop() || `avatar_${Date.now()}.jpg`;
                    const ext = (filename.split('.').pop() || 'jpg').toLowerCase();
                    const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

                    if (Platform.OS === 'web') {
                        const resp = await fetch(avatarLocalUri);
                        const blob = await resp.blob();
                        const typedBlob = blob.type ? blob : (blob as any).slice?.(0, blob.size, mime) || blob;
                        form.append('avatar_url', typedBlob as any, filename);
                    } else {
                        form.append('avatar_url', {
                            uri: avatarLocalUri,
                            name: filename,
                            type: mime,
                        } as any);
                    }

                    return await profileService.patchMeMultipart(form);
                })()
                : await profileService.patchMe({
                    first_name,
                    last_name,
                    city,
                    about: description,
                    university,
                    skills: skillsArray,
                });

            if (updated.avatar_url) setAvatarUrl(updated.avatar_url);
            setAvatarLocalUri('');

            if (user.role === 'student') {
                const updatedProfile: StudentProfile = {
                    ...studentProfile,
                    id: studentProfile?.id || Date.now(),
                    user,
                    fullName: `${updated.first_name} ${updated.last_name}`.trim() || fullName,
                    description: updated.about,
                    city: updated.city,
                    university,
                    skills: Array.isArray(updated.skills) ? updated.skills : skillsArray,
                    age: studentProfile?.age || 20,
                };

                setStudentProfile(updatedProfile);
            }

            Alert.alert('Успешно', 'Профиль обновлен', [{ text: 'OK', onPress: () => navigation.goBack() }]);
        } catch (error: any) {
            Alert.alert('Ошибка', error.response?.data?.error?.message || 'Не удалось обновить профиль');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color={Colors.black} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Редактировать профиль</Text>
                    <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={isSaving}>
                        <Text style={[styles.saveText, isSaving && { opacity: 0.6 }]}>Сохранить</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarPlaceholder}>
                            {avatarLocalUri || avatarUrl ? (
                                <Image
                                    source={{ uri: avatarLocalUri || avatarUrl }}
                                    style={styles.avatarImage}
                                />
                            ) : (
                                <Text style={styles.avatarText}>
                                    {fullName ? fullName.substring(0, 2).toUpperCase() : 'U'}
                                </Text>
                            )}
                        </View>
                        <TouchableOpacity style={styles.changeAvatarButton} onPress={pickAvatar} disabled={isSaving || isLoadingProfile}>
                            <Text style={styles.changeAvatarText}>Изменить фото</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Имя Фамилия</Text>
                            <TextInput
                                style={styles.input}
                                value={fullName}
                                onChangeText={setFullName}
                                placeholder="Иван Иванов"
                                placeholderTextColor={Colors.gray}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Город</Text>
                            <TextInput
                                style={styles.input}
                                value={city}
                                onChangeText={setCity}
                                placeholder="Бишкек"
                                placeholderTextColor={Colors.gray}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Учебное заведение</Text>
                            <TextInput
                                style={styles.input}
                                value={university}
                                onChangeText={setUniversity}
                                placeholder="КГТУ им. И. Раззакова"
                                placeholderTextColor={Colors.gray}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Навыки (через запятую)</Text>
                            <TextInput
                                style={styles.input}
                                value={skills}
                                onChangeText={setSkills}
                                placeholder="React, TypeScript, Python"
                                placeholderTextColor={Colors.gray}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>О себе</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Расскажите о своем опыте и целях..."
                                placeholderTextColor={Colors.gray}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
        justifyContent: 'space-between',
        padding: Theme.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray + '20',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.black,
    },
    saveButton: {
        padding: 4,
    },
    saveText: {
        fontSize: 16,
        color: Colors.primary,
        fontWeight: '600',
    },
    content: {
        padding: Theme.spacing.lg,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: Theme.spacing.xl,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Theme.spacing.md,
        borderWidth: 2,
        borderColor: Colors.primary,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    avatarText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    changeAvatarButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    changeAvatarText: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '500',
    },
    form: {
        gap: Theme.spacing.lg,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.gray,
    },
    input: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.gray + '30',
        borderRadius: Theme.borderRadius.medium,
        paddingHorizontal: Theme.spacing.md,
        paddingVertical: 12,
        fontSize: 16,
        color: Colors.black,
    },
    textArea: {
        height: 100,
    },
});
