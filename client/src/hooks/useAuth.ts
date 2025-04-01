import { useAuth0 } from '@auth0/auth0-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth0UserData, ExtendedAuth0User, extractAuth0UserData } from '../services/auth0Service';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  user: Auth0UserData | null;
  token: string | null;
  expiresAt: number | null;
}

/**
 * Custom hook that provides optimized authentication functionality.
 * Handles Auth0 integration, token management, and user state.
 */
export function useAuth(): AuthState & {
  login: (returnTo?: string) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
} {
  const {
    isAuthenticated,
    isLoading: auth0Loading,
    error: auth0Error,
    user: auth0User,
    getAccessTokenSilently,
    loginWithRedirect,
    logout: auth0Logout,
  } = useAuth0();
  const navigate = useNavigate();

  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: null,
    user: null,
    token: null,
    expiresAt: null,
  });

  // Update auth state when Auth0 state changes
  useEffect(() => {
    setAuthState(prev => ({
      ...prev,
      isAuthenticated,
      isLoading: auth0Loading,
      error: auth0Error,
      user: auth0User ? extractAuth0UserData(auth0User as ExtendedAuth0User) : null,
    }));
  }, [isAuthenticated, auth0Loading, auth0Error, auth0User]);

  // Token management with automatic refresh
  useEffect(() => {
    if (!isAuthenticated) return;

    const refreshToken = async () => {
      try {
        const tokenResponse = await getAccessTokenSilently({
          detailedResponse: true,
        });

        setAuthState(prev => ({
          ...prev,
          token: tokenResponse.access_token,
          expiresAt: tokenResponse.expires_at,
        }));
      } catch (error) {
        console.error('Token refresh error:', error);
        if (error instanceof Error && error.message.includes('login required')) {
          handleLogin();
        }
      }
    };

    refreshToken();
    // Refresh token 5 minutes before expiry
    const interval = setInterval(refreshToken, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated, getAccessTokenSilently]);

  // Get access token with error handling and caching
  const getToken = useCallback(async () => {
    if (!authState.token || (authState.expiresAt && Date.now() >= authState.expiresAt * 1000)) {
      try {
        const tokenResponse = await getAccessTokenSilently({
          detailedResponse: true,
        });
        setAuthState(prev => ({
          ...prev,
          token: tokenResponse.access_token,
          expiresAt: tokenResponse.expires_at,
        }));
        return tokenResponse.access_token;
      } catch (error) {
        console.error('Error getting access token:', error);
        if (error instanceof Error && error.message.includes('login required')) {
          handleLogin();
        }
        return null;
      }
    }
    return authState.token;
  }, [authState.token, authState.expiresAt, getAccessTokenSilently]);

  // Enhanced login handler with state management
  const handleLogin = useCallback(async (returnTo?: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      await loginWithRedirect({
        appState: { returnTo: returnTo || window.location.pathname },
      });
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Login failed'),
      }));
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, [loginWithRedirect]);

  // Enhanced logout handler with cleanup
  const handleLogout = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      await auth0Logout({
        logoutParams: {
          returnTo: window.location.origin,
        },
      });
      // Clear auth state
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        error: null,
        user: null,
        token: null,
        expiresAt: null,
      });
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      setAuthState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Logout failed'),
      }));
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, [auth0Logout, navigate]);

  return {
    ...authState,
    login: handleLogin,
    logout: handleLogout,
    getToken,
  };
}