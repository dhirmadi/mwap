import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { notifications } from '@mantine/notifications';

/**
 * Component that validates and monitors the authentication token state.
 * Must be rendered as a child of Auth0Provider.
 */
export const TokenValidator = () => {
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    // Set up token validation
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
  }, [getAccessTokenSilently]);

  // This component doesn't render anything
  return null;
};