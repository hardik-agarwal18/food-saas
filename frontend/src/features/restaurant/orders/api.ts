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

export const restaurantOrdersApi = {
  getRestaurantOrders: async (restaurantId: string): Promise<Order[]> => {
    return apiClient.get(`/orders/restaurants/${restaurantId}`);
  },

  updateOrderStatus: async (restaurantId: string, orderId: string, status: string): Promise<Order> => {
    return apiClient.patch(`/orders/restaurants/${restaurantId}/${orderId}/status`, { status });
  },

  getRestaurantAnalytics: async (restaurantId: string): Promise<{ totalRevenue: number, activeOrdersCount: number, completedOrdersCount: number }> => {
    return apiClient.get(`/orders/restaurants/${restaurantId}/analytics`);
  }
};
