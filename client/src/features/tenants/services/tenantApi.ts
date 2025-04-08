import { TenantJoinResponse, TenantRequestResponse } from '../types/tenant.types';
import { useApi } from '../../../services/api';

export const useTenantApi = () => {
  const api = useApi();

  const joinTenant = async (code: string): Promise<TenantJoinResponse> => {
    const response = await api.post<TenantJoinResponse>('/tenants/join', { code });
    return response.data;
  };

  const requestTenant = async (name: string): Promise<TenantRequestResponse> => {
    const response = await api.post<TenantRequestResponse>('/tenants/request', { name });
    return response.data;
  };

  return {
    joinTenant,
    requestTenant,
  };
};