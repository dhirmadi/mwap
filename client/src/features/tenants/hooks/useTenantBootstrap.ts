import { useAuth0 } from '@auth0/auth0-react';
import { useCallback, useEffect, useState, useRef } from 'react';
import { useApi } from '../../../services/api';
import { useNavigate } from 'react-router-dom';

import { UserProfile } from '../types/tenant.types';

interface BootstrapResult {
  redirectTo: string;
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
}

/**
 * Hook to determine the initial route after user login based on their profile and tenant access
 * @returns Object containing redirect path and loading/error states
 */
export function useTenantBootstrap(): BootstrapResult {
  const { isAuthenticated } = useAuth0();
  const api = useApi();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [redirectTo, setRedirectTo] = useState<string>('/');
  const bootstrapAttempted = useRef(false);
  const abortController = useRef<AbortController>();

  const bootstrap = useCallback(async () => {
    try {
      // Cancel any existing request
      if (abortController.current) {
        abortController.current.abort();
      }
      
      // Create new abort controller for this request
      abortController.current = new AbortController();
      
      setIsLoading(true);
      setError(null);

      // Fetch user profile with abort signal and safe response handling
      const response = await api.get<UserProfile>('/users/me', {
        signal: abortController.current.signal
      });

      const profile = response.data;
      
      // Check for malformed response
      if (!profile) {
        console.warn('Bootstrap failed: No profile data in response:', response);
        setRedirectTo('/error');
        setIsLoading(false);
        return;
      }

      // [1] SUPER ADMIN CHECK FIRST
      if (profile.isSuperAdmin) {
        console.debug('Bootstrap: Super admin detected, redirecting to admin dashboard');
        localStorage.setItem('isSuperAdmin', 'true');
        
        // Clear any tenant-specific data
        localStorage.removeItem('currentTenantId');
        localStorage.removeItem('currentTenantName');
        localStorage.removeItem('currentTenantRole');
        localStorage.removeItem('currentTenantStatus');
        
        setRedirectTo('/admin/tenants/pending');
        setIsLoading(false);
        return;
      }

      // [2] NON-SUPER ADMIN FLOW
      console.debug('Bootstrap: Regular user detected');
      localStorage.setItem('isSuperAdmin', 'false');

      if (!Array.isArray(profile.tenants)) {
        console.warn('Bootstrap: Invalid tenants array:', profile.tenants);
        setRedirectTo('/join-tenant');
        setIsLoading(false);
        return;
      }

      // [3] TENANT ROUTING
      if (profile.tenants.length === 0) {
        console.debug('Bootstrap: User has no tenants');
        setRedirectTo('/onboarding');
      } else if (profile.tenants.length === 1) {
        console.debug('Bootstrap: Single tenant user');
        const tenant = profile.tenants[0];
        localStorage.setItem('currentTenantId', tenant.tenantId);
        localStorage.setItem('currentTenantName', tenant.name);
        localStorage.setItem('currentTenantRole', tenant.role);
        localStorage.setItem('currentTenantStatus', tenant.status);
        setRedirectTo(`/tenant/${tenant.tenantId}/dashboard`);
      } else {
        console.debug('Bootstrap: Multi-tenant user');
        setRedirectTo('/tenant-select');
      }

      // Log final bootstrap state
      console.debug('Bootstrap complete:', {
        isSuperAdmin: profile.isSuperAdmin,
        tenantCount: profile.tenants.length,
        redirectTo,
        email: profile.email
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      setRedirectTo('/error');
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  // Execute bootstrap when authenticated
  useEffect(() => {
    if (isAuthenticated && !bootstrapAttempted.current) {
      bootstrapAttempted.current = true;
      bootstrap();
    }

    return () => {
      // Cleanup: abort any pending request when component unmounts
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [isAuthenticated, bootstrap]);

  // Expose retry function to manually trigger bootstrap
  const retry = useCallback(() => {
    bootstrapAttempted.current = false;
    if (isAuthenticated) {
      bootstrap();
    }
  }, [isAuthenticated, bootstrap]);

  return {
    redirectTo,
    isLoading,
    error,
    retry,
  };
}