import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

export const createAuthenticatedApi = () => {
  const { getAccessTokenSilently } = useAuth0();
  
  // Determine API URL
  const getApiUrl = () => {
    const configuredUrl = import.meta.env.VITE_API_URL;
    const hostname = window.location.hostname;
    
    console.log('API URL Configuration:', {
      VITE_API_URL: configuredUrl,
      hostname,
      isDevelopment: hostname === 'localhost'
    });

    if (configuredUrl) {
      return configuredUrl;
    }
    
    // Fallback for local development
    if (hostname === 'localhost') {
      return 'http://localhost:54014/api';
    }
    
    // Fallback for Heroku
    const herokuUrl = `https://${hostname}/api`;
    console.log('Using Heroku URL:', herokuUrl);
    return herokuUrl;
  };

  const api = axios.create({
    baseURL: getApiUrl(),
    // Add timeout
    timeout: 10000,
    // Add headers
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

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
      if (axios.isAxiosError(error)) {
        console.error('API Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }
      return Promise.reject(error);
    }
  );

  return api;
};