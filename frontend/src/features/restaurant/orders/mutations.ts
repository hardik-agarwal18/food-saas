import { useMutation, useQueryClient } from '@tanstack/react-query';
import { restaurantOrdersApi } from './api';

export const useUpdateOrderStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ restaurantId, orderId, status }: { restaurantId: string; orderId: string; status: string }) => 
      restaurantOrdersApi.updateOrderStatus(restaurantId, orderId, status),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['restaurantOrders', order.restaurantId] });
      queryClient.invalidateQueries({ queryKey: ['order', order.id] });
    },
  });
};
