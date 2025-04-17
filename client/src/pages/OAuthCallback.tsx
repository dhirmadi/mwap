import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * OAuth callback page that receives the authorization code
 * and sends it back to the opener window
 */
export function OAuthCallback() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code && state && window.opener) {
      // Send code and state back to opener
      window.opener.postMessage({ code, state }, window.location.origin);
      // Close this window
      window.close();
    }
  }, [searchParams]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      Processing OAuth callback...
    </div>
  );
}