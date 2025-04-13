import useSWR from 'swr';
import { useCallback } from 'react';
import { ProjectRole } from './useProjects'; // Reuse project types

// Types
interface ProjectMember {
  userId: string;
  role: ProjectRole;
}

interface MembersResponse {
  members: ProjectMember[];
}

interface MembersError {
  message: string;
  status?: number;
}

interface UseProjectMembersReturn {
  members: ProjectMember[];
  loading: boolean;
  error: MembersError | null;
  mutate: () => Promise<void>;
}

// Fetch function for SWR with retries
const fetchMembers = async (url: string): Promise<MembersResponse> => {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second

  const fetchWithRetry = async (retryCount: number): Promise<MembersResponse> => {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          // Auth header will be added by interceptor
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch project members');
      }

      return response.json();
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        return fetchWithRetry(retryCount + 1);
      }
      throw error;
    }
  };

  return fetchWithRetry(0);
};

/**
 * Hook to fetch and cache project members
 * @param {string} projectId The ID of the project
 * @returns {UseProjectMembersReturn} Members data, loading state, error state, and mutate function
 * 
 * @example
 * ```tsx
 * const { members, loading, error } = useProjectMembers('project-123');
 * 
 * if (loading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * if (!members.length) return <div>No members found</div>;
 * 
 * return (
 *   <ul>
 *     {members.map(member => (
 *       <li key={member.userId}>
 *         {member.userId} - {member.role}
 *       </li>
 *     ))}
 *   </ul>
 * );
 * ```
 */
export function useProjectMembers(projectId: string): UseProjectMembersReturn {
  // Build URL
  const url = `/api/projects/${projectId}/members`;

  // Use SWR for data fetching and caching
  const {
    data,
    error,
    isLoading,
    mutate
  } = useSWR<MembersResponse, MembersError>(
    projectId ? url : null, // Only fetch if projectId is provided
    fetchMembers,
    {
      revalidateOnFocus: false, // Don't revalidate on window focus
      revalidateOnReconnect: true, // Revalidate when reconnecting
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
      shouldRetryOnError: true, // Enable retry on error
      errorRetryCount: 3, // Maximum number of retries
      errorRetryInterval: 1000, // Base retry interval (will be multiplied by attempt number)
    }
  );

  // Memoized mutate function
  const refreshMembers = useCallback(async () => {
    await mutate();
  }, [mutate]);

  return {
    members: data?.members || [],
    loading: isLoading,
    error: error || null,
    mutate: refreshMembers
  };
}