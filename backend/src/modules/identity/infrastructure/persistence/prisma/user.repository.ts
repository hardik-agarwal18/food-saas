import { injectable, inject } from 'tsyringe';
import { IUserRepository } from '../../../domain/repositories/user.repository.js';
import { InfrastructureTokens } from '../../../../../infrastructure/container/tokens/infrastructure.tokens.js';
import { User } from '../../../domain/entities/index.js';
import { UserMapper } from './mappers/user.mapper.js';
import { PrismaClient } from '../../../../../generated/prisma/client.js';
import { Email } from '../../../domain/value-objects/email.vo.js';
import { BaseRepository } from '../../../../../infrastructure/database/base.repository.js';

/**
 * Marks this repository as injectable by the DI container.
 *
 * The class implements IUserRepository, so the application can depend
 * on the repository interface instead of this concrete class.
 */
@injectable()
export class UserRepository extends BaseRepository implements IUserRepository {
  /**
   * Creates the repository with the shared Prisma client.
   */
  constructor(
    @inject(InfrastructureTokens.PrismaClient)
    prisma: PrismaClient,
  ) {
    /**
     * Give the Prisma client to BaseRepository.
     */
    super(prisma);
  }

  /**
   * Creates a new user in the database.
   */
  async create(user: User): Promise<User> {
    /**
     * Convert the domain User entity into persistence data.
     */
    const data = UserMapper.toPersistence(user);

    /**
     * Insert the user into the database.
     */
    const createdUser = await this.execute(() =>
      this.prisma.user.create({
        data: {
          id: data.id,

          /**
           * Email and password hash are value objects in the domain.
           * Their primitive values are extracted before persistence.
           */
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

    /**
     * Convert the database record back into a domain User entity.
     */
    return UserMapper.toDomain(createdUser);
  }

  /**
   * Finds a user by their unique ID.
   *
   * Returns null when the user does not exist.
   */
  async findById(id: string): Promise<User | null> {
    const user = await this.execute(() =>
      this.prisma.user.findUnique({
        where: {
          id,
        },
      }),
    );

    /**
     * No user was found.
     */
    if (!user) {
      return null;
    }

    /**
     * Convert the Prisma record into a domain entity.
     */
    return UserMapper.toDomain(user);
  }

  /**
   * Finds a user by their email address.
   *
   * The Email value object is converted into its string value
   * before querying the database.
   */
  async findByEmail(email: Email): Promise<User | null> {
    const user = await this.execute(() =>
      this.prisma.user.findUnique({
        where: {
          email: email.getValue(),
        },
      }),
    );

    /**
     * Return null when no matching email exists.
     */
    if (!user) {
      return null;
    }

    /**
     * Convert the Prisma record into a domain User entity.
     */
    return UserMapper.toDomain(user);
  }

  /**
   * Checks whether a user with the given email exists.
   *
   * This method returns a boolean instead of the complete user entity.
   */
  async existsByEmail(email: Email): Promise<boolean> {
    const user = await this.execute(() =>
      this.prisma.user.findUnique({
        where: {
          email: email.getValue(),
        },
      }),
    );

    /**
     * A non-null record means that the email is already registered.
     */
    return user !== null;
  }

  /**
   * Updates an existing user.
   *
   * The user's ID is used to identify the record to update.
   */
  async update(user: User): Promise<User> {
    /**
     * Convert the domain entity into persistence data.
     */
    const data = UserMapper.toPersistence(user);

    const updatedUser = await this.execute(() =>
      this.prisma.user.update({
        where: {
          id: user.getId(),
        },

        /**
         * Update the mutable user fields.
         *
         * The ID and creation timestamp are not changed.
         */
        data: {
          email: data.email.getValue(),
          passwordHash: data.passwordHash.getValue(),
          roles: data.roles,
          status: data.status,
          emailVerified: data.emailVerified,
        },
      }),
    );

    /**
     * Convert the updated Prisma record into a domain entity.
     */
    return UserMapper.toDomain(updatedUser);
  }
}
