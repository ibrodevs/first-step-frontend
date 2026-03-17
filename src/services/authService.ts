import { api } from './api';
import { secureStorage } from '../utils/storage';
import { AuthTokens, LoginCredentials, RegisterData, User } from '../types';

type LoginResponse = {
  access: string;
  refresh: string;
  token_type: 'Bearer';
  expires_in: number;
  user: { id: string; email: string };
};

type RegisterResponse = {
  id: string;
  email: string;
  created_at: string;
};

async function getStoredRole(): Promise<User['role']> {
  const role = await secureStorage.getItemAsync('userRole');
  return (role === 'employer' ? 'employer' : 'student') as User['role'];
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await api.post<LoginResponse>('/auth/login/', credentials);
    const { user, access, refresh } = response.data;
    const role = await getStoredRole();
    
    // Сохраняем токены
    await secureStorage.setItemAsync('accessToken', access);
    await secureStorage.setItemAsync('refreshToken', refresh);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        role,
      },
      tokens: { access, refresh },
    };
  },

  async register(data: RegisterData): Promise<{ user: Pick<User, 'id' | 'email' | 'role'> }> {
    await secureStorage.setItemAsync('userRole', data.role);
    const response = await api.post<RegisterResponse>('/auth/register/', {
      email: data.email,
      password: data.password,
      password_confirm: data.password,
    });

    return {
      user: {
        id: response.data.id,
        email: response.data.email,
        role: data.role,
      },
    };
  },

  async logout(): Promise<void> {
    try {
      const refreshToken = await secureStorage.getItemAsync('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout/', { refresh: refreshToken });
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
    const role = await getStoredRole();
    const response = await api.get<{ id: string; email: string; created_at?: string; updated_at?: string }>('/profile/me/');
    return {
      id: response.data.id,
      email: response.data.email,
      role,
    };
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await secureStorage.getItemAsync('accessToken');
    return !!token;
  },
};