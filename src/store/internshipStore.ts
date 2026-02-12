import { create } from 'zustand';
import { Internship, InternshipFilters, Application } from '../types';
import { internshipService } from '../services/internshipService';

interface InternshipState {
  internships: Internship[];
  currentInternship: Internship | null;
  applications: Application[];
  favorites: Internship[];
  filters: InternshipFilters;
  isLoading: boolean;
  
  // Actions
  fetchInternships: () => Promise<void>;
  fetchInternshipById: (id: number) => Promise<void>;
  applyFilters: (filters: InternshipFilters) => Promise<void>;
  clearFilters: () => Promise<void>;
  applyToInternship: (internshipId: number, coverLetter: string) => Promise<void>;
  fetchMyApplications: () => Promise<void>;
  addToFavorites: (internshipId: number) => Promise<void>;
  removeFromFavorites: (internshipId: number) => Promise<void>;
  fetchFavorites: () => Promise<void>;
  setCurrentInternship: (internship: Internship | null) => void;
}

export const useInternshipStore = create<InternshipState>((set, get) => ({
  internships: [],
  currentInternship: null,
  applications: [],
  favorites: [],
  filters: {},
  isLoading: false,

  fetchInternships: async () => {
    set({ isLoading: true });
    try {
      const { results } = await internshipService.getInternships(get().filters);
      set({ internships: results, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchInternshipById: async (id: number) => {
    set({ isLoading: true });
    try {
      const internship = await internshipService.getInternshipById(id);
      set({ currentInternship: internship, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  applyFilters: async (filters: InternshipFilters) => {
    set({ filters, isLoading: true });
    try {
      const { results } = await internshipService.getInternships(filters);
      set({ internships: results, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  clearFilters: async () => {
    set({ filters: {}, isLoading: true });
    try {
      const { results } = await internshipService.getInternships();
      set({ internships: results, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  applyToInternship: async (internshipId: number, coverLetter: string) => {
    try {
      await internshipService.applyToInternship(internshipId, coverLetter);
      // Обновляем список заявок
      await get().fetchMyApplications();
    } catch (error) {
      throw error;
    }
  },

  fetchMyApplications: async () => {
    set({ isLoading: true });
    try {
      const applications = await internshipService.getMyApplications();
      set({ applications, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  addToFavorites: async (internshipId: number) => {
    try {
      await internshipService.addToFavorites(internshipId);
      // Обновляем список избранного
      await get().fetchFavorites();
    } catch (error) {
      throw error;
    }
  },

  removeFromFavorites: async (internshipId: number) => {
    try {
      await internshipService.removeFromFavorites(internshipId);
      // Обновляем список избранного
      await get().fetchFavorites();
    } catch (error) {
      throw error;
    }
  },

  fetchFavorites: async () => {
    try {
      const favorites = await internshipService.getFavorites();
      set({ favorites });
    } catch (error) {
      throw error;
    }
  },

  setCurrentInternship: (internship: Internship | null) => {
    set({ currentInternship: internship });
  },
}));