import { injectable, inject } from 'tsyringe';
import { InfrastructureTokens } from '../../../../../infrastructure/container/tokens/index.js';
import type { PrismaExecutor } from '../../../../../infrastructure/database/prisma-client.type.js';
import { BaseRepository } from '../../../../../infrastructure/database/base.repository.js';
import type {
  IOrderRepository,
  PaginatedResult,
  PaginationOptions,
} from '../../../domain/repositories/order.repository.js';
import { Order } from '../../../domain/entities/order.entity.js';
import { OrderMapper } from './mappers/order.mapper.js';

@injectable()
export class OrderRepositoryImpl extends BaseRepository implements IOrderRepository {
  constructor(
    @inject(InfrastructureTokens.PrismaClient)
    prisma: PrismaExecutor,
  ) {
    super(prisma);
  }

  async save(order: Order): Promise<void> {
    const data = OrderMapper.toCreateInput(order);
    await this.execute(() =>
      this.prisma.$transaction(async (tx: any) => {
        await tx.order.create({ data });
        const events = order.getDomainEvents();
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
    order.clearDomainEvents();
  }

  async update(order: Order): Promise<void> {
    // Only updating fields that can change (status, paymentStatus, timestamps)
    await this.execute(() =>
      this.prisma.$transaction(async (tx: any) => {
        await tx.order.update({
          where: { id: order.getId() },
          data: {
            status: order.getStatus(),
            paymentStatus: order.getPaymentStatus(),
            acceptedAt: order.getAcceptedAt(),
            preparingAt: order.getPreparingAt(),
            readyAt: order.getReadyAt(),
            deliveredAt: order.getDeliveredAt(),
            cancelledAt: order.getCancelledAt(),
            updatedAt: order.getUpdatedAt(),
          },
        });
        const events = order.getDomainEvents();
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
    order.clearDomainEvents();
  }

  async findById(id: string): Promise<Order | null> {
    const raw = await this.execute(() =>
      this.prisma.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              modifiers: true,
            },
          },
        },
      }),
    );

    if (!raw) return null;
    return OrderMapper.toDomain(raw);
  }

  async findByCustomerId(
    customerId: string,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<Order>> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const [rawList, total] = await this.execute(() =>
      Promise.all([
        this.prisma.order.findMany({
          where: { customerId },
          include: {
            items: {
              include: { modifiers: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.order.count({ where: { customerId } }),
      ]),
    );

    return {
      data: rawList.map((r) => OrderMapper.toDomain(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByRestaurantId(
    restaurantId: string,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<Order>> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const [rawList, total] = await this.execute(() =>
      Promise.all([
        this.prisma.order.findMany({
          where: { restaurantId },
          include: {
            items: {
              include: { modifiers: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.order.count({ where: { restaurantId } }),
      ]),
    );

    return {
      data: rawList.map((r) => OrderMapper.toDomain(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
  async getAnalytics(
    restaurantId: string,
    date: Date,
  ): Promise<{
    totalRevenue: number;
    activeOrdersCount: number;
    completedOrdersCount: number;
  }> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [revenueResult, activeOrdersCount, completedOrdersCount] = await this.execute(() =>
      Promise.all([
        this.prisma.order.aggregate({
          where: {
            restaurantId,
            createdAt: { gte: startOfDay, lte: endOfDay },
            status: 'DELIVERED', // Count revenue only for completed orders (or PAID, but DELIVERED is safer for realized revenue)
          },
          _sum: {
            totalAmount: true,
          },
        }),
        this.prisma.order.count({
          where: {
            restaurantId,
            status: { notIn: ['DELIVERED', 'CANCELLED'] },
          },
        }),
        this.prisma.order.count({
          where: {
            restaurantId,
            createdAt: { gte: startOfDay, lte: endOfDay },
            status: 'DELIVERED',
          },
        }),
      ]),
    );

    return {
      totalRevenue: Number(revenueResult._sum.totalAmount || 0),
      activeOrdersCount,
      completedOrdersCount,
    };
  }
}
