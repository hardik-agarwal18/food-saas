import Stripe from 'stripe';
import { PaymentProvider } from '../../../../generated/prisma/client.js';
import {
  IPaymentProvider,
  CreatePaymentInput,
  CreatePaymentResult,
  RefundPaymentInput,
  RefundPaymentResult,
  WebhookEvent,
} from '../../application/ports/payment-provider.interface.js';

export class StripePaymentProvider implements IPaymentProvider {
  private stripe: Stripe;
  private endpointSecret: string;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }

    this.endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2024-06-20' as any, // Ensure a stable API version
    });
  }

  public getProviderName(): PaymentProvider {
    return PaymentProvider.STRIPE;
  }

  public async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: input.amount,
      currency: input.currency.toLowerCase(),
      metadata: {
        orderId: input.orderId,
        ...input.metadata,
      },
      // You can add options like automatic_payment_methods
      automatic_payment_methods: {
        enabled: true,
      },
    });

    if (!paymentIntent.client_secret) {
      throw new Error('Stripe failed to return a client_secret');
    }

    return {
      provider: PaymentProvider.STRIPE,
      providerPaymentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
    };
  }

  public async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentResult> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: input.providerPaymentId,
        amount: input.amount,
      });

      return {
        success: refund.status === 'succeeded' || refund.status === 'pending',
        refundId: refund.id,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  public async verifyWebhook(payload: Buffer, signature: string): Promise<WebhookEvent> {
    if (!this.endpointSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured for webhook verification');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, this.endpointSecret);

      switch (event.type) {
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          return {
            eventId: event.id,
            type: 'PAYMENT_SUCCEEDED',
            providerPaymentId: paymentIntent.id,
            orderId: paymentIntent.metadata?.orderId,
            amount: paymentIntent.amount,
          };
        }
        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          return {
            eventId: event.id,
            type: 'PAYMENT_FAILED',
            providerPaymentId: paymentIntent.id,
            orderId: paymentIntent.metadata?.orderId,
            amount: paymentIntent.amount,
            failureCode: paymentIntent.last_payment_error?.code,
            failureReason: paymentIntent.last_payment_error?.message,
          };
        }
        default:
          return {
            eventId: event.id,
            type: 'UNKNOWN',
            providerPaymentId: (event.data.object as any).id || 'unknown',
          };
      }
    } catch (err: any) {
      throw new Error(`Webhook Error: ${err.message}`);
    }
  }
}
