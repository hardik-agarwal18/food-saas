import { User, Role } from '@/types/api.types';

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface RegisterRequest {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone: string;
  role?: Role;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  password?: string;
}

export interface ChangePasswordRequest {
  oldPassword?: string;
  newPassword?: string;
}
