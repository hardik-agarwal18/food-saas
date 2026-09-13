import { apiClient } from '@/lib/api/client';
import { PaginatedResponse, Restaurant, MenuCategory, MenuItem } from '@/types/api.types';

export interface GetRestaurantsParams {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
  status?: string;
}

export const restaurantApi = {
  getRestaurants: async (params?: GetRestaurantsParams): Promise<PaginatedResponse<Restaurant>> => {
    return apiClient.get('/restaurants', { params });
  },

  getMyRestaurants: async (): Promise<Restaurant[]> => {
    return apiClient.get('/restaurants/my');
  },

  getRestaurantById: async (id: string): Promise<Restaurant> => {
    return apiClient.get(`/restaurants/${id}`);
  },

  getRestaurantMenu: async (id: string): Promise<MenuCategory[]> => {
    return apiClient.get(`/restaurants/${id}/menu`);
  },

  createMenuCategory: async (id: string, data: { name: string; description?: string }): Promise<MenuCategory> => {
    return apiClient.post(`/restaurants/${id}/menu/categories`, data);
  },

  createMenuItem: async (id: string, data: { name: string; description?: string; price: number; categoryId: string; imageUrl?: string }): Promise<MenuItem> => {
    return apiClient.post(`/restaurants/${id}/menu/items`, data);
  },

  approveRestaurant: async (id: string): Promise<Restaurant> => {
    return apiClient.patch(`/restaurants/${id}/approve`);
  },

  suspendRestaurant: async (id: string): Promise<Restaurant> => {
    return apiClient.patch(`/restaurants/${id}/suspend`);
  },
};
