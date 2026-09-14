import type { IPaymentAttemptRepository } from '../ports/payment-attempt.repository.interface.js';
import type { IOrderRepository } from '../../../ordering/domain/repositories/order.repository.js';
import type { PrismaExecutor } from '../../../../infrastructure/database/prisma-client.type.js';

export interface PaymentTransactionContext {
  paymentAttemptRepo: IPaymentAttemptRepository;
  orderRepo: IOrderRepository;
  tx: PrismaExecutor;
}

export interface IPaymentTransaction {
  execute<T>(operation: (context: PaymentTransactionContext) => Promise<T>): Promise<T>;
}
