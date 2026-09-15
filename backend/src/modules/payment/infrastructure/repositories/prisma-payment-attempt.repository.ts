import { injectable, inject } from 'tsyringe';
import { BaseRepository } from '../../../../infrastructure/database/base.repository.js';
import { InfrastructureTokens } from '../../../../infrastructure/container/tokens/index.js';
import type { PrismaExecutor } from '../../../../infrastructure/database/prisma-client.type.js';
import { IPaymentAttemptRepository } from '../../application/ports/payment-attempt.repository.interface.js';
import { PaymentAttempt } from '../../domain/entities/payment-attempt.entity.js';

import {
  PaymentProvider as DomainPaymentProvider,
  PaymentAttemptStatus as DomainPaymentAttemptStatus,
} from '../../domain/types/payment.types.js';

@injectable()
export class PrismaPaymentAttemptRepository
  extends BaseRepository
  implements IPaymentAttemptRepository
{
  constructor(
    @inject(InfrastructureTokens.PrismaClient)
    prisma: PrismaExecutor,
  ) {
    super(prisma);
  }

  private toDomain(raw: any): PaymentAttempt {
    return PaymentAttempt.rehydrate({
      id: raw.id,
      orderId: raw.orderId,
      provider: raw.provider as unknown as DomainPaymentProvider,
      providerPaymentId: raw.providerPaymentId,
      amount: Number(raw.amount),
      currency: raw.currency,
      status: raw.status as unknown as DomainPaymentAttemptStatus,
      failureCode: raw.failureCode,
      failureReason: raw.failureReason,
      metadata: raw.metadata as Record<string, any> | null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async save(paymentAttempt: PaymentAttempt): Promise<void> {
    const data = {
      id: paymentAttempt.getId(),
      orderId: paymentAttempt.getOrderId(),
      provider: paymentAttempt.getProvider() as any,
      providerPaymentId: paymentAttempt.getProviderPaymentId(),
      amount: paymentAttempt.getAmount(),
      currency: paymentAttempt.getCurrency(),
      status: paymentAttempt.getStatus() as any,
      failureCode: paymentAttempt.getFailureCode(),
      failureReason: paymentAttempt.getFailureReason(),
      metadata: paymentAttempt.getMetadata() || {},
      createdAt: paymentAttempt.getCreatedAt(),
      updatedAt: paymentAttempt.getUpdatedAt(),
    };

    await this.execute(() => this.prisma.paymentAttempt.create({ data }));
    paymentAttempt.clearDomainEvents();
  }

  async update(paymentAttempt: PaymentAttempt): Promise<void> {
    await this.execute(() =>
      this.prisma.$transaction(async (tx: any) => {
        await tx.paymentAttempt.update({
          where: { id: paymentAttempt.getId() },
          data: {
            status: paymentAttempt.getStatus() as any,
            failureCode: paymentAttempt.getFailureCode(),
            failureReason: paymentAttempt.getFailureReason(),
            updatedAt: paymentAttempt.getUpdatedAt(),
          },
        });

        const events = paymentAttempt.getDomainEvents();
        if (events.length > 0) {
          await tx.outboxEvent.createMany({
            data: events.map((event: any) => ({
              eventName: event.eventName,
              payload: event,
            })),
          });
        }
      }),
    );
    paymentAttempt.clearDomainEvents();
  }

  async findById(id: string): Promise<PaymentAttempt | null> {
    const raw = await this.execute(() => this.prisma.paymentAttempt.findUnique({ where: { id } }));
    if (!raw) return null;
    return this.toDomain(raw);
  }

  async findByProviderId(
    provider: DomainPaymentProvider,
    providerPaymentId: string,
  ): Promise<PaymentAttempt | null> {
    const raw = await this.execute(() =>
      this.prisma.paymentAttempt.findUnique({
        where: {
          provider_providerPaymentId: {
            provider: provider as any,
            providerPaymentId,
          },
        },
      }),
    );
    if (!raw) return null;
    return this.toDomain(raw);
  }

  async findByOrderId(orderId: string): Promise<PaymentAttempt[]> {
    const rawList = await this.execute(() =>
      this.prisma.paymentAttempt.findMany({
        where: { orderId },
        orderBy: { createdAt: 'desc' },
      }),
    );
    return rawList.map((r) => this.toDomain(r));
  }
}
