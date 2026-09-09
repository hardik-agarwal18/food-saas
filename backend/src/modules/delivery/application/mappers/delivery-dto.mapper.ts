import { DeliveryAssignment } from '../../domain/entities/delivery-assignment.entity.js';
import { DeliveryAssignmentResponseDto } from '../dto/delivery-assignment.dto.js';

export class DeliveryDtoMapper {
  static toResponse(domain: DeliveryAssignment): DeliveryAssignmentResponseDto {
    return {
      id: domain.id,
      orderId: domain.orderId,
      driverId: domain.driverId,
      status: domain.status,
      deliveryFee: domain.deliveryFee.getValue(),
      estimatedDistance: domain.estimatedDistance,
      estimatedDuration: domain.estimatedDuration,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    };
  }

  static toResponseList(domainList: DeliveryAssignment[]): DeliveryAssignmentResponseDto[] {
    return domainList.map(this.toResponse);
  }
}
