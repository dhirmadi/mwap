import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { useUserService, User } from '../services/userService';
import axios from 'axios';

export function useProfile() {
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userService = useUserService();

  useEffect(() => {
    async function loadProfile() {
      if (!isAuthenticated) {
        setLoading(false);
        setUser(null);
        return;
      }

      if (!authUser) {
        setLoading(true);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('Loading profile for:', {
          sub: authUser.id,
          email: authUser.email
        });
        const profile = await userService.getCurrentUser();
        console.log('Profile loaded:', profile);
        setUser(profile);
      } catch (err) {
        console.error('Error loading profile:', err);
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          // Try to create profile if it doesn't exist
          try {
            console.log('Profile not found, creating new profile');
            const profile = await userService.createProfile({
              id: authUser.id,
              email: authUser.email,
              name: authUser.name
            });
            console.log('New profile created:', profile);
            setUser(profile);
            setError(null);
            return;
          } catch (createError) {
            console.error('Error creating profile:', createError);
            if (axios.isAxiosError(createError) && createError.response?.status === 400) {
              // Profile already exists but we got a 404 earlier - retry getting the profile
              try {
                console.log('Profile exists, retrying get');
                const profile = await userService.getCurrentUser();
                console.log('Profile retrieved:', profile);
                setUser(profile);
                setError(null);
                return;
              } catch (retryError) {
                console.error('Error retrying profile get:', retryError);
                setError('Failed to load user profile');
              }
            } else {
              setError('Failed to create user profile');
            }
          }
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load profile');
        }
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [isAuthenticated, authUser, userService]);

  return {
    user,
    authUser,
    loading: loading || authLoading,
    error,
    setUser,
    userService,
  };
}