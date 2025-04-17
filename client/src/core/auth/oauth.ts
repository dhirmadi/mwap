import { IntegrationProvider } from '../../types/tenant';

const OAUTH_CONFIG = {
  GDRIVE: {
    clientId: process.env.REACT_APP_GDRIVE_CLIENT_ID,
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scope: 'https://www.googleapis.com/auth/drive.file',
  },
  DROPBOX: {
    clientId: process.env.REACT_APP_DROPBOX_CLIENT_ID,
    authUrl: 'https://www.dropbox.com/oauth2/authorize',
    tokenUrl: 'https://api.dropboxapi.com/oauth2/token',
    scope: 'files.content.read files.content.write',
  },
} as const;

/**
 * Opens OAuth consent window and returns the access token
 */
export async function getProviderToken(provider: IntegrationProvider): Promise<string | null> {
  const config = OAUTH_CONFIG[provider];
  if (!config?.clientId) {
    console.error(`OAuth client ID not configured for ${provider}`);
    return null;
  }

  // Generate random state for CSRF protection
  const state = Math.random().toString(36).substring(7);
  
  // Store state in session storage for validation
  sessionStorage.setItem('oauth_state', state);

  // Calculate redirect URI
  const redirectUri = `${window.location.origin}/oauth/callback`;

  // Build authorization URL
  const authParams = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: config.scope,
    state,
  });

  // Open popup for OAuth consent
  const popup = window.open(
    `${config.authUrl}?${authParams.toString()}`,
    'oauth_popup',
    'width=600,height=600'
  );

  // Wait for OAuth callback
  return new Promise((resolve) => {
    window.addEventListener('message', async (event) => {
      // Validate origin
      if (event.origin !== window.location.origin) return;

      const { code, state: returnedState } = event.data;

      // Validate state to prevent CSRF
      if (returnedState !== sessionStorage.getItem('oauth_state')) {
        console.error('OAuth state mismatch');
        resolve(null);
        return;
      }

      // Exchange code for token
      try {
        const tokenParams = new URLSearchParams({
          client_id: config.clientId,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
          code,
        });

        const response = await fetch(config.tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: tokenParams.toString(),
        });

        if (!response.ok) {
          throw new Error('Failed to exchange code for token');
        }

        const data = await response.json();
        resolve(data.access_token);
      } catch (error) {
        console.error('Failed to get OAuth token:', error);
        resolve(null);
      } finally {
        // Clean up
        sessionStorage.removeItem('oauth_state');
        popup?.close();
      }
    });
  });
}