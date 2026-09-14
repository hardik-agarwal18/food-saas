import { PaymentAttempt } from '../../domain/entities/payment-attempt.entity.js';
import { PaymentProvider } from '../../../../generated/prisma/client.js';

export interface IPaymentAttemptRepository {
  /**
   * Saves a new payment attempt.
   */
  save(paymentAttempt: PaymentAttempt): Promise<void>;

  /**
   * Updates an existing payment attempt.
   */
  update(paymentAttempt: PaymentAttempt): Promise<void>;

  /**
   * Finds a payment attempt by its internal ID.
   */
  findById(id: string): Promise<PaymentAttempt | null>;

  /**
   * Finds a payment attempt by the provider and provider's payment ID (e.g. Stripe PaymentIntent ID).
   */
  findByProviderId(
    provider: PaymentProvider,
    providerPaymentId: string,
  ): Promise<PaymentAttempt | null>;

  /**
   * Finds all payment attempts for a given order.
   */
  findByOrderId(orderId: string): Promise<PaymentAttempt[]>;
}
