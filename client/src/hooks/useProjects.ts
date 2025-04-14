import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { api } from '../services/api';

export interface Project {
  id: string;
  name: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  createdAt: string;
  updatedAt: string;
}

export function useProjects() {
  const { getToken } = useAuth();

  const {
    data: projects,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No token available');

      const response = await api.get<Project[]>('/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
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