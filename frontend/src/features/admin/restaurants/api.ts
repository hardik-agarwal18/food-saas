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

export const adminRestaurantApi = {
  getRestaurants: async (
    params?: GetRestaurantsParams,
  ): Promise<PaginatedResponse<Restaurant>> => {
    return apiClient.get("/restaurants", { params });
  },

  approveRestaurant: async (id: string): Promise<Restaurant> => {
    return apiClient.patch(`/restaurants/${id}/approve`);
  },

  suspendRestaurant: async (id: string): Promise<Restaurant> => {
    return apiClient.patch(`/restaurants/${id}/suspend`);
  }
};
