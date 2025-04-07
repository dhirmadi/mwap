import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { TenantJoinResponse, TenantRequestResponse } from '../types/tenant.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const useTenantApi = () => {
  const { getAccessTokenSilently } = useAuth0();

  const getAuthHeaders = async () => {
    const token = await getAccessTokenSilently();
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const joinTenant = async (code: string): Promise<TenantJoinResponse> => {
    const headers = await getAuthHeaders();
    const response = await axios.post<TenantJoinResponse>(
      `${API_URL}/tenants/join`,
      { code },
      { headers }
    );
    return response.data;
  };

  const requestTenant = async (name: string): Promise<TenantRequestResponse> => {
    const headers = await getAuthHeaders();
    const response = await axios.post<TenantRequestResponse>(
      `${API_URL}/tenants/request`,
      { name },
      { headers }
    );
    return response.data;
  };

  return {
    joinTenant,
    requestTenant,
  };
};