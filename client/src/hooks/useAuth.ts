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
      return await getAccessTokenSilently({
        authorizationParams: {
          scope: 'openid profile email'
        }
      });
    } catch (error) {
      console.error('Error getting access token:', error);
      // Handle token errors (e.g., expired session)
      if (error instanceof Error && error.message.includes('login required')) {
        handleLogin();
      }
      return null;
    }
  }, [getAccessTokenSilently]);

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