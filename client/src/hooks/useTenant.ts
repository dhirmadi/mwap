import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi, get, post } from '../core/api';
import { AppError } from '../core/errors';
import { API_PATHS } from '../core/api/paths';
import { 
  Tenant, 
  TenantResponse, 
  CreateTenantRequest 
} from '../types';

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
export interface UseTenantResult {
  readonly tenant: Tenant | null;
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly createTenant?: (data: CreateTenantRequest) => Promise<void>;
  readonly isCreating?: boolean;
  readonly createError?: AppError | null;
}

/**
 * Hook for managing tenant data
 * 
 * @param id Optional tenant ID. If provided, fetches that specific tenant.
 *           If not provided, fetches the current user's tenant.
 * 
 * @example
 * ```typescript
 * // Get current tenant with mutation capabilities
 * const { tenant, isLoading, error, createTenant } = useTenant();
 * 
 * // Get specific tenant by ID
 * const { tenant, isLoading, error } = useTenant('tenant-id');
 * ```
 */
export function useTenant(id?: string): UseTenantResult {
  const api = useApi();
  const queryClient = useQueryClient();

  // Query for getting tenant data
  const {
    data: tenantResponse,
    isLoading,
    error: queryError
  } = useQuery<TenantResponse, AppError>({
    queryKey: id ? [...TENANT_QUERY_KEY, id] : TENANT_QUERY_KEY,
    queryFn: async () => {
      const response = await get<TenantResponse>(
        api,
        id ? API_PATHS.TENANT.GET(id) : API_PATHS.TENANT.CURRENT
      );
      return response;
    },
    ...TENANT_QUERY_CONFIG,
    enabled: id ? !!id : true // Only run query if ID is provided when in ID mode
  });

  // Mutation for creating tenant
  const mutation = useMutation<
    TenantResponse,
    AppError,
    CreateTenantRequest
  >({
    mutationFn: async (data) => {
      return await post<TenantResponse, CreateTenantRequest>(
        api,
        API_PATHS.TENANT.CREATE,
        data
      );
    },
    onSuccess: () => {
      // Invalidate tenant query to refetch
      queryClient.invalidateQueries({ queryKey: TENANT_QUERY_KEY });
    }
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

  const result: UseTenantResult = {
    tenant: tenantResponse?.data ? transformTenant(tenantResponse.data) : null,
    isLoading,
    error: queryError ?? null
  };

  // Only include mutation-related fields when not in ID mode
  if (!id) {
    result.createTenant = mutation.mutate;
    result.isCreating = mutation.isPending;
    result.createError = mutation.error ?? null;
  }

  return result;
}