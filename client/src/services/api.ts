import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// Create a function to get the token from Auth0
export const getAuthToken = async () => {
  try {
    const token = localStorage.getItem('auth0.access_token');
    if (!token) {
      throw new Error('No token found');
    }
    return token;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  } catch (error) {
    console.error('Error in request interceptor:', error);
    return config;
  }
});

export default api;