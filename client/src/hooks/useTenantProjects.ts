import { useQuery } from '@tanstack/react-query';
import { useApi, get } from '../core/api';
import { AppError } from '../core/errors';
import { API_PATHS } from '../core/api/paths';
import { Project, ProjectListResponse } from '../types';

/**
 * Query configuration for tenant projects data
 */
const TENANT_PROJECTS_QUERY_CONFIG = {
  staleTime: 1 * 60 * 1000,  // 1 minute
  cacheTime: 15 * 60 * 1000  // 15 minutes
} as const;

/**
 * Hook result type
 */
export interface UseTenantProjectsResult {
  readonly projects: Project[];
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly refetch: () => Promise<void>;
}

/**
 * Hook for managing tenant projects data
 * Returns empty array if tenant has no projects (not an error)
 * Projects are already filtered by tenant on the backend
 * 
 * @example
 * ```typescript
 * const { projects, isLoading, error } = useTenantProjects();
 * 
 * if (isLoading) return <LoadingState />;
 * if (error) return <ErrorDisplay error={error} />;
 * if (projects.length === 0) return <EmptyState />;
 * return <ProjectList projects={projects} />;
 * ```
 */
export function useTenantProjects(tenantId: string): UseTenantProjectsResult {
  const api = useApi();
  const queryKey = ['tenant', tenantId, 'projects'] as const;

  const {
    data: projectsResponse,
    isLoading,
    error: queryError,
    refetch
  } = useQuery<ProjectListResponse, AppError>({
    queryKey,
    queryFn: async () => {
      // No error handling needed for empty list
      const response = await get<ProjectListResponse>(api, API_PATHS.PROJECT.LIST);
      return response;
    },
    enabled: !!tenantId,
    ...TENANT_PROJECTS_QUERY_CONFIG
  });

  return {
    // Return empty array if no data
    projects: projectsResponse?.data ?? [],
    isLoading,
    error: queryError ?? null,
    refetch
  };
}