import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderingApi, PlaceOrderRequest } from './api';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../cart/store';

export const usePlaceOrderMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const clearCart = useCartStore((state) => state.clearCart);

  return useMutation({
    mutationFn: (data: PlaceOrderRequest) => orderingApi.placeOrder(data),
    onSuccess: (order) => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      router.push(`/orders/${order.id}`);
    },
  });
};

export const useUpdateOrderStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ restaurantId, orderId, status }: { restaurantId: string; orderId: string; status: string }) => 
      orderingApi.updateOrderStatus(restaurantId, orderId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-orders', variables.restaurantId] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
    },
  });
};
