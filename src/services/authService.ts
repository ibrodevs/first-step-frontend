import { api } from './api';
import { mockApi } from './mockApi';
import { secureStorage } from '../utils/storage';
import { AuthTokens, LoginCredentials, RegisterData, User } from '../types';

// Флаг для переключения между real API и mock API
const USE_MOCK_API = true;

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    let response;
    
    if (USE_MOCK_API) {
      const data = await mockApi.login(credentials.email, credentials.password);
      response = { data };
    } else {
      response = await api.post('/auth/login/', credentials);
    }
    
    const { user, access, refresh } = response.data;
    
    // Сохраняем токены
    await secureStorage.setItemAsync('accessToken', access);
    await secureStorage.setItemAsync('refreshToken', refresh);
    
    return {
      user,
      tokens: { access, refresh },
    };
  },

  async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    let response;
    
    if (USE_MOCK_API) {
      const mockData = await mockApi.register(data.email, data.password, data.role);
      response = { data: mockData };
    } else {
      response = await api.post('/auth/register/', data);
    }
    
    const { user, access, refresh } = response.data;
    
    // Сохраняем токены
    await secureStorage.setItemAsync('accessToken', access);
    await secureStorage.setItemAsync('refreshToken', refresh);
    
    return {
      user,
      tokens: { access, refresh },
    };
  },

  async logout(): Promise<void> {
    try {
      if (USE_MOCK_API) {
        await mockApi.logout();
      } else {
        const refreshToken = await secureStorage.getItemAsync('refreshToken');
        if (refreshToken) {
          await api.post('/auth/logout/', { refresh: refreshToken });
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Удаляем токены из хранилища
      await secureStorage.deleteItemAsync('accessToken');
      await secureStorage.deleteItemAsync('refreshToken');
    }
  },

  async getCurrentUser(): Promise<User> {
    if (USE_MOCK_API) {
      return await mockApi.getCurrentUser();
    } else {
      const response = await api.get('/auth/user/');
      return response.data;
    }
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await secureStorage.getItemAsync('accessToken');
    return !!token;
  },
};