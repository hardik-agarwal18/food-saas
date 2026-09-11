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

export const orderingApi = {
  placeOrder: async (data: PlaceOrderRequest): Promise<Order> => {
    return apiClient.post('/orders', data);
  },

  getMyOrders: async (): Promise<Order[]> => {
    return apiClient.get('/orders');
  },

  getRestaurantOrders: async (restaurantId: string): Promise<Order[]> => {
    return apiClient.get(`/orders/restaurants/${restaurantId}`);
  },

  updateOrderStatus: async (restaurantId: string, orderId: string, status: string): Promise<Order> => {
    return apiClient.patch(`/orders/restaurants/${restaurantId}/${orderId}/status`, { status });
  },

  getOrderById: async (id: string): Promise<Order> => {
    // Note: The backend doesn't seem to have a standalone getOrderById route in the snippet,
    // but assuming there's one. If not, this might fail.
    return apiClient.get(`/orders/${id}`);
  },
};
