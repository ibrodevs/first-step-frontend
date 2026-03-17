import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { secureStorage } from '../utils/storage';

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

function inferExpoHost(): string | null {
  // Expo Go / dev client usually provides hostUri like "192.168.1.100:8081"
  const anyConstants: any = Constants as any;
  const hostUri: string | undefined =
    (Constants as any).expoConfig?.hostUri ||
    anyConstants?.manifest2?.extra?.expoClient?.hostUri ||
    anyConstants?.manifest?.debuggerHost ||
    anyConstants?.manifest?.hostUri;

  if (!hostUri || typeof hostUri !== 'string') return null;
  const host = hostUri.split(':')[0]?.trim();
  if (!host) return null;
  return host;
}

function isLikelyLanHost(host: string): boolean {
  if (!host) return false;
  if (host === 'localhost' || host === '127.0.0.1') return true;
  if (host.endsWith('.local')) return true;
  // IPv4
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host)) return true;
  return false;
}

function computeApiBaseUrl(): string {
  // Expo env: EXPO_PUBLIC_API_URL, example: http://192.168.1.100:8000/api/v1
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return normalizeBaseUrl(envUrl.trim());
  }

  const expoHost = inferExpoHost();
  if (expoHost && isLikelyLanHost(expoHost)) {
    return `http://${expoHost}:8000/api/v1`;
  }

  // Fallbacks (mainly for emulators/simulators)
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api/v1';
  }
  return 'http://localhost:8000/api/v1';
}

const API_BASE_URL = computeApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Интерсептор для добавления токена авторизации
api.interceptors.request.use(
  async (config) => {
    // Let axios/browser set correct multipart boundary
    const data: any = (config as any).data;
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    if (isFormData) {
      config.headers = config.headers || {};
      delete (config.headers as any)['Content-Type'];
      delete (config.headers as any)['content-type'];
    }

    const token = await secureStorage.getItemAsync('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерсептор для обработки ответов и обновления токенов
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as any;
    
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await secureStorage.getItemAsync('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          await secureStorage.setItemAsync('accessToken', access);
          
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Токен обновления недействителен, выход из системы
        await secureStorage.deleteItemAsync('accessToken');
        await secureStorage.deleteItemAsync('refreshToken');
        // Здесь можно добавить редирект на экран входа
      }
    }
    
    return Promise.reject(error);
  }
);

export const API_BASE_URL_VALUE = API_BASE_URL;