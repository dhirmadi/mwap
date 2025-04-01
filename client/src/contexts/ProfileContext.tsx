import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, ProfileUpdateData, useUserService } from '../services/userService';

interface ProfileContextType {
  profile: User | null;
  loading: boolean;
  error: Error | null;
  updateProfile: (data: ProfileUpdateData) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

interface ProfileProviderProps {
  children: React.ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const { isAuthenticated, user: authUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const userService = useUserService();

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const profile = await userService.getCurrentUser();
      setProfile(profile);
    } catch (err) {
      console.error('Error loading profile:', err);
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error('Failed to load profile'));
      }
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!authUser) return;
    try {
      setLoading(true);
      setError(null);
      const profile = await userService.createProfile({
        id: authUser.id,
        email: authUser.email,
        name: authUser.name,
      });
      setProfile(profile);
    } catch (err) {
      console.error('Error creating profile:', err);
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error('Failed to create profile'));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !authUser) {
      setProfile(null);
      setLoading(false);
      return;
    }

    loadProfile().catch(async (err) => {
      if (err.response?.status === 404) {
        await createProfile();
      }
    });
  }, [isAuthenticated, authUser]);

  const updateProfile = async (data: ProfileUpdateData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedProfile = await userService.updateProfile(data);
      setProfile(updatedProfile);
    } catch (err) {
      console.error('Error updating profile:', err);
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error('Failed to update profile'));
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    await loadProfile();
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        error,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};