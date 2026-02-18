import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Theme } from '../constants/colors';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { StudentProfile } from '../types';

export const EditProfileScreen: React.FC = () => {
    const navigation = useNavigation();
    const { user, studentProfile, setStudentProfile } = useAuthStore();

    const [fullName, setFullName] = useState(studentProfile?.fullName || user?.email?.split('@')[0] || '');
    const [description, setDescription] = useState(studentProfile?.description || '');
    const [city, setCity] = useState(studentProfile?.city || '');
    const [university, setUniversity] = useState(studentProfile?.university || '');
    const [skills, setSkills] = useState(studentProfile?.skills?.join(', ') || '');

    const handleSave = () => {
        // Mock save
        if (user?.role === 'student') {
            const updatedProfile: StudentProfile = {
                ...studentProfile,
                id: studentProfile?.id || Date.now(),
                user: user!,
                fullName,
                description,
                city,
                university,
                skills: skills.split(',').map(s => s.trim()).filter(s => s.length > 0),
                age: studentProfile?.age || 20, // Default age
            };

            setStudentProfile(updatedProfile);

            // Update user name as well for coherence
            // useAuthStore.setState({ user: { ...user, name: fullName } }); // This might be tricky with types

            Alert.alert('Успешно', 'Профиль обновлен', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert('Info', 'Editing employer profile is not fully implemented yet.');
            navigation.goBack();
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
                    <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                        <Text style={styles.saveText}>Сохранить</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {fullName ? fullName.substring(0, 2).toUpperCase() : 'U'}
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.changeAvatarButton}>
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
