import { injectable, inject } from 'tsyringe';
import { ICustomerRepository } from '../../../domain/repositories/customer.repository.js';
import { InfrastructureTokens } from '../../../../../infrastructure/container/tokens/index.js';
import type { PrismaExecutor } from '../../../../../infrastructure/database/prisma-client.type.js';
import { Customer } from '../../../domain/entities/customer.entity.js';
import { CustomerMapper } from './mappers/customer.mapper.js';
import { BaseRepository } from '../../../../../infrastructure/database/base.repository.js';
import { CacheService } from '../../../../../infrastructure/cache/cache.service.js';

@injectable()
export class CustomerRepository extends BaseRepository implements ICustomerRepository {
  constructor(
    @inject(InfrastructureTokens.PrismaClient)
    prisma: PrismaExecutor,
    @inject(InfrastructureTokens.CacheService)
    private readonly cacheService: CacheService,
  ) {
    super(prisma);
  }

  async findById(id: string): Promise<Customer | null> {
    const cacheKey = `customer:id:${id}`;
    const cached = await this.cacheService.get<any>(cacheKey);

    if (cached) {
      if (typeof cached.createdAt === 'string') cached.createdAt = new Date(cached.createdAt);
      if (typeof cached.updatedAt === 'string') cached.updatedAt = new Date(cached.updatedAt);
      return CustomerMapper.toDomain(cached);
    }

    const customer = await this.execute(() =>
      this.prisma.customer.findUnique({
        where: { id },
      }),
    );

    if (!customer) {
      return null;
    }

    await this.cacheService.set(cacheKey, customer, 3600); // Cache for 1 hour
    return CustomerMapper.toDomain(customer);
  }

  async findByUserId(userId: string): Promise<Customer | null> {
    const cacheKey = `customer:userId:${userId}`;
    const cached = await this.cacheService.get<any>(cacheKey);

    if (cached) {
      if (typeof cached.createdAt === 'string') cached.createdAt = new Date(cached.createdAt);
      if (typeof cached.updatedAt === 'string') cached.updatedAt = new Date(cached.updatedAt);
      return CustomerMapper.toDomain(cached);
    }

    const customer = await this.execute(() =>
      this.prisma.customer.findUnique({
        where: { userId },
      }),
    );

    if (!customer) {
      return null;
    }

    await this.cacheService.set(cacheKey, customer, 3600); // Cache for 1 hour
    return CustomerMapper.toDomain(customer);
  }

  async create(customer: Customer): Promise<Customer> {
    const data = CustomerMapper.toPersistence(customer);

    const newCustomer = await this.execute(() =>
      this.prisma.customer.create({
        data,
      }),
    );

    await this.cacheService.delete(`customer:id:${customer.getId()}`);
    await this.cacheService.delete(`customer:userId:${customer.getUserId()}`);

    return CustomerMapper.toDomain(newCustomer);
  }

  async update(customer: Customer): Promise<Customer> {
    const data = CustomerMapper.toUpdatePersistence(customer);

    const updateCustomer = await this.execute(() =>
      this.prisma.customer.update({
        where: {
          id: customer.getId(),
        },
        data,
      }),
    );

    await this.cacheService.delete(`customer:id:${customer.getId()}`);
    await this.cacheService.delete(`customer:userId:${customer.getUserId()}`);

    return CustomerMapper.toDomain(updateCustomer);
  }
}
