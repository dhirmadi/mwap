import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi, get, post } from '../core/api';
import { TenantResponse, CreateTenantRequest } from '../types';
import { API_PATHS } from '../core/api/paths';
import { debug } from '../utils/debug';

export function useTenant() {
  const api = useApi();
  const queryClient = useQueryClient();

  // Fetch the current tenant (GET /api/v1/tenant/me)
  const { data: tenant, isLoading: isLoadingTenant, error: tenantError } = useQuery<TenantResponse>({
    queryKey: ['tenant', 'me'],
    queryFn: async () => {
      const tenant = await get<TenantResponse>(api, API_PATHS.TENANT.CURRENT);
      debug.info('Fetched tenant:', tenant);
      return tenant;
    }
  });

  // Create a new tenant (POST /api/v1/tenant)
  const { mutate: createTenant, isLoading: isCreatingTenant, error: createError } = useMutation<TenantResponse, Error, CreateTenantRequest>({
    mutationFn: async (request) => {
      try {
        debug.info('Creating tenant:', request);
        const tenant = await post<TenantResponse>(
          api,
          API_PATHS.TENANT.CREATE,
          { name: request.name },
          {
            headers: {
              'X-Request-ID': `create-tenant-${Date.now()}`
            }
          }
        );

        if (!tenant?.id) {
          debug.error('Invalid tenant response', { tenant });
          throw new Error('Invalid tenant response');
        }

        debug.info('Tenant created successfully:', tenant);
        return tenant;
      } catch (error: any) {
        debug.error('Tenant creation failed:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'me'] });
    },
    onError: (error) => {
      debug.error('Tenant creation error:', error);
    }
  });

  return {
    tenant,
    isLoadingTenant,
    tenantError,
    createTenant,
    isCreatingTenant,
    createError
  };
}
