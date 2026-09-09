export interface ICreateDeliveryAssignmentUseCase {
  execute(orderId: string, deliveryFeeAmount: number): Promise<void>;
}
