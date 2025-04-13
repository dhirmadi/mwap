import useSWR from 'swr';
import { useCallback } from 'react';

// Types
export enum ProjectRole {
  ADMIN = 'admin',
  DEPUTY = 'deputy',
  CONTRIBUTOR = 'contributor'
}

interface ProjectMember {
  userId: string;
  role: ProjectRole;
}

interface Project {
  id: string;
  name: string;
  tenantId: string;
  createdAt: string;
  members: ProjectMember[];
}

interface PaginationOptions {
  page?: number;
  limit?: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ProjectsResponse {
  projects: Project[];
  pagination: PaginationInfo;
}

interface ProjectError {
  message: string;
  status?: number;
}

interface UseProjectsReturn {
  projects: Project[];
  pagination: PaginationInfo | null;
  loading: boolean;
  error: ProjectError | null;
  mutate: () => Promise<void>;
}

// Fetch function for SWR
const fetchProjects = async (url: string): Promise<ProjectsResponse> => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      // Auth header will be added by interceptor
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch projects');
  }

  return response.json();
};

/**
 * Hook to fetch and cache the user's projects with pagination
 * @param {PaginationOptions} options Pagination options (page, limit)
 * @returns {UseProjectsReturn} Projects data, pagination info, loading state, error state, and mutate function
 * 
 * @example
 * ```tsx
 * const { projects, pagination, loading, error } = useProjects({ page: 1, limit: 10 });
 * 
 * if (loading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * if (!projects.length) return <div>No projects found</div>;
 * 
 * return (
 *   <div>
 *     {projects.map(project => (
 *       <div key={project.id}>{project.name}</div>
 *     ))}
 *     <div>
 *       Page {pagination.page} of {pagination.totalPages}
 *     </div>
 *   </div>
 * );
 * ```
 */
export function useProjects(options: PaginationOptions = {}): UseProjectsReturn {
  const {
    page = 1,
    limit = 20
  } = options;

  // Build URL with query parameters
  const url = `/api/projects?page=${page}&limit=${limit}`;

  // Use SWR for data fetching and caching
  const {
    data,
    error,
    isLoading,
    mutate
  } = useSWR<ProjectsResponse, ProjectError>(url, fetchProjects, {
    revalidateOnFocus: false, // Don't revalidate on window focus
    revalidateOnReconnect: true, // Revalidate when reconnecting
    dedupingInterval: 5000, // Dedupe requests within 5 seconds
  });

  // Memoized mutate function
  const refreshProjects = useCallback(async () => {
    await mutate();
  }, [mutate]);

  return {
    projects: data?.projects || [],
    pagination: data?.pagination || null,
    loading: isLoading,
    error: error || null,
    mutate: refreshProjects
  };
}