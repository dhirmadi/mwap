import { useQuery } from '@tanstack/react-query';
import { useApi } from '../services/api';

export interface Project {
  id: string;
  name: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  createdAt: string;
  updatedAt: string;
}

export function useProjects() {
  const api = useApi();

  const {
    data: projects,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await api.get<Project[]>('/projects');
      console.log('[useProjects] Projects data:', response.data);
      return response.data;
    }
  });

  return {
    projects,
    isLoading,
    error,
    refetch
  };
}