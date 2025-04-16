import { useAuth0 } from '@auth0/auth0-react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

/**
 * Custom hook that provides authentication functionality.
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

  const getToken = useCallback(async () => {
    try {
      return await getAccessTokenSilently();
    } catch (error) {
      if (error instanceof Error && error.message.includes('login required')) {
        await loginWithRedirect({
          appState: { returnTo: window.location.pathname }
        });
      }
      throw error;
    }
  }, [getAccessTokenSilently, loginWithRedirect]);

  const handleLogout = useCallback(async () => {
    await logout({ logoutParams: { returnTo: window.location.origin } });
    navigate('/', { replace: true });
  }, [logout, navigate]);

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
    login: loginWithRedirect,
    logout: handleLogout,
  };
}