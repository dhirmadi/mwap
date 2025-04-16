import { useAuth0 } from '@auth0/auth0-react';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

/**
 * Custom hook that provides optimized authentication functionality.
 * Handles Auth0 integration, token management, and user state.
 */
export function useAuth() {
  const {
    isAuthenticated,
    isLoading,
    error,
    user,
    getAccessTokenSilently,
    loginWithRedirect,
    logout,
  } = useAuth0();
  const navigate = useNavigate();

  // Handle authentication errors
  useEffect(() => {
    if (error) {
      console.error('Auth Error:', error);
      // You might want to show a notification or handle specific error types
    }
  }, [error]);

  // Get access token with error handling and caching
  const getToken = useCallback(async () => {
    try {
      console.debug('Getting access token...');
      const token = await getAccessTokenSilently();
      
      // Validate token format and expiration
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiresAt = payload.exp * 1000;
        const timeUntilExpiry = expiresAt - Date.now();
        
        console.debug('Token validation:', {
          expiresAt: new Date(expiresAt).toISOString(),
          timeUntilExpiry: `${Math.round(timeUntilExpiry / 1000)}s`,
          audience: payload.aud,
          scope: payload.scope
        });

        if (Date.now() >= expiresAt) {
          console.warn('Token is expired, forcing refresh');
          throw new Error('Token expired');
        }
      } catch (parseError) {
        console.error('Token validation failed:', parseError);
        throw new Error('Invalid token format');
      }

      return token;
    } catch (error) {
      console.error('Error getting access token:', {
        error,
        isAuthenticated,
        user: user?.sub
      });

      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('login required') || 
            error.message === 'Token expired' ||
            error.message === 'Invalid token format') {
          console.debug('Redirecting to login...');
          await handleLogin(window.location.pathname);
          throw new Error('Authentication required');
        }
      }

      throw new Error('Failed to get access token');
    }
  }, [getAccessTokenSilently, isAuthenticated, user, handleLogin]);

  // Enhanced login handler with state management
  const handleLogin = useCallback(async (returnTo?: string) => {
    try {
      await loginWithRedirect({
        appState: { returnTo: returnTo || window.location.pathname },
      });
    } catch (error) {
      console.error('Login error:', error);
    }
  }, [loginWithRedirect]);

  // Enhanced logout handler with cleanup
  const handleLogout = useCallback(async () => {
    try {
      await logout({
        logoutParams: {
          returnTo: window.location.origin,
        },
      });
      // Clear any local state if needed
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [logout, navigate]);

  // Transform Auth0 user to our app's user model
  const authUser: AuthUser | null = user ? {
    id: user.sub!,
    email: user.email!,
    name: user.name!,
    picture: user.picture,
  } : null;

  return {
    isAuthenticated,
    isLoading,
    error,
    user: authUser,
    getToken,
    login: handleLogin,
    logout: handleLogout,
  };
}