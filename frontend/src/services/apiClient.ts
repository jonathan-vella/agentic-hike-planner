import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
apiClient.interceptors.request.use((config) => {
  let token = localStorage.getItem('auth-token');
  
  // In development, provide a default mock token if none exists
  if (!token && import.meta.env.DEV) {
    token = 'mock-valid-token';
    localStorage.setItem('auth-token', token);
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshResponse = await axios.post('/api/auth/refresh', {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth-token')}`,
          },
        });

        if (refreshResponse.data.token) {
          localStorage.setItem('auth-token', refreshResponse.data.token);
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }

      // If refresh fails, clear token and redirect to login
      localStorage.removeItem('auth-token');
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

export { apiClient };