import { DeliveryAssignment } from '../../domain/entities/delivery-assignment.entity.js';

export interface ICreateDeliveryAssignmentUseCase {
  execute(
    orderId: string,
    deliveryFeeAmount: number,
    expiresAt?: Date,
  ): Promise<DeliveryAssignment>;
}
