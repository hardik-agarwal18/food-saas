import { injectable, inject } from 'tsyringe';
import { IUserRepository } from '../../../domain/repositories/user.repository.js';
import { InfrastructureTokens } from '../../../../../infrastructure/container/index.js';
import { User } from '../../../domain/entities/index.js';
import { UserMapper } from './mappers/user.mapper.js';
import { PrismaClient } from '../../../../../generated/prisma/client.js';
import { Email } from '../../../domain/value-objects/email.vo.js';
import { BaseRepository } from '../../../../../infrastructure/database/base.repository.js';

@injectable()
export class UserRepository extends BaseRepository implements IUserRepository {
  constructor(
    @inject(InfrastructureTokens.PrismaClient)
    prisma: PrismaClient,
  ) {
    super(prisma);
  }

  async create(user: User): Promise<User> {
    const data = UserMapper.toPersistence(user);

    const createdUser = await this.execute(() =>
      this.prisma.user.create({
        data: {
          id: data.id,
          email: data.email.getValue(),
          passwordHash: data.passwordHash.getValue(),
          roles: data.roles,
          status: data.status,
          emailVerified: data.emailVerified,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        },
      }),
    );

    return UserMapper.toDomain(createdUser);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.execute(() =>
      this.prisma.user.findUnique({
        where: {
          id,
        },
      }),
    );

    if (!user) {
      return null;
    }

    return UserMapper.toDomain(user);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const user = await this.execute(() =>
      this.prisma.user.findUnique({
        where: {
          email: email.getValue(),
        },
      }),
    );

    if (!user) {
      return null;
    }

    return UserMapper.toDomain(user);
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const user = await this.execute(() =>
      this.prisma.user.findUnique({
        where: {
          email: email.getValue(),
        },
      }),
    );

    return user !== null;
  }

  async update(user: User): Promise<User> {
    const data = UserMapper.toPersistence(user);

    const updatedUser = await this.execute(() =>
      this.prisma.user.update({
        where: {
          id: user.getId(),
        },
        data: {
          email: data.email.getValue(),
          passwordHash: data.passwordHash.getValue(),
          roles: data.roles,
          status: data.status,
          emailVerified: data.emailVerified,
        },
      }),
    );

    return UserMapper.toDomain(updatedUser);
  }
}
