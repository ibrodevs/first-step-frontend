import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated,
    StatusBar,
    Image,
    Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Theme } from '../constants/colors';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';


const { width, height } = Dimensions.get('window');

export const WelcomeScreen: React.FC = ({ navigation }: any) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const button1Anim = useRef(new Animated.Value(0)).current;
    const button2Anim = useRef(new Animated.Value(0)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Плавающая анимация для фоновых элементов
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: 1,
                    duration: 3000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration: 3000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Основные анимации появления
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1200,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 1000,
                delay: 200,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 1000,
                delay: 200,
                easing: Easing.elastic(1),
                useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 1500,
                delay: 300,
                easing: Easing.elastic(1),
                useNativeDriver: true,
            }),
            Animated.spring(button1Anim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                delay: 500,
                useNativeDriver: true,
            }),
            Animated.spring(button2Anim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                delay: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const float1 = floatAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 20],
    });

    const float2 = floatAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -20],
    });

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['-15deg', '0deg'],
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* Анимированные фоновые элементы */}
            <Animated.View style={[styles.circle1, { transform: [{ translateY: float1 }] }]} />
            <Animated.View style={[styles.circle2, { transform: [{ translateY: float2 }] }]} />

            {/* Декоративные волны */}
            <View style={styles.waveContainer}>
                <View style={[styles.wave, styles.wave1]} />
                <View style={[styles.wave, styles.wave2]} />
            </View>

            <SafeAreaView style={styles.safeArea}>
                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                            transform: [
                                { translateY: slideAnim },
                                { scale: scaleAnim }
                            ]
                        }
                    ]}
                >
                    <View style={styles.logoContainer}>
                        <Animated.View style={{ transform: [{ rotate }] }}>
                            <LinearGradient
                                colors={['#25D1E4', '#7BDFF2']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.logoGradient}
                            >
                                <Feather name="briefcase" size={48} color="#FFFFFF" />
                            </LinearGradient>
                        </Animated.View>

                        <Text style={styles.appName}>First Step</Text>

                        <View style={styles.taglineContainer}>
                            <Text style={styles.tagline}>
                                Твой путь к карьере мечты
                            </Text>
                            <Text style={[styles.tagline, styles.taglineHighlight]}>
                                начинается здесь
                            </Text>
                        </View>
                    </View>

                    <View style={styles.featuresContainer}>
                        <View style={styles.featureItem}>
                            <View style={styles.featureIconContainer}>
                                <LinearGradient
                                    colors={['#25D1E4', '#7BDFF2']}
                                    style={styles.featureIcon}
                                >
                                    <Feather name="users" size={20} color="#FFFFFF" />
                                </LinearGradient>
                            </View>
                            <Text style={styles.featureText}>1000+ вакансий</Text>
                        </View>

                        <View style={styles.featureItem}>
                            <View style={styles.featureIconContainer}>
                                <LinearGradient
                                    colors={['#25D1E4', '#7BDFF2']}
                                    style={styles.featureIcon}
                                >
                                    <Feather name="award" size={20} color="#FFFFFF" />
                                </LinearGradient>
                            </View>
                            <Text style={styles.featureText}>500+ компаний</Text>
                        </View>

                        <View style={styles.featureItem}>
                            <View style={styles.featureIconContainer}>
                                <LinearGradient
                                    colors={['#25D1E4', '#7BDFF2']}
                                    style={styles.featureIcon}
                                >
                                    <Feather name="trending-up" size={20} color="#FFFFFF" />
                                </LinearGradient>
                            </View>
                            <Text style={styles.featureText}>Быстрый старт</Text>
                        </View>
                    </View>

                    <View style={styles.buttonContainer}>
                        <Animated.View
                            style={[
                                styles.buttonWrapper,
                                {
                                    opacity: button1Anim,
                                    transform: [
                                        {
                                            translateX: button1Anim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [-50, 0]
                                            })
                                        }
                                    ]
                                }
                            ]}
                        >
                            <TouchableOpacity
                                style={styles.loginButton}
                                activeOpacity={0.8}
                                onPress={() => navigation.navigate('Login')}
                            >
                                <LinearGradient
                                    colors={['#25D1E4', '#7BDFF2']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.gradientButton}
                                >
                                    <Text style={styles.loginButtonText}>Войти</Text>
                                    <Feather name="log-in" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>

                        <Animated.View
                            style={[
                                styles.buttonWrapper,
                                {
                                    opacity: button2Anim,
                                    transform: [
                                        {
                                            translateX: button2Anim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [50, 0]
                                            })
                                        }
                                    ]
                                }
                            ]}
                        >
                            <TouchableOpacity
                                style={styles.registerButton}
                                activeOpacity={0.8}
                                onPress={() => navigation.navigate('Register')}
                            >
                                <View style={styles.transparentButton}>
                                    <Text style={styles.registerButtonText}>Зарегистрироваться</Text>
                                    <Feather name="user-plus" size={20} color={Colors.primary} style={styles.buttonIcon} />
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Присоединяйся к тысячам студентов и работодателей
                        </Text>
                    </View>
                </Animated.View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
    },
    circle1: {
        position: 'absolute',
        top: -height * 0.1,
        right: -width * 0.2,
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        backgroundColor: '#25D1E4',
        opacity: 0.1,
    },
    circle2: {
        position: 'absolute',
        bottom: -height * 0.05,
        left: -width * 0.1,
        width: width * 0.6,
        height: width * 0.6,
        borderRadius: width * 0.3,
        backgroundColor: '#25D1E4',
        opacity: 0.05,
    },
    waveContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.2,
    },
    wave: {
        position: 'absolute',
        width: width * 2,
        height: height * 0.2,
        backgroundColor: '#25D1E4',
        opacity: 0.05,
    },
    wave1: {
        transform: [{ rotate: '-2deg' }],
        bottom: -20,
        left: -width * 0.5,
        borderRadius: width,
    },
    wave2: {
        transform: [{ rotate: '1deg' }],
        bottom: -40,
        left: -width * 0.3,
        borderRadius: width,
        opacity: 0.03,
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: height * 0.06,
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: height * 0.03,
    },
    logoGradient: {
        width: 120,
        height: 120,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#25D1E4',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
    },
    appName: {
        fontSize: 42,
        fontWeight: '800',
        color: '#1A1A1A',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    taglineContainer: {
        alignItems: 'center',
    },
    tagline: {
        fontSize: 18,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 26,
    },
    taglineHighlight: {
        color: '#25D1E4',
        fontWeight: '600',
    },
    featuresContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 10,
        marginVertical: 40,
    },
    featureItem: {
        alignItems: 'center',
    },
    featureIconContainer: {
        marginBottom: 8,
    },
    featureIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#25D1E4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    featureText: {
        fontSize: 14,
        color: '#666666',
        fontWeight: '500',
    },
    buttonContainer: {
        width: '100%',
        gap: 16,
    },
    buttonWrapper: {
        width: '100%',
    },
    loginButton: {
        height: 65,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#25D1E4',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    gradientButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    registerButton: {
        height: 65,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#25D1E4',
        backgroundColor: 'transparent',
    },
    transparentButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    buttonIcon: {
        marginLeft: 10,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    registerButtonText: {
        color: '#25D1E4',
        fontSize: 18,
        fontWeight: '700',
    },
    footer: {
        alignItems: 'center',
        marginTop: 20,
    },
    footerText: {
        fontSize: 14,
        color: '#999999',
        textAlign: 'center',
        lineHeight: 20,
    },
});