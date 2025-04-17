import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../core/api';
import { API_PATHS } from '../core/api/paths';

interface RedeemInviteResponse {
  projectId: string;
  projectName: string;
  role: string;
}

export function useInvites() {
  const api = useApi();
  const queryClient = useQueryClient();

  const redeemInvite = useMutation({
    mutationFn: async (code: string) => {
      try {
        const response = await api.post<RedeemInviteResponse>(API_PATHS.INVITE.REDEEM, { code });
        console.log('[RedeemInvite] Success:', response.data);
        return response.data;
      } catch (error: unknown) {
        const err = error as { response?: { status: number } };
        // Handle specific error cases
        if (err.response) {
          switch (err.response.status) {
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