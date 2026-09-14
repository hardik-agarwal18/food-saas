import { useQuery } from '@tanstack/react-query';
import { ownerRestaurantApi } from './api';

export const useMyRestaurants = () => {
  return useQuery({
    queryKey: ['myRestaurants'],
    queryFn: () => ownerRestaurantApi.getMyRestaurants(),
  });
};

export const useRestaurantMenu = (id: string) => {
  return useQuery({
    queryKey: ['ownerRestaurantMenu', id],
    queryFn: () => ownerRestaurantApi.getRestaurantMenu(id),
    enabled: !!id,
  });
};

export const useMenuImportQuery = (restaurantId: string, importId: string) => {
  return useQuery({
    queryKey: ['menuImport', restaurantId, importId],
    queryFn: () => ownerRestaurantApi.getMenuImport(restaurantId, importId),
    enabled: !!restaurantId && !!importId,
  });
};
