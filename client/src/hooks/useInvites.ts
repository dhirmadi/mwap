import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { api } from '../services/api';

interface RedeemInviteResponse {
  projectId: string;
  projectName: string;
  role: string;
}

export function useInvites() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const redeemInvite = useMutation({
    mutationFn: async (code: string) => {
      const token = await getToken();
      if (!token) throw new Error('No token available');

      try {
        const response = await api.post<RedeemInviteResponse>('/invites/redeem', 
          { code },
          { headers: { Authorization: `Bearer ${token}` }}
        );
        
        console.log('[RedeemInvite] Success:', response.data);
        return response.data;
      } catch (error: any) {
        // Handle specific error cases
        if (error.response) {
          switch (error.response.status) {
            case 400:
              throw new Error('Invalid code');
            case 404:
              throw new Error('Invite not found');
            case 410:
              throw new Error('Expired invite');
            case 409:
              throw new Error('Already redeemed');
            default:
              throw new Error('Failed to redeem invite');
          }
        }
        throw error;
      }
    },
    onSuccess: () => {
      // Refresh projects list after successful redemption
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });

  return {
    redeemInvite: redeemInvite.mutate,
    isRedeeming: redeemInvite.isPending,
    error: redeemInvite.error
  };
}