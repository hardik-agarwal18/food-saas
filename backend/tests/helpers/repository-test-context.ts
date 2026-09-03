import { getPrismaClient } from './test.database';
import { UserRepository } from '../../src/modules/identity/infrastructure/persistence/prisma/user.repository';
import { RefreshSessionRepository } from '../../src/modules/identity/infrastructure/persistence/prisma/refresh-session.repository';

/**
 * Creates the shared dependencies required by repository integration tests.
 *
 * Both repositories use the same Prisma client, allowing repository calls and
 * direct database assertions to operate on the same test database connection.
 */
export const createRepositoryTestContext = () => {
  const prisma = getPrismaClient();

  const userRepository = new UserRepository(prisma);
  const refreshSessionRepository = new RefreshSessionRepository(prisma);

  return {
    prisma,
    userRepository,
    refreshSessionRepository,
  };
};
