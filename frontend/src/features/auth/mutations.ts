import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from './api';
import { LoginRequest, RegisterRequest } from './types';
import { useRouter } from 'next/navigation';

export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      queryClient.setQueryData(['currentUser'], data.user);
      
      // Navigate based on roles
      if (data.user.roles.includes('ADMIN')) {
        router.push('/admin/dashboard');
      } else if (data.user.roles.includes('RESTAURANT_OWNER')) {
        router.push('/restaurant/dashboard');
      } else if (data.user.roles.includes('DELIVERY_DRIVER')) {
        router.push('/driver/dashboard');
      } else {
        router.push('/');
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
