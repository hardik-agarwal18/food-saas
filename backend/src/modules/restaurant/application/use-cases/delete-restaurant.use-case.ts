export interface IDeleteRestaurantUseCase {
  execute(restaurantId: string, requesterId: string): Promise<void>;
}
