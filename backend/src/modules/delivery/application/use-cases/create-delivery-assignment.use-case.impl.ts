import { inject, injectable } from 'tsyringe';
import { ICreateDeliveryAssignmentUseCase } from './create-delivery-assignment.use-case.js';
import type { IDeliveryAssignmentRepository } from '../../domain/repositories/delivery-assignment.repository.js';
import {
  DeliveryAssignment,
  DeliveryAssignmentStatus,
} from '../../domain/entities/delivery-assignment.entity.js';
import { Money } from '../../../menu/domain/value-objects/money.vo.js';
import { DeliveryTokens } from '../../infrastructure/tokens/delivery.tokens.js';
import crypto from 'crypto';

@injectable()
export class CreateDeliveryAssignmentUseCaseImpl implements ICreateDeliveryAssignmentUseCase {
  constructor(
    @inject(DeliveryTokens.DeliveryAssignmentRepository)
    private readonly assignmentRepository: IDeliveryAssignmentRepository,
  ) {}

  async execute(orderId: string, deliveryFeeAmount: number): Promise<void> {
    const assignment = DeliveryAssignment.create({
      id: crypto.randomUUID(),
      orderId,
      driverId: null,
      status: DeliveryAssignmentStatus.PENDING,
      estimatedDistance: null,
      estimatedDuration: null,
      deliveryFee: Money.fromNumber(deliveryFeeAmount),
      acceptedAt: null,
      pickedUpAt: null,
      deliveredAt: null,
      cancelledAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.assignmentRepository.save(assignment);
  }
}
