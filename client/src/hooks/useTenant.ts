import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { api } from '../services/api';

export interface Tenant {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export function useTenant() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: tenant,
    isLoading,
    error
  } = useQuery({
    queryKey: ['tenant'],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No token available');

      const response = await api.get<Tenant>('/tenant/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('[useTenant] Tenant data:', response.data);
      return response.data;
    }
  });

  const createTenant = useMutation({
    mutationFn: async (name: string) => {
      const token = await getToken();
      if (!token) throw new Error('No token available');

      const response = await api.post<Tenant>('/tenant', { name }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
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