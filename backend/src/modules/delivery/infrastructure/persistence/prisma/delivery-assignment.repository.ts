import { inject, injectable } from 'tsyringe';
import { IDeliveryAssignmentRepository } from '../../../domain/repositories/delivery-assignment.repository.js';
import {
  DeliveryAssignment,
  DeliveryAssignmentStatus,
} from '../../../domain/entities/delivery-assignment.entity.js';
import { PrismaClient } from '../../../../../generated/prisma/client.js';
import { Money } from '../../../../menu/domain/value-objects/money.vo.js';
import { InfrastructureTokens } from '../../../../../infrastructure/container/tokens/infrastructure.tokens.js';

@injectable()
export class DeliveryAssignmentRepositoryImpl implements IDeliveryAssignmentRepository {
  constructor(@inject(InfrastructureTokens.PrismaClient) private prisma: PrismaClient) {}

  async findById(id: string): Promise<DeliveryAssignment | null> {
    const record = await this.prisma.deliveryAssignment.findUnique({ where: { id } });
    return record ? this.mapToDomain(record) : null;
  }

  async findByOrderId(orderId: string): Promise<DeliveryAssignment[]> {
    const records = await this.prisma.deliveryAssignment.findMany({ where: { orderId } });
    return records.map((r: any) => this.mapToDomain(r));
  }

  async save(assignment: DeliveryAssignment): Promise<void> {
    await this.prisma.deliveryAssignment.upsert({
      where: { id: assignment.id },
      create: {
        id: assignment.id,
        orderId: assignment.orderId,
        driverId: assignment.driverId,
        status: assignment.status,
        estimatedDistance: assignment.estimatedDistance,
        estimatedDuration: assignment.estimatedDuration,
        deliveryFee: assignment.deliveryFee.getValue(),
        acceptedAt: assignment.acceptedAt,
        pickedUpAt: assignment.pickedUpAt,
        deliveredAt: assignment.deliveredAt,
        cancelledAt: assignment.cancelledAt,
      },
      update: {
        driverId: assignment.driverId,
        status: assignment.status,
        acceptedAt: assignment.acceptedAt,
        pickedUpAt: assignment.pickedUpAt,
        deliveredAt: assignment.deliveredAt,
        cancelledAt: assignment.cancelledAt,
      },
    });
  }

  async claimAssignment(assignmentId: string, driverId: string): Promise<boolean> {
    // Optimistic concurrency control — atomic conditional UPDATE + driver status in one transaction
    return await this.prisma.$transaction(async (tx) => {
      const result = await tx.$executeRaw`
        UPDATE "delivery_assignments"
        SET "status" = 'ACCEPTED', "driver_id" = ${driverId}::uuid, "accepted_at" = NOW(), "updated_at" = NOW()
        WHERE "id" = ${assignmentId}::uuid AND "status" = 'PENDING'
      `;
      if (result === 0) return false;
      // Atomically mark driver as busy so there's no window where assignment is ACCEPTED but driver is still AVAILABLE
      await tx.driver.update({
        where: { id: driverId },
        data: { status: 'BUSY', updatedAt: new Date() },
      });
      return true;
    });
  }

  private mapToDomain(record: any): DeliveryAssignment {
    return DeliveryAssignment.rehydrate({
      id: record.id,
      orderId: record.orderId,
      driverId: record.driverId,
      status: record.status as DeliveryAssignmentStatus,
      estimatedDistance: record.estimatedDistance ? Number(record.estimatedDistance) : null,
      estimatedDuration: record.estimatedDuration,
      deliveryFee: Money.fromNumber(Number(record.deliveryFee)),
      acceptedAt: record.acceptedAt,
      pickedUpAt: record.pickedUpAt,
      deliveredAt: record.deliveredAt,
      cancelledAt: record.cancelledAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
