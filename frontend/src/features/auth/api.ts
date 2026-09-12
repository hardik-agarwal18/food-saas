import { apiClient } from '@/lib/api/client';
import { AuthResponse, LoginRequest, RegisterRequest } from './types';
import { User } from '@/types/api.types';

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<any, AuthResponse>('/identity/login', data);
    return response;
  },
  
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<any, AuthResponse>('/identity/register', data);
    return response;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<any, User>('/identity/me');
    return response;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/identity/logout');
  },
};
