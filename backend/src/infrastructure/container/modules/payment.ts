import { container } from 'tsyringe';
import { PaymentTokens } from '../../../modules/payment/infrastructure/tokens/payment.tokens.js';
import { PAYMENT_PROVIDERS } from '../../../modules/payment/application/services/payment-provider.resolver.js';
import { StripePaymentProvider } from '../../../modules/payment/infrastructure/stripe/stripe-payment-provider.js';
import { PrismaPaymentAttemptRepository } from '../../../modules/payment/infrastructure/repositories/prisma-payment-attempt.repository.js';
import { PaymentProviderResolver } from '../../../modules/payment/application/services/payment-provider.resolver.js';
import { InitializePaymentUseCase } from '../../../modules/payment/application/use-cases/initialize-payment.use-case.js';
import { ProcessWebhookUseCase } from '../../../modules/payment/application/use-cases/process-webhook.use-case.js';

export const registerPayment = (): void => {
  // Repositories
  container.register(PaymentTokens.PaymentAttemptRepository, {
    useClass: PrismaPaymentAttemptRepository,
  });

  // Providers
  container.register(PAYMENT_PROVIDERS, {
    useClass: StripePaymentProvider,
  });

  // Services
  container.register(PaymentTokens.PaymentProviderResolver, {
    useClass: PaymentProviderResolver,
  });

  // Use Cases
  container.register(PaymentTokens.InitializePaymentUseCase, {
    useClass: InitializePaymentUseCase,
  });

  container.register(PaymentTokens.ProcessWebhookUseCase, {
    useClass: ProcessWebhookUseCase,
  });
};
