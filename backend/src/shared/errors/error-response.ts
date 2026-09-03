/**
 * Describes one validation problem.
 *
 * The path identifies the field or location where the validation
 * failure occurred.
 *
 * Example:
 *
 * {
 *   path: 'email',
 *   message: 'Email must be valid',
 * }
 */
export interface ValidationError {
  path: string;
  message: string;
}

/**
 * Describes the error portion of an API response.
 *
 * The code is intended for programmatic use by clients.
 * The message is intended for humans.
 *
 * Validation errors may additionally contain a list of field-level
 * details.
 */
export interface ErrorDetails {
  /**
   * Stable application-specific error code.
   */
  code: string;

  /**
   * Human-readable error message.
   */
  message: string;

  /**
   * Optional field-level validation errors.
   *
   * This is usually present for a ValidationError and absent
   * for errors such as NotFoundError or ConflictError.
   */
  details?: ValidationError[];
}

/**
 * Standard structure returned when an API request fails.
 *
 * Keeping all error responses in the same shape allows frontend
 * applications and other clients to handle errors consistently.
 *
 * Example:
 *
 * {
 *   success: false,
 *   error: {
 *     code: 'VALIDATION_ERROR',
 *     message: 'Validation failed',
 *     details: [
 *       {
 *         path: 'email',
 *         message: 'Email is invalid',
 *       },
 *     ],
 *   },
 *   requestId: '...',
 *   correlationId: '...',
 *   timestamp: '...',
 * }
 */
export interface ErrorResponse {
  /**
   * Always false for an error response.
   */
  success: false;

  /**
   * Details about the error.
   */
  error: ErrorDetails;

  /**
   * Optional identifier for the current HTTP request.
   *
   * This helps locate the request in application logs.
   */
  requestId?: string;

  /**
   * Optional identifier used to trace a request across
   * multiple services or systems.
   */
  correlationId?: string;

  /**
   * Optional timestamp indicating when the error response
   * was generated.
   */
  timestamp?: string;
}
