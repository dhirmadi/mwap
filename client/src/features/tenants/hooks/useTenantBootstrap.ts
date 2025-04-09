import { useAuth0 } from '@auth0/auth0-react';
import { useCallback, useEffect, useState } from 'react';
import { useApi } from '../../../services/api';

import { UserProfile } from '../types/tenant.types';

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
  const { isAuthenticated } = useAuth0();
  const api = useApi();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [redirectTo, setRedirectTo] = useState<string>('/');

  const bootstrap = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch user profile
      const { data: profile } = await api.get<UserProfile>('/users/me');

      // Store isSuperAdmin status
      localStorage.setItem('isSuperAdmin', JSON.stringify(profile.isSuperAdmin));

      // Determine redirect path based on profile
      if (profile.isSuperAdmin) {
        // Super admins go to admin dashboard
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
        localStorage.setItem('currentTenantStatus', tenant.status);
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
  }, [api]);

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