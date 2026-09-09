import { inject, injectable } from 'tsyringe';
import type { IUpdateDeliveryStatusUseCase } from './update-delivery-status.use-case.js';
import type { IDeliveryAssignmentRepository } from '../../domain/repositories/delivery-assignment.repository.js';
import type { IDriverRepository } from '../../domain/repositories/driver.repository.js';
import { DeliveryDomainError } from '../../domain/errors/delivery-domain.error.js';
import { EventDispatcher } from '../../../../shared/events/event-dispatcher.js';
import { DeliveryPickedUpEvent } from '../../domain/events/delivery-picked-up.event.js';
import { DeliveryDeliveredEvent } from '../../domain/events/delivery-delivered.event.js';
import { DeliveryTokens } from '../../infrastructure/tokens/delivery.tokens.js';

@injectable()
export class UpdateDeliveryStatusUseCaseImpl implements IUpdateDeliveryStatusUseCase {
  constructor(
    @inject(DeliveryTokens.DeliveryAssignmentRepository)
    private readonly assignmentRepository: IDeliveryAssignmentRepository,
    @inject(DeliveryTokens.DriverRepository)
    private readonly driverRepository: IDriverRepository,
  ) {}

  async execute(
    assignmentId: string,
    userId: string,
    newStatus: 'PICKED_UP' | 'DELIVERED',
  ): Promise<void> {
    const driver = await this.driverRepository.findByUserId(userId);
    if (!driver) {
      throw new DeliveryDomainError('Driver profile not found.', 'DRIVER_NOT_FOUND');
    }

    const assignment = await this.assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new DeliveryDomainError('Assignment not found.', 'ASSIGNMENT_NOT_FOUND');
    }

    if (newStatus === 'PICKED_UP') {
      assignment.pickUp(driver.id);
      await this.assignmentRepository.save(assignment);
      await EventDispatcher.getInstance().dispatch(
        new DeliveryPickedUpEvent(assignment.id, assignment.orderId, driver.id),
      );
    } else if (newStatus === 'DELIVERED') {
      assignment.deliver(driver.id);
      await this.assignmentRepository.save(assignment);

      // Driver becomes available again
      driver.markAvailable();
      await this.driverRepository.save(driver);

      await EventDispatcher.getInstance().dispatch(
        new DeliveryDeliveredEvent(assignment.id, assignment.orderId, driver.id),
      );
    } else {
      throw new DeliveryDomainError('Invalid target status for update.', 'INVALID_STATUS');
    }
  }
}
