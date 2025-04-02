import { useApi } from './api';
import { useCallback } from 'react';

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

export const useUserService = () => {
  const api = useApi();

  return {
    // Get current user profile
    getCurrentUser: useCallback(async (): Promise<User> => {
      const response = await api.get('/users/me');
      return response.data;
    }, [api]),

    // Create user profile
    createProfile: useCallback(async (auth0User: { id: string; email: string; name: string }): Promise<User> => {
      const response = await api.post('/users/me', {
        auth0Id: auth0User.id,
        email: auth0User.email,
        name: auth0User.name
      });
      return response.data;
    }, [api]),

    // Update user profile
    updateProfile: useCallback(async (data: ProfileUpdateData): Promise<User> => {
      const response = await api.patch('/users/me', data);
      return response.data;
    }, [api]),

    // Get user preferences
    getPreferences: useCallback(async (): Promise<UserPreferences> => {
      const response = await api.get('/users/me/preferences');
      return response.data;
    }, [api]),

    // Update user preferences
    updatePreferences: useCallback(async (data: PreferencesUpdateData): Promise<UserPreferences> => {
      const response = await api.patch('/users/me/preferences', data);
      return response.data;
    }, [api]),
  };
};