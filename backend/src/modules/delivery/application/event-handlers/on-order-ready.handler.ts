import { EventHandler } from '../../../../shared/events/event-dispatcher.js';
import { OrderReadyEvent } from '../../../ordering/domain/events/order-ready.event.js';
import type { ICreateDeliveryAssignmentUseCase } from '../use-cases/create-delivery-assignment.use-case.js';
import { inject, injectable } from 'tsyringe';
import { OrderType } from '../../../../generated/prisma/client.js';
import { DeliveryTokens } from '../../infrastructure/tokens/delivery.tokens.js';

@injectable()
export class OnOrderReadyHandler implements EventHandler<OrderReadyEvent> {
  constructor(
    @inject(DeliveryTokens.CreateDeliveryAssignmentUseCase)
    private readonly createAssignmentUseCase: ICreateDeliveryAssignmentUseCase,
  ) {}

  async handle(event: OrderReadyEvent): Promise<void> {
    // We only create assignments for DELIVERY orders!
    if (event.orderType === OrderType.DELIVERY) {
      await this.createAssignmentUseCase.execute(event.orderId, event.deliveryFeeAmount);
    }
  }
}
