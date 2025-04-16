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
      // No error handling needed for empty list
      const response = await get<ProjectListResponse>(api, '/projects');
      return response;
    }
  });

  return {
    projects,
    isLoading,
    error,
    refetch
  };
}