import { inject, injectable } from 'tsyringe';
import type { IDriverRepository } from '../../../domain/repositories/driver.repository.js';
import { Driver, DriverStatus, VehicleType } from '../../../domain/entities/driver.entity.js';
import { PrismaClient } from '../../../../../generated/prisma/client.js';
import { InfrastructureTokens } from '../../../../../infrastructure/container/tokens/infrastructure.tokens.js';

@injectable()
export class DriverRepositoryImpl implements IDriverRepository {
  constructor(@inject(InfrastructureTokens.PrismaClient) private prisma: PrismaClient) {}

  async findById(id: string): Promise<Driver | null> {
    const record = await this.prisma.driver.findUnique({ where: { id } });
    return record ? this.mapToDomain(record) : null;
  }

  async findByIds(ids: string[]): Promise<Driver[]> {
    if (ids.length === 0) return [];
    const records = await this.prisma.driver.findMany({ where: { id: { in: ids } } });
    return records.map((record) => this.mapToDomain(record));
  }

  async findByUserId(userId: string): Promise<Driver | null> {
    const record = await this.prisma.driver.findUnique({ where: { userId } });
    return record ? this.mapToDomain(record) : null;
  }

  async save(driver: Driver): Promise<void> {
    await this.prisma.driver.upsert({
      where: { id: driver.id },
      create: {
        id: driver.id,
        userId: driver.userId,
        firstName: driver.firstName,
        lastName: driver.lastName,
        phone: driver.phone,
        vehicleType: driver.vehicleType,
        vehiclePlateNumber: driver.vehiclePlateNumber,
        status: driver.status,
        currentLatitude: driver.currentLocation?.latitude,
        currentLongitude: driver.currentLocation?.longitude,
        lastLocationAt: driver.lastLocationAt,
      },
      update: {
        status: driver.status,
        currentLatitude: driver.currentLocation?.latitude,
        currentLongitude: driver.currentLocation?.longitude,
        lastLocationAt: driver.lastLocationAt,
        updatedAt: new Date(),
      },
    });
  }

  private mapToDomain(record: any): Driver {
    return Driver.rehydrate({
      id: record.id,
      userId: record.userId,
      firstName: record.firstName,
      lastName: record.lastName,
      phone: record.phone,
      vehicleType: record.vehicleType as VehicleType,
      vehiclePlateNumber: record.vehiclePlateNumber,
      status: record.status as DriverStatus,
      currentLocation:
        record.currentLatitude && record.currentLongitude
          ? {
              latitude: Number(record.currentLatitude),
              longitude: Number(record.currentLongitude),
            }
          : null,
      lastLocationAt: record.lastLocationAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
