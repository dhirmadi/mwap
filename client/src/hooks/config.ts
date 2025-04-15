/**
 * Query configuration for different features
 */
export const QUERY_CONFIG = {
  tenant: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000 // 30 minutes
  },
  projects: {
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 15 * 60 * 1000 // 15 minutes
  },
  invites: {
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 5 * 60 * 1000 // 5 minutes
  }
} as const;

/**
 * Hook utility types
 */
export interface LoadingState {
  readonly isLoading: boolean;
  readonly isPending?: boolean;
}

export interface ErrorState<T extends Error = Error> {
  readonly error: T | null;
}

/**
 * Hook utility functions
 */
export function useLoadingState(
  isLoading: boolean,
  isPending?: boolean
): boolean {
  return isLoading || !!isPending;
}

export function useErrorState<T extends Error>(
  queryError?: T,
  mutationError?: T
): T | null {
  return queryError ?? mutationError ?? null;
}