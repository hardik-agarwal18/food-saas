import { injectable, inject } from 'tsyringe';

import type { IPaymentAttemptRepository } from '../ports/payment-attempt.repository.interface.js';
import { PaymentProviderResolver } from '../services/payment-provider.resolver.js';
import { PaymentAttempt } from '../../domain/entities/payment-attempt.entity.js';
import type { IPlaceOrderUseCase } from '../../../ordering/application/use-cases/place-order.use-case.js';
import { OrderingTokens } from '../../../ordering/infrastructure/tokens/ordering.tokens.js';
import { PlaceOrderDto } from '../../../ordering/application/dto/order.dto.js';

import { PaymentTokens } from '../../infrastructure/tokens/payment.tokens.js';
@injectable()
export class InitializePaymentUseCase {
  constructor(
    @inject(OrderingTokens.PlaceOrderUseCase)
    private readonly placeOrderUseCase: IPlaceOrderUseCase,
    @inject(PaymentTokens.PaymentProviderResolver)
    private readonly providerResolver: PaymentProviderResolver,
    @inject(PaymentTokens.PaymentAttemptRepository)
    private readonly paymentAttemptRepo: IPaymentAttemptRepository,
  ) {}

  async execute(userId: string, dto: PlaceOrderDto): Promise<any> {
    // 1. Create the order (this handles validation and total calculation)
    // The PlaceOrderUseCase will throw OrderingDomainError if anything is invalid.
    const orderResponse = await this.placeOrderUseCase.execute(userId, dto);

    // Calculate total in cents (or smallest currency unit)
    const grandTotal =
      Number(orderResponse.subtotal) +
      Number(orderResponse.deliveryFee) +
      Number(orderResponse.taxAmount);
    const amountInCents = Math.round(grandTotal * 100);

    // 2. Resolve Payment Provider
    const provider = this.providerResolver.resolve();

    // 3. Initialize Provider Payment
    // We do this first because we need the providerPaymentId to store in our DB
    const paymentResult = await provider.createPayment({
      orderId: orderResponse.id,
      amount: amountInCents,
      currency: 'USD',
      metadata: { userId },
    });

    // 4. Create Payment Attempt (PENDING)
    const paymentAttempt = PaymentAttempt.create({
      orderId: orderResponse.id,
      provider: paymentResult.provider,
      providerPaymentId: paymentResult.providerPaymentId,
      amount: grandTotal, // store human-readable amount or cents depending on your preference. Prisma schema is Decimal(10,2). Let's store Decimal.
      currency: 'USD',
      metadata: { clientSecret: paymentResult.clientSecret },
    });

    // 5. Persist Payment Attempt
    await this.paymentAttemptRepo.save(paymentAttempt);

    // 6. Return Unified Response
    return {
      orderId: orderResponse.id,
      payment: {
        provider: paymentResult.provider,
        providerPaymentId: paymentResult.providerPaymentId,
        clientSecret: paymentResult.clientSecret,
      },
    };
  }
}
