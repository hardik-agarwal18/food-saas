/**
 * Database transaction helper.
 *
 * This file provides a shared function for executing multiple
 * database operations inside one Prisma transaction.
 *
 * Why transactions are needed:
 * A transaction groups multiple database operations into one unit.
 *
 * If every operation succeeds:
 * - The transaction is committed.
 *
 * If one operation fails:
 * - The transaction is rolled back.
 *
 * This helps preserve database consistency.
 */

import { Prisma } from '../../generated/prisma/client.js';
import { prisma } from './prisma.js';

/**
 * Executes an operation inside a Prisma transaction.
 *
 * @param operation - Function that receives the transaction client
 * @returns The value returned by the operation
 *
 * Example:
 *
 * await withTransaction(async (tx) => {
 *   await tx.user.create(...);
 *   await tx.refreshSession.create(...);
 * });
 *
 * Both operations succeed together or are rolled back together.
 */
export const withTransaction = async <T>(
  operation: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> => {
  /**
   * Prisma manages the transaction lifecycle.
   *
   * The callback receives a transaction-specific client.
   */
  return prisma.$transaction(async (tx) => {
    /**
     * Pass the transaction client to the caller's operation.
     */
    return operation(tx);
  });
};
