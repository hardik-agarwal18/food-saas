import { useQuery } from '@tanstack/react-query';
import { restaurantOrdersApi } from './api';

export const useRestaurantOrders = (restaurantId: string) => {
  return useQuery({
    queryKey: ['restaurantOrders', restaurantId],
    queryFn: () => restaurantOrdersApi.getRestaurantOrders(restaurantId),
    enabled: !!restaurantId,
  });
};
