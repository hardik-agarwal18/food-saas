import { inject, injectable } from 'tsyringe';
import { IGetDriverAssignmentsUseCase } from './get-driver-assignments.use-case.js';
import { DeliveryAssignmentResponseDto } from '../dto/delivery-assignment.dto.js';
import { DeliveryDtoMapper } from '../mappers/delivery-dto.mapper.js';
import type { IDeliveryAssignmentRepository } from '../../domain/repositories/delivery-assignment.repository.js';
import type { IDriverRepository } from '../../domain/repositories/driver.repository.js';
import { DeliveryTokens } from '../../infrastructure/tokens/delivery.tokens.js';
import { DeliveryDomainError } from '../../domain/errors/delivery-domain.error.js';

@injectable()
export class GetDriverAssignmentsUseCaseImpl implements IGetDriverAssignmentsUseCase {
  constructor(
    @inject(DeliveryTokens.DeliveryAssignmentRepository)
    private readonly assignmentRepository: IDeliveryAssignmentRepository,
    @inject(DeliveryTokens.DriverRepository)
    private readonly driverRepository: IDriverRepository,
  ) {}

  async execute(userId: string): Promise<DeliveryAssignmentResponseDto[]> {
    const driver = await this.driverRepository.findByUserId(userId);
    if (!driver) {
      throw new DeliveryDomainError('Driver profile not found.', 'DRIVER_NOT_FOUND');
    }

    const assignments = await this.assignmentRepository.findByDriverId(driver.id);
    return DeliveryDtoMapper.toResponseList(assignments);
  }
}
