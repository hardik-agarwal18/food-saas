import { RefreshSession as PrismaRefreshSession } from '../../../../../../generated/prisma/client.js';
import { RefreshSession } from '../../../../domain/entities/index.js';

/**
 * Converts refresh-session data between the domain and persistence layers.
 */
export class RefreshSessionMapper {
  /**
   * Converts a Prisma refresh-session record into a domain entity.
   *
   * This is used after reading data from the database.
   */
  public static toDomain(prismaRefreshSession: PrismaRefreshSession): RefreshSession {
    return RefreshSession.reconstitute(prismaRefreshSession.id, {
      userId: prismaRefreshSession.userId,
      tokenHash: prismaRefreshSession.tokenHash,
      expiresAt: prismaRefreshSession.expiresAt,
      lastUsedAt: prismaRefreshSession.lastUsedAt,
      revokedAt: prismaRefreshSession.revokedAt,
      ipAddress: prismaRefreshSession.ipAddress,
      userAgent: prismaRefreshSession.userAgent,
      createdAt: prismaRefreshSession.createdAt,
      updatedAt: prismaRefreshSession.updatedAt,
    });
  }

  /**
   * Converts a domain refresh-session entity into persistence data.
   *
   * This method is used when creating a new database record.
   */
  public static toPersistence(refreshSession: RefreshSession) {
    return {
      id: refreshSession.getId(),
      userId: refreshSession.getUserId(),
      tokenHash: refreshSession.getTokenHash(),
      expiresAt: refreshSession.getExpiresAt(),
      lastUsedAt: refreshSession.getLastUsedAt(),
      revokedAt: refreshSession.getRevokedAt(),
      ipAddress: refreshSession.getIpAddress(),
      userAgent: refreshSession.getUserAgent(),
      createdAt: refreshSession.getCreatedAt(),
      updatedAt: refreshSession.getUpdatedAt(),
    };
  }

  /**
   * Converts a domain refresh-session entity into update data.
   *
   * Immutable fields such as id, userId, and createdAt are intentionally
   * excluded because they should not change during an update.
   */
  public static toUpdatePersistence(refreshSession: RefreshSession) {
    return {
      expiresAt: refreshSession.getExpiresAt(),
      lastUsedAt: refreshSession.getLastUsedAt(),
      revokedAt: refreshSession.getRevokedAt(),
      ipAddress: refreshSession.getIpAddress(),
      userAgent: refreshSession.getUserAgent(),
      updatedAt: refreshSession.getUpdatedAt(),
    };
  }
}
