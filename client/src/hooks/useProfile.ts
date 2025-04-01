import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { useUserService, User } from '../services/userService';

export function useProfile() {
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userService = useUserService();

  useEffect(() => {
    async function loadProfile() {
      if (!isAuthenticated || !authUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const profile = await userService.getCurrentUser();
        console.log('Profile loaded:', profile);
        setUser(profile);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
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