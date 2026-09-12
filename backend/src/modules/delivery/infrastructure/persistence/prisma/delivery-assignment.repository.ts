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

  async findByDriverId(driverId: string): Promise<DeliveryAssignment[]> {
    const records = await this.prisma.deliveryAssignment.findMany({
      where: { driverId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r: any) => this.mapToDomain(r));
  }

  async findAvailableAssignments(
    driverLat?: number,
    driverLng?: number,
  ): Promise<DeliveryAssignment[]> {
    if (driverLat !== undefined && driverLng !== undefined) {
      // Use Haversine formula to sort by distance (in kilometers)
      const records = await this.prisma.$queryRaw<any[]>`
        SELECT 
          da.id,
          da."orderId",
          da."driverId",
          da.status,
          da.estimated_distance as "estimatedDistance",
          da.estimated_duration as "estimatedDuration",
          da.delivery_fee as "deliveryFee",
          da.accepted_at as "acceptedAt",
          da.picked_up_at as "pickedUpAt",
          da.delivered_at as "deliveredAt",
          da.cancelled_at as "cancelledAt",
          da.created_at as "createdAt",
          da.updated_at as "updatedAt"
        FROM delivery_assignments da
        JOIN orders o ON da."orderId" = o.id
        JOIN restaurants r ON o."restaurantId" = r.id
        WHERE da.status = 'OFFERED'
        ORDER BY (
          6371 * acos(
            cos(radians(${driverLat})) * 
            cos(radians(r.latitude::float8)) * 
            cos(radians(r.longitude::float8) - radians(${driverLng})) + 
            sin(radians(${driverLat})) * 
            sin(radians(r.latitude::float8))
          )
        ) ASC
      `;
      return records.map((r) => this.mapToDomain(r));
    }

    // Fallback if driver location is unknown
    const records = await this.prisma.deliveryAssignment.findMany({
      where: { status: 'OFFERED' },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r: any) => this.mapToDomain(r));
  }

  async save(assignment: DeliveryAssignment): Promise<void> {
    await this.prisma.$transaction(async (tx: any) => {
      await tx.deliveryAssignment.upsert({
        where: { id: assignment.id },
        create: {
          id: assignment.id,
          order: { connect: { id: assignment.orderId } },
          ...(assignment.driverId ? { driver: { connect: { id: assignment.driverId } } } : {}),
          status: assignment.status,
          estimatedDistance: assignment.estimatedDistance,
          estimatedDuration: assignment.estimatedDuration,
          deliveryFee: isNaN(assignment.deliveryFee.getValue())
            ? 0
            : assignment.deliveryFee.getValue(),
          acceptedAt: assignment.acceptedAt,
          pickedUpAt: assignment.pickedUpAt,
          deliveredAt: assignment.deliveredAt,
          cancelledAt: assignment.cancelledAt,
          expiresAt: assignment.expiresAt,
        },
        update: {
          ...(assignment.driverId
            ? { driver: { connect: { id: assignment.driverId } } }
            : { driver: { disconnect: true } }),
          status: assignment.status,
          acceptedAt: assignment.acceptedAt,
          pickedUpAt: assignment.pickedUpAt,
          deliveredAt: assignment.deliveredAt,
          cancelledAt: assignment.cancelledAt,
          expiresAt: assignment.expiresAt,
          updatedAt: assignment.updatedAt,
        },
      });

      const events = assignment.getDomainEvents();
      if (events.length > 0) {
        await tx.outboxEvent.createMany({
          data: events.map((event: any) => ({
            eventName: event.eventName,
            payload: event,
          })),
        });
      }
    });
    assignment.clearDomainEvents();
  }

  async claimAssignment(assignmentId: string, driverId: string): Promise<boolean> {
    // Optimistic concurrency control — atomic conditional UPDATE + driver status in one transaction
    return await this.prisma.$transaction(async (tx) => {
      const result = await tx.$executeRaw`
        UPDATE "delivery_assignments"
        SET "status" = 'ACCEPTED', "driverId" = ${driverId}::uuid, "accepted_at" = NOW(), "updated_at" = NOW()
        WHERE "id" = ${assignmentId}::uuid 
          AND "status" = 'OFFERED'::"DeliveryAssignmentStatus"
          AND ("expires_at" IS NULL OR "expires_at" > (NOW() AT TIME ZONE 'UTC'))
      `;
      if (result === 0) return false;

      // Atomically mark driver as busy so there's no window where assignment is ACCEPTED but driver is still AVAILABLE
      // We must ensure the driver is STILL available at this exact moment in the transaction!
      const driverUpdateResult = await tx.$executeRaw`
        UPDATE "drivers"
        SET "status" = 'BUSY', "updated_at" = NOW()
        WHERE "id" = ${driverId}::uuid AND "status" = 'AVAILABLE'
      `;

      if (driverUpdateResult === 0) {
        // Driver was no longer available, we must rollback the entire transaction!
        throw new Error('Driver is no longer available');
      }

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
      expiresAt: record.expiresAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
