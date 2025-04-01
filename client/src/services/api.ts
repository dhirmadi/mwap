import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  // Add timeout
  timeout: 10000,
  // Add headers
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Create an API instance with authentication
export const createAuthenticatedApi = () => {
  const { getAccessTokenSilently } = useAuth0();

  // Add auth token to requests
  api.interceptors.request.use(async (config) => {
    try {
      const token = await getAccessTokenSilently();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Error getting access token:', error);
      return Promise.reject(error);
    }
  });

  // Add response interceptor for better error handling
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      return Promise.reject(error);
    }
  );

  return api;
};

export default api;