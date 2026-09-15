import { PaymentProvider } from '../../domain/types/payment.types.js';

export type CreatePaymentInput = {
  orderId: string;
  amount: number; // In smallest currency unit (e.g., cents)
  currency: string;
  metadata?: Record<string, string>;
};

export type CreatePaymentResult = {
  provider: PaymentProvider;
  providerPaymentId: string;
  clientSecret: string;
};

export type RefundPaymentInput = {
  providerPaymentId: string;
  amount?: number;
};

export type RefundPaymentResult = {
  success: boolean;
  refundId?: string;
  error?: string;
};

export type WebhookEvent = {
  eventId: string;
  type: 'PAYMENT_SUCCEEDED' | 'PAYMENT_FAILED' | 'UNKNOWN';
  providerPaymentId: string;
  orderId?: string;
  amount?: number;
  failureCode?: string;
  failureReason?: string;
};

export interface IPaymentProvider {
  /**
   * Identifies the provider this implementation handles.
   */
  getProviderName(): PaymentProvider;

  /**
   * Initializes a payment with the gateway.
   */
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;

  /**
   * Refunds a payment.
   */
  refundPayment(input: RefundPaymentInput): Promise<RefundPaymentResult>;

  /**
   * Parses and verifies a webhook payload, translating it into a standard application event.
   */
  verifyWebhook(payload: Buffer, signature: string): Promise<WebhookEvent>;
}
