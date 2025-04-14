import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../services/api';

export interface Tenant {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export function useTenant() {
  const api = useApi();
  const queryClient = useQueryClient();

  const {
    data: tenant,
    isLoading,
    error
  } = useQuery({
    queryKey: ['tenant'],
    queryFn: async () => {
      const response = await api.get<Tenant>('/tenant/me');
      console.log('[useTenant] Tenant data:', response.data);
      return response.data;
    }
  });

  const createTenant = useMutation({
    mutationFn: async (name: string) => {
      const response = await api.post<Tenant>('/tenant', { name });
      console.log('[useTenant] Created tenant:', response.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant'] });
    }
  });

  return {
    tenant,
    isLoading,
    error,
    createTenant: createTenant.mutate,
    isCreating: createTenant.isPending,
    createError: createTenant.error
  };
}