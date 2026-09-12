import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiError, ApiResponse } from '@/types/api.types';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    if (response.data && response.data.success !== undefined) {
      if (response.data.success) {
        return response.data.data;
      }
    }
    return response.data;
  },
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Standard Backend Error Format
    if (error.response && error.response.data && error.response.data.success === false) {
      const errorDetails = error.response.data.error;
      const apiError = new ApiError(
        errorDetails?.message || 'An unexpected error occurred',
        errorDetails?.code || 'UNKNOWN_ERROR',
        error.response.status,
        errorDetails?.details
      );

      // Handle 401 Unauthorized for token refresh
      if (error.response.status === 401 && !originalRequest._retry && originalRequest.url !== '/identity/login' && originalRequest.url !== '/identity/refresh') {
        if (isRefreshing) {
          try {
            const token = await new Promise<string>((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            });
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          } catch (err) {
            return Promise.reject(err);
          }
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Attempt to refresh token
          const refreshResponse = await axios.post(`${baseURL}/identity/refresh`, {}, { withCredentials: true });
          const newAccessToken = refreshResponse.data?.data?.accessToken;
          
          if (newAccessToken) {
            localStorage.setItem('accessToken', newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            processQueue(null, newAccessToken);
            return apiClient(originalRequest);
          } else {
            throw new Error('No access token in refresh response');
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          localStorage.removeItem('accessToken');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(apiError);
    }

    // Network errors or non-standard errors
    return Promise.reject(
      new ApiError(error.message || 'Network Error', 'NETWORK_ERROR', error.response?.status || 500)
    );
  }
);
