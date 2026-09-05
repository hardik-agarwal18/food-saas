/**
 * Base repository.
 *
 * This abstract class contains shared functionality for repositories
 * that use Prisma.
 *
 * Responsibilities:
 * - Store the Prisma client
 * - Execute database operations
 * - Translate Prisma errors into application errors
 * - Execute operations using a transaction client
 *
 * Why this exists:
 * Multiple repositories need the same error-handling behavior.
 * Instead of repeating try/catch logic in every repository,
 * concrete repositories can extend this class.
 *
 * Example:
 *
 * UserRepository extends BaseRepository
 * RefreshSessionRepository extends BaseRepository
 */

import { Prisma } from '../../generated/prisma/client.js';

import { translateDatabaseError } from './error.js';
import type { PrismaExecutor } from './prisma-client.type.js';

/**
 * Shared base class for Prisma repositories.
 *
 * The class is abstract because it is not intended to be instantiated
 * directly. Concrete repositories should extend it.
 */
export abstract class BaseRepository {
  /**
   * Store the Prisma client for use by child repositories.
   *
   * `protected` means child classes can access the property,
   * but external callers cannot access it directly.
   *
   * `readonly` means the repository cannot replace the Prisma client
   * after construction.
   */
  protected constructor(protected readonly prisma: PrismaExecutor) {}

  /**
   * Executes a normal database operation.
   *
   * Any known Prisma database error is translated into an
   * application-level error.
   *
   * @param operation - Function containing the database operation
   * @returns The result returned by the operation
   * @throws A translated application error or the original error
   */
  protected async execute<T>(operation: () => Promise<T>): Promise<T> {
    try {
      /**
       * Execute and return the database operation's result.
       */
      return await operation();
    } catch (error) {
      /**
       * Convert Prisma-specific errors into application errors.
       */
      throw translateDatabaseError(error);
    }
  }

  /**
   * Executes a database operation inside a transaction.
   *
   * @param tx - Prisma transaction client
   * @param operation - Function that receives the transaction client
   * @returns The result returned by the operation
   * @throws A translated application error or the original error
   */
  protected async executeTransaction<T>(
    tx: Prisma.TransactionClient,
    operation: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    try {
      /**
       * Execute the operation using the transaction client.
       *
       * The operation must use `tx` rather than the normal Prisma
       * client if it is intended to participate in the transaction.
       */
      return await operation(tx);
    } catch (error) {
      /**
       * Translate any database error raised inside the transaction.
       */
      throw translateDatabaseError(error);
    }
  }
}
