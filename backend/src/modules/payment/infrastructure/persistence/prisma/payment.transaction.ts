import { injectable, inject } from 'tsyringe';
import {
  IPaymentTransaction,
  PaymentTransactionContext,
} from '../../../application/transaction/payment.transaction.js';
import { InfrastructureTokens } from '../../../../../infrastructure/container/tokens/index.js';
import { PrismaPaymentAttemptRepository } from '../../repositories/prisma-payment-attempt.repository.js';
import { OrderRepositoryImpl } from '../../../../ordering/infrastructure/persistence/prisma/order.repository.js';
import type { PrismaExecutor } from '../../../../../infrastructure/database/prisma-client.type.js';

@injectable()
export class PaymentTransaction implements IPaymentTransaction {
  constructor(
    @inject(InfrastructureTokens.PrismaClient)
    private readonly prisma: PrismaExecutor,
  ) {}

  async execute<T>(operation: (context: PaymentTransactionContext) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      const paymentAttemptRepo = new PrismaPaymentAttemptRepository(tx);
      const orderRepo = new OrderRepositoryImpl(tx);

      return operation({
        paymentAttemptRepo,
        orderRepo,
        tx,
      });
    });
  }
}
