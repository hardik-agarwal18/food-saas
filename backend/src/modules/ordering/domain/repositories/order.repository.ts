import { Order } from '../entities/order.entity.js';

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IOrderRepository {
  save(order: Order): Promise<void>;
  update(order: Order): Promise<void>;

  findById(id: string): Promise<Order | null>;

  findByCustomerId(
    customerId: string,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<Order>>;

  findByRestaurantId(
    restaurantId: string,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<Order>>;
}
