import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from './api';
import { LoginRequest, RegisterRequest } from './types';
import { useRouter } from 'next/navigation';

export const useLoginMutation = (options?: { 
  expectedRole?: 'CUSTOMER' | 'RESTAURANT_OWNER' | 'DRIVER' | 'ADMIN', 
  redirectUrl?: string 
}) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await authApi.login(data);
      if (options?.expectedRole && !(response.user.roles as unknown as string[]).includes(options.expectedRole)) {
        throw new Error(`This account does not have access to the ${options.expectedRole.replace('_', ' ').toLowerCase()} application.`);
      }
      return response;
    },
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      queryClient.setQueryData(['currentUser'], data.user);
      
      // Navigate based on specified redirect or roles
      const roles = data.user.roles as unknown as string[];
      if (options?.redirectUrl) {
        router.push(options.redirectUrl);
      } else if (roles.includes('ADMIN')) {
        router.push('/admin/dashboard');
      } else if (roles.includes('RESTAURANT_OWNER')) {
        router.push('/restaurant/dashboard');
      } else if (roles.includes('DRIVER')) {
        router.push('/driver/dashboard');
      } else {
        router.push('/customer/restaurants');
      }
    },
  });
};

export const useRegisterMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      queryClient.setQueryData(['currentUser'], data.user);
      router.push('/');
    },
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      localStorage.removeItem('accessToken');
      queryClient.clear();
      router.push('/login');
    },
  });
};
