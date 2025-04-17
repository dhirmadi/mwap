import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi, get, post, del } from '../core/api/client';
import { API_PATHS } from '../core/api/paths';
import { Integration, IntegrationProvider, IntegrationListResponse } from '../types/tenant';
import { handleApiError } from '../core/errors';

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
      const response = await get<IntegrationListResponse>(
        api,
        API_PATHS.TENANT.INTEGRATIONS.LIST(tenantId)
      );
      return response.data;
    },
    enabled: !!tenantId,
  });

  // Connect new provider
  const connectMutation = useMutation({
    mutationFn: async (provider: IntegrationProvider) => {
      const response = await post<IntegrationListResponse>(
        api,
        API_PATHS.TENANT.INTEGRATIONS.ADD(tenantId),
        { provider }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      handleApiError(error);
    },
  });

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
      handleApiError(error);
    },
  });

  return {
    integrations,
    isLoading,
    error,
    connect: connectMutation.mutate,
    disconnect: disconnectMutation.mutate,
    isConnecting: connectMutation.isPending,
    isDisconnecting: disconnectMutation.isPending,
  };
}