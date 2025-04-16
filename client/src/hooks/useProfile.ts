import { useQuery } from '@tanstack/react-query';
import { useApi, get } from '../core/api';
import { AppError } from '../core/errors';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  roles: string[];
  tenantId?: string;
}

interface UserProfileResponse {
  data: UserProfile;
  meta: {
    requestId: string;
  };
}

/**
 * Query key for user profile data
 */
const PROFILE_QUERY_KEY = ['profile'] as const;

/**
 * Query configuration for profile data
 */
const PROFILE_QUERY_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 30 * 60 * 1000 // 30 minutes
} as const;

/**
 * Hook result type
 */
export interface UseProfileResult {
  readonly profile: UserProfile | null;
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly refetch: () => Promise<void>;
}

/**
 * Hook for managing user profile data
 * 
 * @example
 * ```typescript
 * const { profile, isLoading, error } = useProfile();
 * 
 * if (isLoading) return <LoadingState />;
 * if (error) return <ErrorDisplay error={error} />;
 * if (!profile) return <NotFoundState />;
 * return <ProfileDisplay profile={profile} />;
 * ```
 */
export function useProfile(): UseProfileResult {
  const api = useApi();

  const {
    data: profileResponse,
    isLoading,
    error: queryError,
    refetch
  } = useQuery<UserProfileResponse, AppError>({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: async () => {
      const response = await get<UserProfileResponse>(api, '/v1/auth/me');
      return response;
    },
    ...PROFILE_QUERY_CONFIG
  });

  return {
    profile: profileResponse?.data ?? null,
    isLoading,
    error: queryError ?? null,
    refetch
  };
}