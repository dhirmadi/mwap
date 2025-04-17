import { Auth0Provider } from '@auth0/auth0-react';
import { ReactNode } from 'react';
import { AppState } from '@auth0/auth0-react';
// Removed unused import: notifications

interface Props {
  children: ReactNode;
}

/**
 * Auth0 configuration wrapper that provides authentication services to the application.
 */
export const Auth0ProviderWithConfig = ({ children }: Props) => {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  if (!domain || !clientId || !audience) {
    console.error('Missing Auth0 configuration');
    return null;
  }

  const onRedirectCallback = (appState?: AppState) => {
    const returnPath = appState?.returnTo || window.location.pathname;
    window.history.replaceState({}, document.title, returnPath);
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience,
        scope: 'openid profile email'
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};