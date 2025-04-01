import { Auth0Provider } from '@auth0/auth0-react';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export const Auth0ProviderWithConfig = ({ children }: Props) => {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  if (!domain || !clientId || !audience) {
    console.error('Missing Auth0 configuration:', { domain, clientId, audience });
    return <div>Error: Auth0 configuration is missing</div>;
  }

  // Get the current origin, ensuring it ends without a trailing slash
  const origin = window.location.origin.replace(/\/$/, '');

  console.log('Auth0 Configuration:', {
    domain,
    clientId,
    audience,
    redirect_uri: origin
  });

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: origin,
        audience: audience,
        scope: 'openid profile email',
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
      useRefreshTokensFallback={true}
      onRedirectCallback={(appState) => {
        console.log('Auth0 Redirect Callback:', { appState });
        window.history.replaceState(
          {},
          document.title,
          appState?.returnTo || window.location.pathname
        );
      }}
    >
      {children}
    </Auth0Provider>
  );
};