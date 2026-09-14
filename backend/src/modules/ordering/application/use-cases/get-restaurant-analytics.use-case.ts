export interface RestaurantAnalyticsDto {
  totalRevenue: number;
  activeOrdersCount: number;
  completedOrdersCount: number;
}

export interface IGetRestaurantAnalyticsUseCase {
  execute(restaurantId: string): Promise<RestaurantAnalyticsDto>;
}
