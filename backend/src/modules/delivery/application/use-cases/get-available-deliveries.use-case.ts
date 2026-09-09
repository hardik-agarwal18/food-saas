import { DeliveryAssignmentResponseDto } from '../dto/delivery-assignment.dto.js';

export interface IGetAvailableDeliveriesUseCase {
  execute(userId: string): Promise<DeliveryAssignmentResponseDto[]>;
}
