import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi, get, post } from '../core/api';
import { AppError } from '../core/errors';
import { API_PATHS } from '../core/api/paths';
import { Project, ProjectListResponse, ProjectResponse } from '../types';

/**
 * Query key for projects data
 */
const PROJECTS_QUERY_KEY = ['projects'] as const;

/**
 * Query configuration for projects data
 */
const PROJECTS_QUERY_CONFIG = {
  staleTime: 1 * 60 * 1000,  // 1 minute
  cacheTime: 15 * 60 * 1000  // 15 minutes
} as const;

/**
 * Hook result type
 */
export interface UseProjectsResult {
  readonly projects: Project[];
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly refetch: () => Promise<void>;
}

/**
 * Hook for managing projects data
 * Returns empty array if user has no projects (not an error)
 * 
 * @example
 * ```typescript
 * const { projects, isLoading, error } = useProjects();
 * 
 * if (isLoading) return <LoadingState />;
 * if (error) return <ErrorDisplay error={error} />;
 * if (projects.length === 0) return <EmptyState />;
 * return <ProjectList projects={projects} />;
 * ```
 */
export function useProjects(): UseProjectsResult {
  const api = useApi();
  const queryClient = useQueryClient();

  const {
    data: projectsResponse,
    isLoading,
    error: queryError,
    refetch
  } = useQuery<ProjectListResponse, AppError>({
    queryKey: PROJECTS_QUERY_KEY,
    queryFn: async () => {
      // No error handling needed for empty list
      const response = await get<ProjectListResponse>(api, API_PATHS.PROJECT.LIST);
      return response;
    },
    ...PROJECTS_QUERY_CONFIG
  });

  return {
    // Return empty array if no data
    projects: projectsResponse?.data ?? [],
    isLoading,
    error: queryError ?? null,
    refetch
  };
}