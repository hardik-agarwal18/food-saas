import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ownerRestaurantApi } from './api';

export const useCreateRestaurantMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => ownerRestaurantApi.createRestaurant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myRestaurants'] });
    },
  });
};

export const useCreateMenuCategoryMutation = (restaurantId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; description?: string }) => 
      ownerRestaurantApi.createMenuCategory(restaurantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerRestaurantMenu', restaurantId] });
    },
  });
};

export const useCreateMenuItemMutation = (restaurantId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; description?: string; price: number; categoryId: string; imageUrl?: string; }) => 
      ownerRestaurantApi.createMenuItem(restaurantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerRestaurantMenu', restaurantId] });
    },
  });
};

export const useUploadMenuMutation = (restaurantId: string) => {
  return useMutation({
    mutationFn: (file: File) => ownerRestaurantApi.uploadMenu(restaurantId, file),
  });
};

export const useConfirmMenuImportMutation = (restaurantId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ importId, editedData }: { importId: string; editedData?: any }) => 
      ownerRestaurantApi.confirmMenuImport(restaurantId, importId, editedData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerRestaurantMenu', restaurantId] });
    },
  });
};
