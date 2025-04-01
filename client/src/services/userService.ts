import api from './api';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
  };
  language: string;
}

export interface User {
  id: string;
  auth0Id: string;
  email: string;
  name: string;
  picture?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  title?: string;
  department?: string;
  location?: string;
  timezone?: string;
  bio?: string;
  preferences: UserPreferences;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  title?: string;
  department?: string;
  location?: string;
  timezone?: string;
  bio?: string;
}

export interface PreferencesUpdateData {
  theme?: 'light' | 'dark' | 'system';
  notifications?: {
    email?: boolean;
    push?: boolean;
  };
  language?: string;
}

export const userService = {
  // Get current user profile
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: ProfileUpdateData): Promise<User> => {
    const response = await api.patch('/users/me', data);
    return response.data;
  },

  // Get user preferences
  getPreferences: async (): Promise<UserPreferences> => {
    const response = await api.get('/users/me/preferences');
    return response.data;
  },

  // Update user preferences
  updatePreferences: async (data: PreferencesUpdateData): Promise<UserPreferences> => {
    const response = await api.patch('/users/me/preferences', data);
    return response.data;
  },
};