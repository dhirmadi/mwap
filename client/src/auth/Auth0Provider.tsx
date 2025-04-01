import { Auth0Provider } from '@auth0/auth0-react';
import { ReactNode } from 'react';
import { AppState } from '@auth0/auth0-react';

interface Props {
  children: ReactNode;
}

/**
 * Auth0 configuration wrapper that provides authentication services to the application.
 * Configured for Single Page Application (SPA) using Authorization Code Flow with PKCE.
 * 
 * Required environment variables:
 * - VITE_AUTH0_DOMAIN: Auth0 domain (e.g., 'your-tenant.auth0.com')
 * - VITE_AUTH0_CLIENT_ID: Auth0 application client ID
 * - VITE_AUTH0_AUDIENCE: API identifier (e.g., 'https://api.your-app.com')
 * 
 * Features:
 * - Automatic token refresh
 * - Persistent session handling
 * - Error handling and recovery
 * - Redirect handling after login
 */
export const Auth0ProviderWithConfig = ({ children }: Props) => {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  // Validate required configuration
  if (!domain || !clientId || !audience) {
    console.error('Missing Auth0 configuration:', { domain, clientId, audience });
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        Error: Auth0 configuration is missing. Please check your environment variables.
      </div>
    );
  }

  // Handle redirect after authentication
  const onRedirectCallback = (appState?: AppState) => {
    // If there's a returnTo path in appState, use it; otherwise, go to root
    const returnPath = appState?.returnTo || window.location.pathname;
    
    // Replace the URL without adding to history
    window.history.replaceState({}, document.title, returnPath);
  };

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
      useRefreshTokensFallback={true}
      // Handle redirect after login
      onRedirectCallback={onRedirectCallback}
      // Configure token refresh
      tokenRefreshMode="in-memory"
      // Configure token expiration buffer
      tokenRefreshBuffer={60} // Refresh token 60 seconds before expiration
    >
      {children}
    </Auth0Provider>
  );
}