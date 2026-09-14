import { apiClient } from "@/lib/api/client";
import {
  PaginatedResponse,
  Restaurant,
  MenuCategory,
  MenuItem,
  MenuImport,
} from "@/types/api.types";

export interface GetRestaurantsParams {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
  status?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export const customerRestaurantApi = {
  getRestaurants: async (
    params?: GetRestaurantsParams,
  ): Promise<PaginatedResponse<Restaurant>> => {
    return apiClient.get("/restaurants", { params });
  },

  getRestaurantById: async (id: string): Promise<Restaurant> => {
    return apiClient.get(`/restaurants/${id}`);
  },

  getRestaurantMenu: async (id: string): Promise<MenuCategory[]> => {
    const [categories, items] = await Promise.all([
      apiClient.get(`/restaurants/${id}/menu/categories`),
      apiClient.get(`/restaurants/${id}/menu/items`),
    ]);
    
    return (categories as unknown as MenuCategory[]).map(category => ({
      ...category,
      items: (items as unknown as MenuItem[]).filter(item => item.categoryId === category.id)
    }));
  }
};
