import { injectable, inject } from 'tsyringe';
import { InfrastructureTokens } from '../../../../../infrastructure/container/tokens/index.js';
import type { PrismaExecutor } from '../../../../../infrastructure/database/prisma-client.type.js';
import { BaseRepository } from '../../../../../infrastructure/database/base.repository.js';
import { ICustomerAddressRepository } from '../../../domain/repositories/customer-address.repository.js';
import { CustomerAddress } from '../../../domain/entities/customer-address.entity.js';
import { CustomerAddressLabel } from '../../../domain/value-objects/customer-address-label.vo.js';

@injectable()
export class PrismaCustomerAddressRepository
  extends BaseRepository
  implements ICustomerAddressRepository
{
  constructor(
    @inject(InfrastructureTokens.PrismaClient)
    prisma: PrismaExecutor,
  ) {
    super(prisma);
  }

  async save(address: CustomerAddress): Promise<void> {
    const data = address.toPrimitives();

    await this.execute(() =>
      this.prisma.customerAddress.upsert({
        where: { id: data.id },
        create: {
          id: data.id,
          customerId: data.customerId,
          label: data.label,
          streetAddress: data.streetAddress,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
          latitude: data.latitude,
          longitude: data.longitude,
          isDefault: data.isDefault,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        },
        update: {
          label: data.label,
          streetAddress: data.streetAddress,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
          latitude: data.latitude,
          longitude: data.longitude,
          isDefault: data.isDefault,
          updatedAt: data.updatedAt,
        },
      }),
    );
  }

  async findById(id: string): Promise<CustomerAddress | null> {
    const raw = await this.execute(() =>
      this.prisma.customerAddress.findUnique({
        where: { id },
      }),
    );

    if (!raw) return null;

    return CustomerAddress.rehydrate({
      id: raw.id,
      customerId: raw.customerId,
      label: new CustomerAddressLabel(raw.label),
      streetAddress: raw.streetAddress,
      city: raw.city,
      state: raw.state,
      zipCode: raw.zipCode,
      country: raw.country,
      latitude: raw.latitude ? Number(raw.latitude) : null,
      longitude: raw.longitude ? Number(raw.longitude) : null,
      isDefault: raw.isDefault,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async findByCustomerId(customerId: string): Promise<CustomerAddress[]> {
    const rows = await this.execute(() =>
      this.prisma.customerAddress.findMany({
        where: { customerId },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      }),
    );

    return rows.map((raw) =>
      CustomerAddress.rehydrate({
        id: raw.id,
        customerId: raw.customerId,
        label: new CustomerAddressLabel(raw.label),
        streetAddress: raw.streetAddress,
        city: raw.city,
        state: raw.state,
        zipCode: raw.zipCode,
        country: raw.country,
        latitude: raw.latitude ? Number(raw.latitude) : null,
        longitude: raw.longitude ? Number(raw.longitude) : null,
        isDefault: raw.isDefault,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      }),
    );
  }

  async delete(id: string): Promise<void> {
    await this.execute(() =>
      this.prisma.customerAddress.delete({
        where: { id },
      }),
    );
  }

  async resetDefaultAddress(customerId: string): Promise<void> {
    await this.execute(() =>
      this.prisma.customerAddress.updateMany({
        where: { customerId },
        data: { isDefault: false },
      }),
    );
  }
}
