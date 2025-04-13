import useSWR from 'swr';
import { useCallback } from 'react';

// Types
interface Tenant {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  archived: boolean;
}

interface TenantError {
  message: string;
  status?: number;
}

interface UseTenantReturn {
  tenant: Tenant | null;
  loading: boolean;
  error: TenantError | null;
  mutate: () => Promise<void>;
}

// Fetch function for SWR
const fetchTenant = async (url: string): Promise<Tenant> => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      // Auth header will be added by interceptor
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch tenant');
  }

  return response.json();
};

/**
 * Hook to fetch and cache the current user's tenant
 * @returns {UseTenantReturn} Tenant data, loading state, error state, and mutate function
 * 
 * @example
 * ```tsx
 * const { tenant, loading, error } = useTenant();
 * 
 * if (loading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * if (!tenant) return <div>No tenant found</div>;
 * 
 * return <div>Tenant: {tenant.name}</div>;
 * ```
 */
export function useTenant(): UseTenantReturn {
  // Use SWR for data fetching and caching
  const {
    data: tenant,
    error,
    isLoading,
    mutate
  } = useSWR<Tenant, TenantError>('/api/tenant/me', fetchTenant, {
    revalidateOnFocus: false, // Don't revalidate on window focus
    revalidateOnReconnect: true, // Revalidate when reconnecting
    dedupingInterval: 5000, // Dedupe requests within 5 seconds
  });

  // Memoized mutate function
  const refreshTenant = useCallback(async () => {
    await mutate();
  }, [mutate]);

  return {
    tenant: tenant || null,
    loading: isLoading,
    error: error || null,
    mutate: refreshTenant
  };
}