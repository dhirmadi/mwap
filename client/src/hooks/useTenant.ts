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
  readonly createTenant: (data: CreateTenantRequest) => Promise<void>;
  readonly isCreating: boolean;
  readonly createError: AppError | null;
}

/**
 * Hook for managing tenant data
 * 
 * @example
 * ```typescript
 * const { tenant, isLoading, error, createTenant } = useTenant();
 * 
 * // Get tenant data
 * if (isLoading) return <Loading />;
 * if (error) return <Error error={error} />;
 * if (!tenant) return <CreateTenant onSubmit={createTenant} />;
 * return <TenantInfo tenant={tenant} />;
 * ```
 */
export function useTenant(): UseTenantResult {
  const api = useApi();
  const queryClient = useQueryClient();

  // Query for getting tenant data
  const {
    data: tenantResponse,
    isLoading,
    error: queryError
  } = useQuery<TenantResponse, AppError>({
    queryKey: TENANT_QUERY_KEY,
    queryFn: async () => {
      // No error handling needed for null tenant
      const response = await get<TenantResponse>(api, API_PATHS.TENANT.CURRENT);
      return response;
    },
    ...TENANT_QUERY_CONFIG
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
      ownerId: data.members.find((m: any) => m.role === 'OWNER')?.userId ?? '',
      createdAt: data.createdAt,
      updatedAt: data.createdAt // API doesn't have updatedAt yet
    };
  };

  return {
    tenant: tenantResponse?.data ? transformTenant(tenantResponse.data) : null,
    isLoading,
    error: queryError ?? null,
    createTenant: mutation.mutate,
    isCreating: mutation.isPending,
    createError: mutation.error ?? null
  };
}