import type { PrismaClient } from '../../generated/prisma/client.js';
import type { Prisma } from '../../generated/prisma/client.js';

/**
 * PrismaExecutor represents the Prisma client or a transaction client.
 *
 * This type is used to provide a consistent interface for database operations,
 * regardless of whether a full Prisma client or a transaction client is being used.
 */
export type PrismaExecutor = PrismaClient | Prisma.TransactionClient;
