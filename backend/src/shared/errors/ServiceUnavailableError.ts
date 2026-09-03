import { AppError } from './AppError.js';

/**
 * Represents a temporary failure of a required service.
 *
 * Examples:
 *
 * - Redis is unavailable.
 * - A dependent service cannot be reached.
 * - A database connection is temporarily unavailable.
 *
 * HTTP status:
 * 503 Service Unavailable
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string) {
    // This is an expected operational error because the service
    // may become available again later.
    super(
      // The current implementation replaces the supplied message
      // with the default service-unavailable message.
      (message = 'Service temporarily unavailable'),
      503,
      'SERVICE_UNAVAILABLE',
      true,
    );
  }
}
