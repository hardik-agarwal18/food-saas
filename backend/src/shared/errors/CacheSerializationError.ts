import { AppError } from './AppError.js';

/**
 * Represents a failure while converting cache data between
 * JavaScript values and serialized Redis values.
 *
 * This error can occur when:
 *
 * - JSON.stringify() fails.
 * - JSON.parse() receives invalid JSON.
 * - Cached data has an unexpected format.
 * - A value cannot be converted into a cache-safe representation.
 *
 * The original cause can optionally be stored to help with debugging.
 */
export class CacheSerializationError extends AppError {
  constructor(message: string, cause?: unknown) {
    super(
      // The current implementation replaces the supplied message
      // with the default message.
      (message = 'Cache serialization/deserialization failed'),
      // Cache serialization failures are currently treated as
      // internal server errors.
      500,

      'CACHE_SERIALIZATION_ERROR',
    );

    // Preserve the original error or value that caused the failure.
    //
    // This can be useful when logging the error, although the cause
    // should not normally be exposed directly to API clients.
    this.cause = cause;
  }
}
