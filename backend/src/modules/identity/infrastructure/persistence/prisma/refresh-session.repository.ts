import { injectable, inject } from 'tsyringe';
import { IRefreshSessionRepository } from '../../../domain/repositories/index.js';
import { InfrastructureTokens } from '../../../../../infrastructure/container/index.js';
import { PrismaClient } from '../../../../../generated/prisma/client.js';
import { RefreshSession } from '../../../domain/entities/index.js';
import { RefreshSessionMapper } from './mappers/refresh-session.mapper.js';
import { BaseRepository } from '../../../../../infrastructure/database/base.repository.js';

/**
 * Marks this class as available for dependency injection.
 */
@injectable()
export class RefreshSessionRepository extends BaseRepository implements IRefreshSessionRepository {
  /**
   * Creates the repository with the shared Prisma client.
   *
   * The Prisma client is injected using the infrastructure token.
   * This keeps the repository independent from the way Prisma is created.
   */
  constructor(
    @inject(InfrastructureTokens.PrismaClient)
    prisma: PrismaClient,
  ) {
    /**
     * Pass the injected Prisma client to BaseRepository.
     *
     * BaseRepository stores the client and provides shared database
     * execution/error-handling functionality.
     */
    super(prisma);
  }

  /**
   * Creates a new refresh-session record in the database.
   *
   * The domain entity is first converted into a persistence object
   * using RefreshSessionMapper.
   */
  async create(refreshSession: RefreshSession): Promise<RefreshSession> {
    /**
     * Convert the domain entity into database-compatible data.
     */
    const data = RefreshSessionMapper.toPersistence(refreshSession);

    /**
     * Execute the database operation through BaseRepository.
     */
    const createdRefreshSession = await this.execute(() =>
      this.prisma.refreshSession.create({
        data: {
          id: data.id,
          userId: data.userId,
          tokenHash: data.tokenHash,
          expiresAt: data.expiresAt,
          lastUsedAt: data.lastUsedAt,
          revokedAt: data.revokedAt,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        },
      }),
    );

    /**
     * Convert the Prisma record back into a domain entity.
     */
    return RefreshSessionMapper.toDomain(createdRefreshSession);
  }

  /**
   * Finds a refresh session using its database ID.
   *
   * Returns null when no matching session exists.
   */
  async findById(id: string): Promise<RefreshSession | null> {
    const refreshSession = await this.execute(() =>
      this.prisma.refreshSession.findUnique({
        where: {
          id,
        },
      }),
    );

    /**
     * No matching record was found.
     */
    if (!refreshSession) {
      return null;
    }

    /**
     * Convert the database record into a domain entity.
     */
    return RefreshSessionMapper.toDomain(refreshSession);
  }

  /**
   * Finds a refresh session using the hashed refresh token.
   *
   * The raw refresh token should not be stored in the database.
   * The repository searches using the stored hash instead.
   */
  async findByTokenHash(tokenHash: string): Promise<RefreshSession | null> {
    const refreshSession = await this.execute(() =>
      this.prisma.refreshSession.findUnique({
        where: {
          tokenHash,
        },
      }),
    );

    /**
     * Return null when the token hash does not match any session.
     */
    if (!refreshSession) {
      return null;
    }

    /**
     * Convert the Prisma record into a domain entity.
     */
    return RefreshSessionMapper.toDomain(refreshSession);
  }

  /**
   * Finds all refresh sessions belonging to a specific user.
   *
   * Sessions are returned from newest to oldest based on createdAt.
   */
  async findByUserId(userId: string): Promise<RefreshSession[]> {
    const refreshSessions = await this.execute(() =>
      this.prisma.refreshSession.findMany({
        where: {
          userId,
        },

        /**
         * Show the most recently created sessions first.
         */
        orderBy: {
          createdAt: 'desc',
        },
      }),
    );

    /**
     * Convert every Prisma record into a domain entity.
     */
    return refreshSessions.map(RefreshSessionMapper.toDomain);
  }

  /**
   * Updates an existing refresh session.
   *
   * Only the fields returned by toUpdatePersistence are updated.
   */
  async update(refreshSession: RefreshSession): Promise<RefreshSession> {
    /**
     * Convert the domain entity into update-specific persistence data.
     */
    const data = RefreshSessionMapper.toUpdatePersistence(refreshSession);

    const updatedRefreshSession = await this.execute(() =>
      this.prisma.refreshSession.update({
        where: {
          id: refreshSession.getId(),
        },

        /**
         * Update the selected mutable fields.
         */
        data,
      }),
    );

    /**
     * Convert the updated database record back into a domain entity.
     */
    return RefreshSessionMapper.toDomain(updatedRefreshSession);
  }

  /**
   * Revokes a refresh session.
   *
   * Revocation is represented by setting revokedAt to a date.
   * The session is not deleted, which preserves audit information.
   */
  async revoke(id: string, revokedAt: Date): Promise<void> {
    await this.execute(() =>
      this.prisma.refreshSession.update({
        where: {
          id,
        },

        /**
         * Mark the session as revoked.
         */
        data: {
          revokedAt,
        },
      }),
    );
  }
}
