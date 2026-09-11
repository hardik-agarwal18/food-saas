export interface CreateRestaurantDto {
  name: string;
  description?: string;
  phoneNumber: string;
  email: string;
  address: {
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  latitude?: number;
  longitude?: number;
}

export interface UpdateRestaurantDto {
  name?: string;
  description?: string;
  phoneNumber?: string;
  email?: string;
  address?: {
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface ListRestaurantsDto {
  status?: string;
  city?: string;
  limit?: number;
  offset?: number;
}

export interface RestaurantResponseDto {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  phoneNumber: string;
  email: string;
  address: {
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  latitude: number | null;
  longitude: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListRestaurantsResponseDto {
  items: RestaurantResponseDto[];
  total: number;
  limit: number;
  offset: number;
}
