import { api } from './api';

export type ApiProfile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  avatar_url: string | null;
  birth_date: string | null;
  city: string;
  about: string;
  university: string;
  skills: string[];
  created_at: string;
  updated_at: string;
};

export type ApiProfilePatch = Partial<Pick<ApiProfile, 'first_name' | 'last_name' | 'phone' | 'avatar_url' | 'birth_date' | 'city' | 'about' | 'university' | 'skills'>>;

export const profileService = {
  async getMe(): Promise<ApiProfile> {
    const resp = await api.get<ApiProfile>('/profile/me/');
    return resp.data;
  },

  async patchMe(payload: ApiProfilePatch): Promise<ApiProfile> {
    const resp = await api.patch<ApiProfile>('/profile/me/', payload);
    return resp.data;
  },

  async patchMeMultipart(formData: FormData): Promise<ApiProfile> {
    const resp = await api.patch<ApiProfile>('/profile/me/', formData);
    return resp.data;
  },

  async changePassword(old_password: string, new_password: string, new_password_confirm: string): Promise<void> {
    await api.post('/profile/change-password/', { old_password, new_password, new_password_confirm });
  },
};
