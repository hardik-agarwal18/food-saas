import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminRestaurantApi } from './api';

export const useApproveRestaurantMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminRestaurantApi.approveRestaurant(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant', data.id] });
    },
  });
};

export const useSuspendRestaurantMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminRestaurantApi.suspendRestaurant(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant', data.id] });
    },
  });
};
