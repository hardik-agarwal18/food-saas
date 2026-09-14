import { useQuery } from '@tanstack/react-query';
import { restaurantOrdersApi } from './api';

export const useRestaurantOrders = (restaurantId: string) => {
  return useQuery({
    queryKey: ['restaurantOrders', restaurantId],
    queryFn: () => restaurantOrdersApi.getRestaurantOrders(restaurantId),
    enabled: !!restaurantId,
    refetchInterval: 10000, // Poll every 10 seconds for real-time dashboard updates
  });
};

export const useRestaurantAnalytics = (restaurantId: string) => {
  return useQuery({
    queryKey: ['restaurantAnalytics', restaurantId],
    queryFn: () => restaurantOrdersApi.getRestaurantAnalytics(restaurantId),
    enabled: !!restaurantId,
    refetchInterval: 10000,
  });
};
