import { apiClient } from '@/lib/api/client';
import { Order, OrderType } from '@/types/api.types';

export interface PlaceOrderRequest {
  restaurantId: string;
  orderType: OrderType;
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  specialInstructions?: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
    modifierItemIds?: string[];
    specialInstructions?: string;
  }>;
}

export const customerOrdersApi = {
  placeOrder: async (data: PlaceOrderRequest): Promise<Order> => {
    return apiClient.post('/orders', data);
  },

  getDeliveryLocationByOrder: async (orderId: string): Promise<{ latitude: number, longitude: number }> => {
    return apiClient.get(`/deliveries/order/${orderId}/location`);
  },

  getMyOrders: async (): Promise<{ items: Order[]; total: number; page: number; limit: number; totalPages: number }> => {
    return apiClient.get('/orders');
  },

  getOrderById: async (id: string): Promise<Order> => {
    return apiClient.get(`/orders/${id}`);
  },
};
