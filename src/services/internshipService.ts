import { api } from './api';
import { mockApi } from './mockApi';
import { Internship, InternshipFilters, Application } from '../types';

// Флаг для переключения между real API и mock API
const USE_MOCK_API = true;

export const internshipService = {
  async getInternships(filters?: InternshipFilters): Promise<{ results: Internship[]; count: number }> {
    if (USE_MOCK_API) {
      return await mockApi.getInternships(filters);
    } else {
      const params = new URLSearchParams();
      
      if (filters?.city) params.append('city', filters.city);
      if (filters?.format) params.append('format', filters.format);
      if (filters?.isPaid !== undefined) params.append('is_paid', filters.isPaid.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.skills?.length) {
        filters.skills.forEach(skill => params.append('skills', skill));
      }
      
      const response = await api.get(`/internships/?${params.toString()}`);
      return response.data;
    }
  },

  async getInternshipById(id: number): Promise<Internship> {
    if (USE_MOCK_API) {
      return await mockApi.getInternshipById(id);
    } else {
      const response = await api.get(`/internships/${id}/`);
      return response.data;
    }
  },

  async createInternship(data: Partial<Internship>): Promise<Internship> {
    const response = await api.post('/internships/', data);
    return response.data;
  },

  async updateInternship(id: number, data: Partial<Internship>): Promise<Internship> {
    const response = await api.patch(`/internships/${id}/`, data);
    return response.data;
  },

  async deleteInternship(id: number): Promise<void> {
    await api.delete(`/internships/${id}/`);
  },

  async applyToInternship(internshipId: number, coverLetter: string): Promise<Application> {
    if (USE_MOCK_API) {
      return await mockApi.applyToInternship(internshipId, coverLetter);
    } else {
      const response = await api.post('/applications/', {
        internship: internshipId,
        cover_letter: coverLetter,
      });
      return response.data;
    }
  },

  async getMyApplications(): Promise<Application[]> {
    const response = await api.get('/applications/');
    return response.data.results || response.data;
  },

  async getInternshipApplications(internshipId: number): Promise<Application[]> {
    const response = await api.get(`/internships/${internshipId}/applications/`);
    return response.data.results || response.data;
  },

  async updateApplicationStatus(applicationId: number, status: 'accepted' | 'rejected'): Promise<Application> {
    const response = await api.patch(`/applications/${applicationId}/`, { status });
    return response.data;
  },

  async addToFavorites(internshipId: number): Promise<void> {
    await api.post('/favorites/', { internship: internshipId });
  },

  async removeFromFavorites(internshipId: number): Promise<void> {
    await api.delete(`/favorites/${internshipId}/`);
  },

  async getFavorites(): Promise<Internship[]> {
    const response = await api.get('/favorites/');
    return response.data.results || response.data;
  },
};