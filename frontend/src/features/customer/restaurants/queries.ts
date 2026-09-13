import { useQuery } from '@tanstack/react-query';
import { customerRestaurantApi } from './api';
import { GetRestaurantsParams } from '@/types/api.types'; // Assuming this exists or define it here
// We'll define GetRestaurantsParams in api.ts so let's import from there
import { GetRestaurantsParams as ApiGetRestaurantsParams } from './api';

export const useRestaurants = (params?: ApiGetRestaurantsParams) => {
  return useQuery({
    queryKey: ['restaurants', params],
    queryFn: () => customerRestaurantApi.getRestaurants(params),
  });
};

export const useRestaurant = (id: string) => {
  return useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => customerRestaurantApi.getRestaurantById(id),
    enabled: !!id,
  });
};

export const useRestaurantMenu = (id: string) => {
  return useQuery({
    queryKey: ['restaurantMenu', id],
    queryFn: () => customerRestaurantApi.getRestaurantMenu(id),
    enabled: !!id,
  });
};
