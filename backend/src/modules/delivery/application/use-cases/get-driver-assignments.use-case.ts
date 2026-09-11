import { DeliveryAssignmentResponseDto } from '../dto/delivery-assignment.dto.js';

export interface IGetDriverAssignmentsUseCase {
  execute(userId: string): Promise<DeliveryAssignmentResponseDto[]>;
}
