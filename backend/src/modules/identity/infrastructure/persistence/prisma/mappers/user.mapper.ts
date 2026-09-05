import { User as PrismaUser } from '../../../../../../generated/prisma/client.js';
import { User } from '../../../../domain/entities/index.js';
import { Role, UserStatus } from '../../../../domain/enums/index.js';
import { Email, PasswordHash } from '../../../../domain/value-objects/index.js';

/**
 * Converts user data between the domain layer and Prisma persistence layer.
 */
export class UserMapper {
  /**
   * Converts a Prisma user record into a domain User entity.
   *
   * Database primitive values are reconstructed into domain-specific
   * value objects and enum types.
   */
  public static toDomain(prismaUser: PrismaUser): User {
    return User.rehydrate({
      id: prismaUser.id,

      /**
       * Reconstruct the Email value object.
       */
      email: Email.create(prismaUser.email),

      /**
       * Reconstruct the PasswordHash value object.
       */
      passwordHash: PasswordHash.create(prismaUser.passwordHash),

      /**
       * Convert persisted role values into the domain Role type.
       */
      roles: prismaUser.roles.map((role) => role as Role),

      /**
       * Convert the persisted status into the domain UserStatus type.
       */
      status: prismaUser.status as UserStatus,

      emailVerified: prismaUser.emailVerified,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }

  /**
   * Converts a domain User entity into persistence data.
   *
   * This method is used before creating or updating a database record.
   */
  public static toPersistence(user: User) {
    return {
      id: user.getId(),
      email: user.getEmail(),
      passwordHash: user.getPasswordHash(),
      roles: user.getRoles(),
      status: user.getStatus(),
      emailVerified: user.isEmailVerified(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    };
  }
}
