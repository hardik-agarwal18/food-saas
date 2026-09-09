export interface IUpdateDeliveryStatusUseCase {
  execute(
    assignmentId: string,
    userId: string,
    newStatus: 'PICKED_UP' | 'DELIVERED',
  ): Promise<void>;
}
