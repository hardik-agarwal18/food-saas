export interface IUpdateDeliveryStatusUseCase {
  execute(
    assignmentId: string,
    userId: string,
    newStatus: 'DRIVER_ARRIVING' | 'PICKED_UP' | 'DELIVERED',
  ): Promise<void>;
}
