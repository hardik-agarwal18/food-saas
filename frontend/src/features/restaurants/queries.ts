import { useQuery } from '@tanstack/react-query';
import { restaurantApi, GetRestaurantsParams } from './api';

export const useRestaurants = (params?: GetRestaurantsParams) => {
  return useQuery({
    queryKey: ['restaurants', params],
    queryFn: () => restaurantApi.getRestaurants(params),
  });
};

export const useMyRestaurants = () => {
  return useQuery({
    queryKey: ['my-restaurants'],
    queryFn: () => restaurantApi.getMyRestaurants(),
  });
};

export const useRestaurant = (id: string) => {
  return useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => restaurantApi.getRestaurantById(id),
    enabled: !!id,
  });
};

export const useRestaurantMenu = (id: string) => {
  return useQuery({
    queryKey: ['restaurant', id, 'menu'],
    queryFn: () => restaurantApi.getRestaurantMenu(id),
    enabled: !!id,
  });
};
