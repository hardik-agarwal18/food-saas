import { useMutation, useQueryClient } from '@tanstack/react-query';
import { restaurantApi } from './api';

export const useApproveRestaurantMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => restaurantApi.approveRestaurant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
};

export const useSuspendRestaurantMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => restaurantApi.suspendRestaurant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
};
