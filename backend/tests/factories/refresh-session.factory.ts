import { PrismaClient } from '../../src/generated/prisma/client.js';

import { RefreshSession } from '../../src/modules/identity/domain/entities/index.js';

/**
 * Configuration options for creating a test refresh session.
 * Allows overriding default properties such as token hashes or expiration dates
 * for specific test scenarios.
 */
export type CreateTestRefreshSessionOptions = Partial<{
  id: string;
  familyId: string;
  tokenHash: string;
  expiresAt: Date;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
  ipAddress: string | null;
  userAgent: string | null;
  replacedBySessionId: string | null;
}>;

/**
 * Constructs an in-memory RefreshSession domain entity.
 *
 * This is useful for unit testing logic that requires a session entity
 * without the overhead of hitting the database.
 *
 * @param userId - The ID of the User that owns this session.
 * @param overrides - Optional overrides for session properties.
 */
export const buildTestRefreshSession = (
  userId: string,
  overrides: CreateTestRefreshSessionOptions = {},
): RefreshSession => {
  const session = RefreshSession.create(
    {
      userId,

      familyId: overrides.familyId ?? crypto.randomUUID(),

      tokenHash: overrides.tokenHash ?? `test-token-hash-${crypto.randomUUID()}`,

      expiresAt: overrides.expiresAt ?? new Date(Date.now() + 1000 * 60 * 60),

      ipAddress: overrides.ipAddress ?? '127.0.0.1',

      userAgent: overrides.userAgent ?? 'vitest',

      replacedBySessionId: overrides.replacedBySessionId ?? null,
    },

    overrides.id ?? crypto.randomUUID(),
  );

  /*
   * RefreshSession.create() normally starts
   * with lastUsedAt/revokedAt as null.
   *
   * If you need these values in a factory,
   * mutate the domain entity through its
   * domain methods rather than bypassing them.
   */

  if (overrides.lastUsedAt) {
    session.markAsUsed(overrides.lastUsedAt);
  }

  if (overrides.revokedAt) {
    session.revoke(overrides.revokedAt);
  }

  return session;
};

/**
 * Creates and persists a RefreshSession directly in PostgreSQL.
 *
 * This factory is typically used in repository or integration tests
 * to quickly seed the database with required state.
 *
 * Note: The referenced User (userId) must already exist in the database
 * to satisfy foreign key constraints.
 *
 * @param prisma - The PrismaClient instance connected to the test database.
 * @param userId - The ID of the User that owns this session.
 * @param overrides - Optional overrides for session properties.
 */
export const createTestRefreshSession = async (
  prisma: PrismaClient,
  userId: string,
  overrides: CreateTestRefreshSessionOptions = {},
): Promise<RefreshSession> => {
  const session = buildTestRefreshSession(userId, overrides);

  await prisma.refreshSession.create({
    data: {
      id: session.getId(),

      userId: session.getUserId(),

      familyId: session.getFamilyId(),

      tokenHash: session.getTokenHash(),

      expiresAt: session.getExpiresAt(),

      lastUsedAt: session.getLastUsedAt(),

      revokedAt: session.getRevokedAt(),

      ipAddress: session.getIpAddress(),

      userAgent: session.getUserAgent(),

      replaceBySessionId: session.getReplacedBySessionId(),

      createdAt: session.getCreatedAt(),

      updatedAt: session.getUpdatedAt(),
    },
  });

  return session;
};
