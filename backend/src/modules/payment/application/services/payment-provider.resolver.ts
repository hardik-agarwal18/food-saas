import { injectable, inject } from 'tsyringe';
import { IPaymentProvider } from '../ports/payment-provider.interface.js';
import { PaymentProvider } from '../../domain/types/payment.types.js';

export const PAYMENT_PROVIDERS = Symbol('PAYMENT_PROVIDERS');

@injectable()
export class PaymentProviderResolver {
  constructor(
    @inject(PAYMENT_PROVIDERS)
    private readonly providers: IPaymentProvider[],
  ) {}

  public resolve(): IPaymentProvider {
    const providerStr = process.env.PAYMENT_PROVIDER?.toUpperCase() || 'STRIPE';

    // For now, only STRIPE is supported, but this is future-proof
    let targetProvider: PaymentProvider = PaymentProvider.STRIPE;

    if (providerStr === 'RAZORPAY') targetProvider = PaymentProvider.RAZORPAY;
    if (providerStr === 'PAYPAL') targetProvider = PaymentProvider.PAYPAL;

    const provider = this.providers.find((p) => p.getProviderName() === targetProvider);

    if (!provider) {
      throw new Error(`Payment provider ${targetProvider} is not configured or not implemented.`);
    }

    return provider;
  }
}
