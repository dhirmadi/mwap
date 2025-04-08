import { useAuth0 } from '@auth0/auth0-react';
import { useCallback, useEffect, useState } from 'react';

interface Tenant {
  tenantId: string;
  name: string;
  role: 'admin' | 'deputy' | 'contributor';
}

interface UserProfile {
  isSuperAdmin: boolean;
  tenants: Tenant[];
}

interface BootstrapResult {
  redirectTo: string;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to determine the initial route after user login based on their profile and tenant access
 * @returns Object containing redirect path and loading/error states
 */
export function useTenantBootstrap(): BootstrapResult {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [redirectTo, setRedirectTo] = useState<string>('/');

  const bootstrap = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get JWT token
      const token = await getAccessTokenSilently();

      // Fetch user profile
      const response = await fetch('/api/me', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const profile: UserProfile = await response.json();

      // Determine redirect path based on profile
      if (profile.isSuperAdmin) {
        // Super admins go to admin dashboard
        localStorage.setItem('isSuperAdmin', 'true');
        setRedirectTo('/admin');
      } else if (profile.tenants.length === 0) {
        // Users with no tenants go to onboarding
        setRedirectTo('/onboarding');
      } else if (profile.tenants.length === 1) {
        // Users with single tenant are automatically placed in that context
        const tenant = profile.tenants[0];
        localStorage.setItem('currentTenantId', tenant.tenantId);
        localStorage.setItem('currentTenantName', tenant.name);
        localStorage.setItem('currentTenantRole', tenant.role);
        setRedirectTo(`/tenant/${tenant.tenantId}/dashboard`);
      } else {
        // Users with multiple tenants choose one
        setRedirectTo('/tenant-select');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      setRedirectTo('/error');
    } finally {
      setIsLoading(false);
    }
  }, [getAccessTokenSilently]);

  // Execute bootstrap when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      bootstrap();
    }
  }, [isAuthenticated, bootstrap]);

  return {
    redirectTo,
    isLoading,
    error,
  };
}