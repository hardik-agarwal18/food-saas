import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiError, ApiResponse } from '@/types/api.types';

// The base URL can be an environment variable. Using the same port as the backend for local dev.
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  // To handle cookies if needed, though this backend uses Bearer tokens
  withCredentials: true,
});

// Request interceptor: attach token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // We can fetch token from local storage or cookies depending on the auth strategy
    // For now, let's assume it's stored in localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: normalize response and throw ApiError
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    // The backend wraps success responses in { success: true, message: string, data: T }
    // We just return the data portion to the caller for easier consumption
    if (response.data && response.data.success) {
      return response.data.data;
    }
    return response.data; // Fallback
  },
  async (error: AxiosError<any>) => {
    // If we have a standardized error from the backend
    if (error.response && error.response.data && error.response.data.success === false) {
      const errorDetails = error.response.data.error;
      const apiError = new ApiError(
        errorDetails?.message || 'An unexpected error occurred',
        errorDetails?.code || 'UNKNOWN_ERROR',
        error.response.status,
        errorDetails?.details
      );

      // Handle 401 Unauthorized for token refresh
      if (error.response.status === 401) {
        // Implement refresh logic here
        // If refresh fails, clear token and redirect to login
        // For now, if we hit 401, we just throw the error to be handled by the UI/query layer
      }

      return Promise.reject(apiError);
    }

    // Network errors or unexpected formats
    return Promise.reject(
      new ApiError(error.message || 'Network Error', 'NETWORK_ERROR', error.response?.status || 500)
    );
  }
);
