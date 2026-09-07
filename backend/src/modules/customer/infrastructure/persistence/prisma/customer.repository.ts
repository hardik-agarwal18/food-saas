import { injectable, inject } from 'tsyringe';
import { ICustomerRepository } from '../../../domain/repositories/customer.repository.js';
import { InfrastructureTokens } from '../../../../../infrastructure/container/tokens/index.js';
import type { PrismaExecutor } from '../../../../../infrastructure/database/prisma-client.type.js';
import { Customer } from '../../../domain/entities/customer.entity.js';
import { CustomerMapper } from './mappers/customer.mapper.js';
import { BaseRepository } from '../../../../../infrastructure/database/base.repository.js';

@injectable()
export class CustomerRepository extends BaseRepository implements ICustomerRepository {
  constructor(
    @inject(InfrastructureTokens.PrismaClient)
    prisma: PrismaExecutor,
  ) {
    super(prisma);
  }

  async findById(id: string): Promise<Customer | null> {
    const customer = await this.execute(() =>
      this.prisma.customer.findUnique({
        where: {
          id,
        },
      }),
    );

    if (!customer) {
      return null;
    }

    return CustomerMapper.toDomain(customer);
  }

  async findByUserId(userId: string): Promise<Customer | null> {
    const customer = await this.execute(() =>
      this.prisma.customer.findUnique({
        where: {
          userId,
        },
      }),
    );

    if (!customer) {
      return null;
    }

    return CustomerMapper.toDomain(customer);
  }

  async create(customer: Customer): Promise<Customer> {
    const data = CustomerMapper.toPersistence(customer);

    const newCustomer = await this.execute(() =>
      this.prisma.customer.create({
        data,
      }),
    );

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

    return CustomerMapper.toDomain(updateCustomer);
  }
}
