import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { CreateInviteRequest, InviteCodeResponse, Member } from '../types/tenant.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const useInviteApi = () => {
  const { getAccessTokenSilently } = useAuth0();

  const getAuthHeaders = async () => {
    const token = await getAccessTokenSilently();
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const createInvite = async (
    tenantId: string,
    request: CreateInviteRequest
  ): Promise<InviteCodeResponse> => {
    const headers = await getAuthHeaders();
    const response = await axios.post<InviteCodeResponse>(
      `${API_URL}/tenants/${tenantId}/invite`,
      request,
      { headers }
    );
    return response.data;
  };

  const getMembers = async (tenantId: string): Promise<Member[]> => {
    const headers = await getAuthHeaders();
    const response = await axios.get<{ members: Member[] }>(
      `${API_URL}/tenants/${tenantId}/members`,
      { headers }
    );
    return response.data.members;
  };

  return {
    createInvite,
    getMembers,
  };
};