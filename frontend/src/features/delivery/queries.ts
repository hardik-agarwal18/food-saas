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
