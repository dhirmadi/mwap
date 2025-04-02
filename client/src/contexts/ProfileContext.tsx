import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { User, useUserService } from '../services/userService';
import axios from 'axios';

interface ProfileContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
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
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth0();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userService = useUserService();

  useEffect(() => {
    // Don't try to load profile until Auth0 is ready
    if (authLoading) {
      return;
    }

    // Don't try to load profile if not authenticated
    if (!isAuthenticated || !authUser) {
      setLoading(false);
      setUser(null);
      return;
    }

    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);

        try {
          const profile = await userService.getCurrentUser();
          setUser(profile);
          return;
        } catch (err) {
          if (!axios.isAxiosError(err) || err.response?.status !== 404) {
            throw err;
          }
          console.log('Profile not found, creating new profile');
        }

        // If we get here, profile doesn't exist (404)
        const profile = await userService.createProfile({
          id: authUser.sub,
          email: authUser.email,
          name: authUser.name,
          picture: authUser.picture
        });
        setUser(profile);
      } catch (err) {
        console.error('Error in profile flow:', err);
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [isAuthenticated, authLoading, authUser, userService]);

  return (
    <ProfileContext.Provider value={{ user, loading, error }}>
      {children}
    </ProfileContext.Provider>
  );
};