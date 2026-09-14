import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerOrdersApi, PlaceOrderRequest } from './api';
import { useCartStore } from '../cart/store';
import { Order } from '@/types/api.types';

export const usePlaceOrderMutation = () => {
  const queryClient = useQueryClient();
  const clearCart = useCartStore((state: any) => state.clearCart);

  return useMutation({
    mutationFn: (data: PlaceOrderRequest) => customerOrdersApi.placeOrder(data),
    onSuccess: (order: Order) => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
    },
  });
};

export const useInitializePaymentMutation = () => {
  return useMutation({
    mutationFn: (data: PlaceOrderRequest) => customerOrdersApi.initializePayment(data),
  });
};
