import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi, get, del } from '../core/api/client';
import { API_PATHS } from '../core/api/paths';
import { Integration, IntegrationProvider, IntegrationListResponse } from '../types/tenant';
import { transformApiError } from '../core/errors';

/**
 * Hook for managing tenant cloud integrations
 */
export function useCloudIntegrations(tenantId: string) {
  const api = useApi();
  const queryClient = useQueryClient();
  const queryKey = ['tenant', tenantId, 'integrations'];

  // Fetch integrations
  const { data: integrations = [], isLoading, error } = useQuery<Integration[]>({
    queryKey,
    queryFn: async () => {
      console.info('Fetching integrations:', {
        tenantId,
        url: API_PATHS.TENANT.INTEGRATIONS.LIST(tenantId)
      });

      const response = await get<IntegrationListResponse>(
        api,
        API_PATHS.TENANT.INTEGRATIONS.LIST(tenantId)
      );

      console.info('Integrations response:', {
        status: response?.status,
        rawData: response?.data,
        integrations: response?.data?.map(i => ({
          provider: i.provider,
          token: i.token,
          connectedAt: i.connectedAt
        })),
        hasDropbox: response?.data?.some(i => i.provider.toUpperCase() === 'DROPBOX'),
        providersList: response?.data?.map(i => i.provider.toUpperCase()).join(', ')
      });

      return response.data;
    },
    enabled: !!tenantId,
  });

  // Connect new provider via OAuth2
  const connect = (provider: IntegrationProvider) => {
    // Provider is already lowercase
    const authProvider = provider;
    const baseUrl = import.meta.env.VITE_API_URL || '/api';
    window.location.href = `${baseUrl}/v1/auth/${authProvider}?tenantId=${tenantId}`;
  };

  // Disconnect provider
  const disconnectMutation = useMutation({
    mutationFn: async (provider: IntegrationProvider) => {
      const response = await del<IntegrationListResponse>(
        api,
        API_PATHS.TENANT.INTEGRATIONS.REMOVE(tenantId, provider)
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      transformApiError(error);
    },
  });

  return {
    integrations,
    isLoading,
    error,
    connect,
    disconnect: disconnectMutation.mutate,
    isDisconnecting: disconnectMutation.isPending,
  };
}