/**
 * Database error translation.
 *
 * This file converts Prisma-specific database errors into
 * application-level errors.
 *
 * Why this exists:
 * Prisma error classes and error codes belong to the infrastructure
 * layer. Controllers and application services should not need to
 * understand Prisma-specific error codes.
 *
 * Example:
 *
 * Prisma error:
 * P2002
 *
 * Application error:
 * ConflictError
 *
 * This keeps the rest of the application independent from Prisma.
 */

import { Prisma } from '../../generated/prisma/client.js';

import { ConflictError } from '../../shared/errors/ConflictError.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { ServiceUnavailableError } from '../../shared/errors/ServiceUnavailableError.js';

/**
 * Translates a Prisma database error into an application error.
 *
 * @param error - The unknown error thrown by Prisma
 * @throws An application-level error for known Prisma errors
 * @throws The original error for unknown errors
 */
export const translateDatabaseError = (error: unknown): never => {
  /**
   * If the error is not a known Prisma request error, preserve it.
   *
   * This prevents the translator from incorrectly converting
   * unrelated errors.
   */
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    throw error;
  }

  /**
   * Convert Prisma error codes into application-level errors.
   */
  switch (error.code) {
    /**
     * P2002:
     * A unique constraint was violated.
     *
     * Example:
     * Creating a user with an email that already exists.
     */
    case 'P2002':
      throw new ConflictError('Resource already exists');

    /**
     * P2025:
     * The requested record was not found.
     */
    case 'P2025':
      throw new NotFoundError('Requested resource not found');

    /**
     * P2003:
     * A foreign-key constraint was violated.
     */
    case 'P2003':
      throw new ConflictError('Operation violates a database constraint');

    /**
     * P2024:
     * Prisma could not obtain a database connection within
     * the configured timeout.
     */
    case 'P2024':
      throw new ServiceUnavailableError('Database is currently unavailable.');

    /**
     * Preserve unknown Prisma error codes.
     *
     * The caller can then handle or log the original error.
     */
    default:
      throw error;
  }
};
