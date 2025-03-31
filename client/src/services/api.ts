import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

api.interceptors.request.use(async (config) => {
  // Get the access token from Auth0
  const token = await new Promise((resolve) => {
    const maxAttempts = 10;
    let attempts = 0;
    const checkAuth = () => {
      const auth = localStorage.getItem('auth0.is.authenticated');
      if (auth === 'true') {
        const accessToken = localStorage.getItem('auth0.access_token');
        resolve(accessToken);
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(checkAuth, 100);
      } else {
        resolve(null);
      }
    };
    checkAuth();
  });

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;