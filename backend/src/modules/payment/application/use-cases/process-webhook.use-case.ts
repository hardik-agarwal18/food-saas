import { injectable, inject } from 'tsyringe';
import type { PaymentProviderResolver } from '../services/payment-provider.resolver.js';
import { PaymentTokens } from '../../infrastructure/tokens/payment.tokens.js';
import { PaymentAttemptStatus } from '../../../../generated/prisma/client.js';
import type { IPaymentTransaction } from '../transaction/payment.transaction.js';

@injectable()
export class ProcessWebhookUseCase {
  constructor(
    @inject(PaymentTokens.PaymentProviderResolver)
    private readonly providerResolver: PaymentProviderResolver,
    @inject(PaymentTokens.PaymentTransaction)
    private readonly transaction: IPaymentTransaction,
  ) {}

  async execute(payload: Buffer | string, signature: string): Promise<void> {
    const provider = this.providerResolver.resolve();

    // Verify signature and parse the event
    const event = await provider.verifyWebhook(payload, signature);

    if (event.type === 'UNKNOWN') {
      return; // Ignore unsupported events
    }

    await this.transaction.execute(async ({ paymentAttemptRepo, orderRepo }) => {
      // Find the corresponding payment attempt
      const paymentAttempt = await paymentAttemptRepo.findByProviderId(
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

      const order = await orderRepo.findById(paymentAttempt.getOrderId());
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

      // Persist changes atomically
      await paymentAttemptRepo.update(paymentAttempt);
      await orderRepo.update(order);
    });
  }
}
