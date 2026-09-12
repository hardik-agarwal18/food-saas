import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveryApi } from './api';

export const useClaimDeliveryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignmentId: string) => deliveryApi.claimDelivery(assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['my-active-deliveries'] });
    },
  });
};

export const useUpdateDeliveryStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assignmentId, status }: { assignmentId: string; status: string }) => 
      deliveryApi.updateDeliveryStatus(assignmentId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-active-deliveries'] });
    },
  });
};

export const useToggleAvailabilityMutation = () => {
  return useMutation({
    mutationFn: (isAvailable: boolean) => deliveryApi.toggleAvailability(isAvailable),
  });
};
