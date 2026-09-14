import { useQuery } from '@tanstack/react-query';
import { adminRestaurantApi } from './api';
import { GetRestaurantsParams } from '@/types/api.types';

export const useRestaurants = (params?: GetRestaurantsParams) => {
  return useQuery({
    queryKey: ['restaurants', params],
    queryFn: () => adminRestaurantApi.getRestaurants(params),
  });
};
