import { CreateInviteRequest, InviteCodeResponse, Member } from '../types/tenant.types';
import { useApi } from '../../../services/api';

export const useInviteApi = () => {
  const api = useApi();

  const createInvite = async (
    tenantId: string,
    request: CreateInviteRequest
  ): Promise<InviteCodeResponse> => {
    const response = await api.post<InviteCodeResponse>(
      `/tenants/${tenantId}/invite`,
      request
    );
    return response.data;
  };

  const getMembers = async (tenantId: string): Promise<Member[]> => {
    const response = await api.get<{ members: Member[] }>(
      `/tenants/${tenantId}/members`
    );
    return response.data.members;
  };

  return {
    createInvite,
    getMembers,
  };
};