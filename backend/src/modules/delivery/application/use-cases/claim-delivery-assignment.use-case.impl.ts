import { inject, injectable } from 'tsyringe';
import type { IClaimDeliveryAssignmentUseCase } from './claim-delivery-assignment.use-case.js';
import type { IDeliveryAssignmentRepository } from '../../domain/repositories/delivery-assignment.repository.js';
import type { IDriverRepository } from '../../domain/repositories/driver.repository.js';
import { DeliveryDomainError } from '../../domain/errors/delivery-domain.error.js';
import { DriverStatus } from '../../domain/entities/driver.entity.js';
import { DeliveryTokens } from '../../infrastructure/tokens/delivery.tokens.js';

@injectable()
export class ClaimDeliveryAssignmentUseCaseImpl implements IClaimDeliveryAssignmentUseCase {
  constructor(
    @inject(DeliveryTokens.DeliveryAssignmentRepository)
    private readonly assignmentRepository: IDeliveryAssignmentRepository,
    @inject(DeliveryTokens.DriverRepository)
    private readonly driverRepository: IDriverRepository,
  ) {}

  async execute(assignmentId: string, userId: string): Promise<void> {
    // 1. Authenticate driver
    const driver = await this.driverRepository.findByUserId(userId);
    if (!driver) {
      throw new DeliveryDomainError('Driver profile not found for this user.', 'DRIVER_NOT_FOUND');
    }

    if (driver.status !== DriverStatus.AVAILABLE) {
      throw new DeliveryDomainError(
        'Driver is not available to claim assignments.',
        'DRIVER_UNAVAILABLE',
      );
    }

    // 2. Load assignment
    const assignment = await this.assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new DeliveryDomainError('Assignment not found.', 'ASSIGNMENT_NOT_FOUND');
    }

    // 3. Domain validation (local check)
    // We attempt to accept to ensure the state transition is valid before hitting the DB
    assignment.accept(driver.id);

    // 4. Concurrency DB Check via repository — atomically marks driver as BUSY too
    const success = await this.assignmentRepository.claimAssignment(assignmentId, driver.id);

    if (!success) {
      throw DeliveryDomainError.alreadyClaimed();
    }
  }
}
