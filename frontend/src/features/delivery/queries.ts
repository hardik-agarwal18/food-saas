import { useQuery } from '@tanstack/react-query';
import { deliveryApi } from './api';

export const useAvailableDeliveries = () => {
  return useQuery({
    queryKey: ['available-deliveries'],
    queryFn: () => deliveryApi.getAvailableDeliveries(),
    refetchInterval: 15000,
  });
};

export const useMyActiveDeliveries = () => {
  return useQuery({
    queryKey: ['my-active-deliveries'],
    queryFn: () => deliveryApi.getMyActiveDeliveries(),
    refetchInterval: 15000,
  });
};

export const useDeliveryLocation = (assignmentId?: string) => {
  return useQuery({
    queryKey: ['delivery-location', assignmentId],
    queryFn: () => deliveryApi.getDeliveryLocation(assignmentId!),
    enabled: !!assignmentId,
    refetchInterval: 5000,
  });
};

export const useOrderDriverLocation = (orderId?: string, isOutForDelivery?: boolean) => {
  return useQuery({
    queryKey: ['order-driver-location', orderId],
    queryFn: () => deliveryApi.getDeliveryLocationByOrder(orderId!),
    enabled: !!orderId && isOutForDelivery,
    refetchInterval: 5000,
  });
};
