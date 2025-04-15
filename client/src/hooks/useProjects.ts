import { useQuery } from '@tanstack/react-query';
import { useApi } from '../services/api';
import axios from 'axios';

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
    data: projects = [], // Default to empty array
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        const response = await api.get<Project[]>('/projects');
        console.log('[useProjects] Projects data:', response.data);
        return response.data || []; // Ensure we always return an array
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          // Handle 404 as empty list
          console.log('[useProjects] No projects found');
          return [];
        }
        throw error;
      }
    }
  });

  return {
    projects,
    isLoading,
    error,
    refetch
  };
}