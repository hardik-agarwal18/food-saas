import { injectable, inject } from 'tsyringe';
import type { PaymentProviderResolver } from '../services/payment-provider.resolver.js';
import { PaymentTokens } from '../../infrastructure/tokens/payment.tokens.js';
import { PaymentAttemptStatus } from '../../domain/types/payment.types.js';
import type { IPaymentTransaction } from '../transaction/payment.transaction.js';

export class PaymentAttemptNotReadyError extends Error {
  constructor(providerPaymentId: string) {
    super(
      `Webhook received for unknown payment (maybe not created yet): ${providerPaymentId}. Retrying...`,
    );
    this.name = 'PaymentAttemptNotReadyError';
  }
}

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
    const event = await provider.verifyWebhook(payload as Buffer, signature);

    if (event.type === 'UNKNOWN') {
      return; // Ignore unsupported events
    }

    await this.transaction.execute(async ({ paymentAttemptRepo, orderRepo, tx }) => {
      // 1. Deduplicate by provider and eventId
      // We use $executeRaw to safely do ON CONFLICT DO NOTHING and check affected rows
      const insertedRows = await tx.$executeRaw`
        INSERT INTO processed_webhooks (provider, "eventId", processed_at)
        VALUES (${provider.getProviderName()}, ${event.eventId}, NOW())
        ON CONFLICT DO NOTHING
      `;

      if (insertedRows === 0) {
        console.log(`Webhook already processed: ${event.eventId}`);
        return;
      }

      // Find the corresponding payment attempt
      const paymentAttempt = await paymentAttemptRepo.findByProviderId(
        provider.getProviderName(),
        event.providerPaymentId,
      );

      if (!paymentAttempt) {
        throw new PaymentAttemptNotReadyError(event.providerPaymentId);
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
