import { useQuery } from '@tanstack/react-query';
import { authApi } from './api';

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authApi.getCurrentUser(),
    retry: false, // Don't retry on 401
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};
