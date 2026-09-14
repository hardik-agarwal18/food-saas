import { apiClient } from '@/lib/api/client';
import { AuthResponse, LoginRequest, RegisterRequest, ForgotPasswordRequest, ResetPasswordRequest, ChangePasswordRequest } from './types';
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

  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await apiClient.post('/identity/forgot-password', data);
  },

  resetPassword: async (token: string, data: ResetPasswordRequest): Promise<void> => {
    await apiClient.put(`/identity/reset-password/${token}`, data);
  },

  verifyEmail: async (token: string): Promise<void> => {
    await apiClient.get(`/identity/verify-email/${token}`);
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.patch('/identity/change-password', data);
  },
};
