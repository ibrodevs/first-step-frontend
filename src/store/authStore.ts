import { create } from 'zustand';
import { User, StudentProfile, EmployerProfile } from '../types';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  studentProfile: StudentProfile | null;
  employerProfile: EmployerProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: 'student' | 'employer') => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User) => void;
  setStudentProfile: (profile: StudentProfile) => void;
  setEmployerProfile: (profile: EmployerProfile) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  studentProfile: null,
  employerProfile: null,
  isLoading: false,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { user } = await authService.login({ email, password });
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (email: string, password: string, role: 'student' | 'employer') => {
    set({ isLoading: true });
    try {
      const { user } = await authService.register({ email, password, role });
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      set({
        user: null,
        studentProfile: null,
        employerProfile: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      // Даже если запрос не удался, очищаем состояние
      set({
        user: null,
        studentProfile: null,
        employerProfile: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const isAuth = await authService.isAuthenticated();
      if (isAuth) {
        try {
          const user = await authService.getCurrentUser();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isAuthenticated: false, isLoading: false });
        }
      } else {
        set({ isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      set({ isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user: User) => set({ user }),
  setStudentProfile: (profile: StudentProfile) => set({ studentProfile: profile }),
  setEmployerProfile: (profile: EmployerProfile) => set({ employerProfile: profile }),
}));