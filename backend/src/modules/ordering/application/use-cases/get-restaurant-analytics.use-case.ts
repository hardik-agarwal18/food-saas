export interface RestaurantAnalyticsDto {
  totalRevenue: number;
  activeOrdersCount: number;
  completedOrdersCount: number;
}

export interface IGetRestaurantAnalyticsUseCase {
  execute(userId: string, restaurantId: string): Promise<RestaurantAnalyticsDto>;
}
