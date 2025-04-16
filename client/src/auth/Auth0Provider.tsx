import { Auth0Provider } from '@auth0/auth0-react';
import { ReactNode, useEffect } from 'react';
import { AppState } from '@auth0/auth0-react';
import { notifications } from '@mantine/notifications';

interface Props {
  children: ReactNode;
}

/**
 * Auth0 configuration wrapper that provides authentication services to the application.
 * Configured for Single Page Application (SPA) using Authorization Code Flow with PKCE.
 */
export const Auth0ProviderWithConfig = ({ children }: Props) => {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  // Validate required configuration and token state
  useEffect(() => {
    // Check configuration
    if (!domain || !clientId || !audience) {
      console.error('Missing Auth0 configuration:', { domain, clientId, audience });
      notifications.show({
        title: 'Configuration Error',
        message: 'Auth0 configuration is missing. Please check environment variables.',
        color: 'red'
      });
      return;
    }

    // Log configuration for debugging
    console.debug('Auth0 configuration:', {
      domain,
      clientId,
      audience,
      redirectUri: window.location.origin
    });

    // Set up token validation interval
    const validateToken = async () => {
      try {
        const token = await getAccessTokenSilently({
          detailedResponse: true
        });

        console.debug('Token state:', {
          expiresAt: new Date(token.expires_at * 1000).toISOString(),
          scope: token.scope,
          tokenType: token.token_type
        });

      } catch (error) {
        console.error('Token validation failed:', error);
        if (error instanceof Error && error.message.includes('login required')) {
          notifications.show({
            title: 'Session Expired',
            message: 'Please log in again to continue.',
            color: 'yellow'
          });
        }
      }
    };

    // Run initial validation
    validateToken();

    // Set up periodic validation
    const interval = setInterval(validateToken, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [domain, clientId, audience, getAccessTokenSilently]);

  // Handle redirect after authentication
  const onRedirectCallback = (appState?: AppState) => {
    try {
      // If there's a returnTo path in appState, use it; otherwise, go to root
      const returnPath = appState?.returnTo || window.location.pathname;
      
      // Replace the URL without adding to history
      window.history.replaceState({}, document.title, returnPath);

      // Show success notification
      notifications.show({
        title: 'Success',
        message: 'Successfully logged in',
        color: 'green'
      });
    } catch (error) {
      console.error('Error in redirect callback:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to complete login. Please try again.',
        color: 'red'
      });
    }
  };

  // Handle authentication errors
  const onError = (error: Error) => {
    console.error('Auth0 error:', error);
    notifications.show({
      title: 'Authentication Error',
      message: error.message || 'An error occurred during authentication',
      color: 'red'
    });
  };

  if (!domain || !clientId || !audience) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        Error: Auth0 configuration is missing. Please check your environment variables.
      </div>
    );
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience,
        scope: 'openid profile email offline_access',
      }}
      // Enable optimal caching strategy for tokens
      cacheLocation="localstorage"
      // Enable automatic token renewal
      useRefreshTokens={true}
      // Handle redirect after login
      onRedirectCallback={onRedirectCallback}
      // Handle authentication errors
      onError={onError}
    >
      {children}
    </Auth0Provider>
  );
};