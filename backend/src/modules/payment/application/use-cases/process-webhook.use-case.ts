import { injectable, inject } from 'tsyringe';
import type { IPaymentAttemptRepository } from '../ports/payment-attempt.repository.interface.js';
import type { PaymentProviderResolver } from '../services/payment-provider.resolver.js';
import { PaymentTokens } from '../../infrastructure/tokens/payment.tokens.js';
import { OrderingTokens } from '../../../ordering/infrastructure/tokens/ordering.tokens.js';
import type { IOrderRepository } from '../../../ordering/domain/repositories/order.repository.js';
import { PaymentAttemptStatus } from '../../../../generated/prisma/client.js';

@injectable()
export class ProcessWebhookUseCase {
  constructor(
    @inject(PaymentTokens.PaymentProviderResolver)
    private readonly providerResolver: PaymentProviderResolver,
    @inject(PaymentTokens.PaymentAttemptRepository)
    private readonly paymentAttemptRepo: IPaymentAttemptRepository,
    @inject(OrderingTokens.OrderRepository)
    private readonly orderRepo: IOrderRepository,
  ) {}

  async execute(payload: Buffer, signature: string): Promise<void> {
    const provider = this.providerResolver.resolve();

    // Verify signature and parse the event
    const event = await provider.verifyWebhook(payload, signature);

    if (event.type === 'UNKNOWN') {
      return; // Ignore unsupported events
    }

    // Find the corresponding payment attempt
    const paymentAttempt = await this.paymentAttemptRepo.findByProviderId(
      provider.getProviderName(),
      event.providerPaymentId,
    );

    if (!paymentAttempt) {
      console.warn(`Webhook received for unknown payment: ${event.providerPaymentId}`);
      return;
    }

    // If it's already in a final state, ignore (idempotency check)
    if (
      paymentAttempt.getStatus() === PaymentAttemptStatus.PAID ||
      paymentAttempt.getStatus() === PaymentAttemptStatus.FAILED
    ) {
      return;
    }

    const order = await this.orderRepo.findById(paymentAttempt.getOrderId());
    if (!order) {
      console.warn(
        `Order ${paymentAttempt.getOrderId()} not found for payment ${paymentAttempt.getId()}`,
      );
      return;
    }

    if (event.type === 'PAYMENT_SUCCEEDED') {
      // 1. Mark PaymentAttempt as PAID
      paymentAttempt.markPaid();

      // 2. Mark Order as PAID (dispatches OrderPaidEvent)
      order.markPaid();
    } else if (event.type === 'PAYMENT_FAILED') {
      // 1. Mark PaymentAttempt as FAILED
      paymentAttempt.markFailed(event.failureCode, event.failureReason);

      // 2. Mark Order as FAILED
      order.markPaymentFailed();
    }

    // Persist changes
    // It's important to save these atomically if possible, but our current repositories
    // are independent. We will save them sequentially. Since the webhook can be retried,
    // if it fails halfway, the idempotency check will let it try again or we might need a distributed tx.
    // For now, sequential save is acceptable.
    await this.paymentAttemptRepo.update(paymentAttempt);
    await this.orderRepo.update(order);
  }
}
