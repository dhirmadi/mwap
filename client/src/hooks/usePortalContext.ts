import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

/**
 * Hook to maintain auth context in portals
 * This hook ensures that auth tokens are properly propagated to portaled components
 */
export function usePortalContext() {
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    // Pre-fetch token to ensure it's available in the portal context
    const prefetchToken = async () => {
      try {
        await getAccessTokenSilently();
      } catch (error) {
        console.error('Failed to prefetch auth token:', error);
      }
    };

    prefetchToken();
  }, [getAccessTokenSilently]);
}