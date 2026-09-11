import { useQuery } from '@tanstack/react-query';
import { orderingApi } from './api';

export const useMyOrders = () => {
  return useQuery({
    queryKey: ['my-orders'],
    queryFn: () => orderingApi.getMyOrders(),
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderingApi.getOrderById(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'COMPLETED' || status === 'CANCELLED') return false;
      return 10000;
    }
  });
};

export const useRestaurantOrders = (restaurantId: string | null) => {
  return useQuery({
    queryKey: ['restaurant-orders', restaurantId],
    queryFn: () => orderingApi.getRestaurantOrders(restaurantId!),
    enabled: !!restaurantId,
    refetchInterval: 15000,
  });
};
