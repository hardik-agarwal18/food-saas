import { useQuery } from '@tanstack/react-query';
import { customerOrdersApi } from './api';

export const useMyOrders = () => {
  return useQuery({
    queryKey: ['myOrders'],
    queryFn: () => customerOrdersApi.getMyOrders(),
  });
};

export const useOrderDriverLocation = (orderId?: string, isOutForDelivery?: boolean) => {
  return useQuery({
    queryKey: ['order-driver-location', orderId],
    queryFn: () => customerOrdersApi.getDeliveryLocationByOrder(orderId!),
    enabled: !!orderId && isOutForDelivery,
    refetchInterval: 5000,
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => customerOrdersApi.getOrderById(id),
    enabled: !!id,
  });
};
