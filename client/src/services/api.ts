import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

const getApiUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  if (!url) {
    console.warn('API URL not found in environment, using default');
    return '/api';  // fallback to relative path
  }
  console.log('API URL configured as:', url);
  return url;
};

export const useApi = () => {
  const { getAccessTokenSilently } = useAuth0();
  
  const api = axios.create({
    baseURL: getApiUrl(),
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Add auth token to requests
  api.interceptors.request.use(async (config) => {
    try {
      const token = await getAccessTokenSilently();
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    } catch (error) {
      console.error('Error getting access token:', error);
      return Promise.reject(error);
    }
  });

  // Add response interceptor for better error handling
  api.interceptors.response.use(
    response => response,
    error => {
      if (error.response) {
        // Server responded with error
        console.error('API Error:', {
          status: error.response.status,
          data: error.response.data,
          url: error.config.url,
        });
      } else if (error.request) {
        // Request made but no response
        console.error('Network Error:', {
          url: error.config.url,
          message: 'No response received',
        });
      } else {
        // Request setup failed
        console.error('Request Error:', {
          message: error.message,
        });
      }
      return Promise.reject(error);
    }
  );

  return api;
};