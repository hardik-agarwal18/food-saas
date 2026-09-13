import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export const useDriverProfile = () => {
  return useQuery({
    queryKey: ['driverProfile'],
    queryFn: () => deliveryApi.getDriverProfile(),
    retry: false, // Don't retry so we can redirect immediately on 404
  });
};
