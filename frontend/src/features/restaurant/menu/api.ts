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

export const ownerRestaurantApi = {
  getMyRestaurants: async (): Promise<Restaurant[]> => {
    return apiClient.get("/restaurants/my");
  },

  createRestaurant: async (data: any): Promise<Restaurant> => {
    return apiClient.post("/restaurants", data);
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
  },

  createMenuCategory: async (
    id: string,
    data: { name: string; description?: string },
  ): Promise<MenuCategory> => {
    return apiClient.post(`/restaurants/${id}/menu/categories`, data);
  },

  createMenuItem: async (
    id: string,
    data: {
      name: string;
      description?: string;
      price: number;
      categoryId: string;
      imageUrl?: string;
    },
  ): Promise<MenuItem> => {
    return apiClient.post(`/restaurants/${id}/menu/items`, data);
  },

  uploadMenu: async (restaurantId: string, file: File): Promise<MenuImport> => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(
      `/restaurants/${restaurantId}/menu/menu-imports`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
  },

  getMenuImport: async (
    restaurantId: string,
    importId: string,
  ): Promise<MenuImport> => {
    return apiClient.get(
      `/restaurants/${restaurantId}/menu/menu-imports/${importId}`,
    );
  },

  confirmMenuImport: async (
    restaurantId: string,
    importId: string,
    editedData?: any,
  ): Promise<void> => {
    return apiClient.post(
      `/restaurants/${restaurantId}/menu/menu-imports/${importId}/confirm`,
      { editedData },
    );
  },
};
