import { PrismaClient } from '../../src/generated/prisma/client.js';

import { Role, UserStatus } from '../../src/modules/identity/domain/enums/index.js';

import { Email, PasswordHash } from '../../src/modules/identity/domain/value-objects/index.js';

import { User } from '../../src/modules/identity/domain/entities/index.js';

/**
 * Configuration options for creating a test user.
 * Any omitted fields will be populated with sensible defaults, including
 * cryptographically unique emails to prevent constraint violations.
 */
export type CreateTestUserOptions = Partial<{
  id: string;
  email: string;
  passwordHash: string;
  roles: Role[];
  status: UserStatus;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}>;

/**
 * Constructs an in-memory User domain entity populated with test data.
 * 
 * Use this factory when you need a domain model for tests but do not need 
 * it to be saved to the PostgreSQL database (e.g., unit testing domain logic).
 */
export const buildTestUser = (overrides: CreateTestUserOptions = {}): User => {
  return new User({
    id: overrides.id ?? crypto.randomUUID(),
    email: Email.create(overrides.email ?? `test-user-${crypto.randomUUID()}@example.com`),
    passwordHash: PasswordHash.create(
      overrides.passwordHash ?? '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    ),
    roles: overrides.roles ?? [Role.CUSTOMER],
    status: overrides.status ?? UserStatus.ACTIVE,
    emailVerified: overrides.emailVerified ?? false,
    createdAt: overrides.createdAt ?? new Date(),
    updatedAt: overrides.updatedAt ?? new Date(),
  });
};

/**
 * Constructs a User domain entity and persists it to the test database.
 * 
 * Use this factory in integration tests where the User record needs to exist 
 * in PostgreSQL (e.g., repository testing, satisfying foreign key constraints).
 */
export const createTestUser = async (
  prisma: PrismaClient,
  overrides: CreateTestUserOptions = {},
): Promise<User> => {
  const user = buildTestUser(overrides);

  await prisma.user.create({
    data: {
      id: user.getId(),
      email: user.getEmail().getValue(),
      passwordHash: user.getPasswordHash().getValue(),
      roles: user.getRoles(),
      status: user.getStatus(),
      emailVerified: user.isEmailVerified(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    },
  });

  return user;
};
