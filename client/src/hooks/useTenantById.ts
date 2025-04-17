import { useQuery } from '@tanstack/react-query';
import { useApi, get } from '../core/api';
import { AppError } from '../core/errors';
import { API_PATHS } from '../core/api/paths';
import { Tenant, TenantResponse } from '../types';

/**
 * Query key for tenant data
 */
const TENANT_QUERY_KEY = ['tenant'] as const;

/**
 * Query configuration for tenant data
 */
const TENANT_QUERY_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 30 * 60 * 1000 // 30 minutes
} as const;

/**
 * Hook result type
 */
export interface UseTenantByIdResult {
  readonly tenant: Tenant | null;
  readonly isLoading: boolean;
  readonly error: AppError | null;
}

/**
 * Hook for fetching a specific tenant by ID
 */
export function useTenantById(id: string): UseTenantByIdResult {
  const api = useApi();

  // Query for getting tenant data
  const {
    data: tenantResponse,
    isLoading,
    error: queryError
  } = useQuery<TenantResponse, AppError>({
    queryKey: [...TENANT_QUERY_KEY, id],
    queryFn: async () => {
      const response = await get<TenantResponse>(api, API_PATHS.TENANT.GET(id));
      return response;
    },
    ...TENANT_QUERY_CONFIG,
    enabled: !!id // Only run query if ID is provided
  });

  // Transform API response to match our interface
  const transformTenant = (data: any): Tenant | null => {
    if (!data) return null;
    return {
      id: data._id,
      name: data.name,
      members: data.members,
      createdAt: data.createdAt,
      archived: data.archived ?? false
    };
  };

  return {
    tenant: tenantResponse?.data ? transformTenant(tenantResponse.data) : null,
    isLoading,
    error: queryError ?? null
  };
}