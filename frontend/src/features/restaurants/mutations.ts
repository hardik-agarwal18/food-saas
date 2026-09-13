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
    },
  });
};

export const useCreateMenuCategoryMutation = (restaurantId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; description?: string }) => restaurantApi.createMenuCategory(restaurantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-menu', restaurantId] });
    },
  });
};

export const useCreateMenuItemMutation = (restaurantId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; description?: string; price: number; categoryId: string; imageUrl?: string }) => restaurantApi.createMenuItem(restaurantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-menu', restaurantId] });
    },
  });
};
