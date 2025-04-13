import { useMutation } from '@tanstack/react-query';
import { ProjectRole } from './useProjects'; // Reuse project types

// Types
interface ProjectMember {
  userId: string;
  role: ProjectRole;
}

interface Project {
  id: string;
  name: string;
  role: ProjectRole;
  members: ProjectMember[];
}

interface RedeemResponse {
  message: string;
  project: Project;
}

interface RedeemError {
  message: string;
  errors?: Array<{
    code: string;
    message: string;
  }>;
}

interface UseInviteRedeemReturn {
  redeemInvite: (code: string) => Promise<RedeemResponse>;
  data: RedeemResponse | null;
  error: RedeemError | null;
  loading: boolean;
  success: boolean;
  reset: () => void;
}

/**
 * Hook to redeem an invite code and join a project
 * @returns {UseInviteRedeemReturn} Mutation function and state
 * 
 * @example
 * ```tsx
 * const { redeemInvite, loading, error, success, data } = useInviteRedeem();
 * 
 * const handleRedeem = async (code: string) => {
 *   try {
 *     await redeemInvite(code);
 *   } catch (err) {
 *     // Handle error
 *   }
 * };
 * 
 * if (success) {
 *   return <div>Successfully joined project: {data.project.name}</div>;
 * }
 * ```
 */
export function useInviteRedeem(): UseInviteRedeemReturn {
  const {
    mutateAsync,
    data,
    error,
    isLoading,
    isSuccess,
    reset
  } = useMutation<RedeemResponse, RedeemError, string>({
    mutationFn: async (code: string) => {
      const response = await fetch('/api/invites/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Auth header will be added by interceptor
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        const error = await response.json();
        throw {
          message: error.message || 'Failed to redeem invite code',
          errors: error.errors
        };
      }

      return response.json();
    },
    // Optional: Invalidate projects query on success
    onSuccess: () => {
      // queryClient.invalidateQueries(['projects']);
    }
  });

  return {
    redeemInvite: mutateAsync,
    data: data || null,
    error: error || null,
    loading: isLoading,
    success: isSuccess,
    reset
  };
}