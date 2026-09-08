import { Restaurant, RestaurantStatus } from '../entities/restaurant.entity.js';

export interface IRestaurantRepository {
  save(restaurant: Restaurant): Promise<void>;
  update(restaurant: Restaurant): Promise<void>;
  findById(id: string): Promise<Restaurant | null>;
  findByOwnerId(ownerId: string): Promise<Restaurant[]>;
  findAll(params: {
    status?: RestaurantStatus;
    city?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: Restaurant[]; total: number }>;
}
