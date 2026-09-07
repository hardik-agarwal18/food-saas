/**
 * Base class for all application-specific errors.
 *
 * Instead of throwing plain Error objects everywhere, the application
 * uses AppError as a common structure for expected failures.
 *
 * Every AppError contains:
 *
 * - message: Human-readable error message.
 * - statusCode: HTTP status code that should be returned to the client.
 * - code: Stable machine-readable error code used by frontend clients
 *   and logging systems.
 * - isOperational: Indicates whether the error is an expected,
 *   handled application failure.
 *
 * Example:
 *
 * throw new AppError(
 *   'Restaurant not found',
 *   404,
 *   'RESTAURANT_NOT_FOUND',
 *   true,
 * );
 */
export class AppError extends Error {
  constructor(
    message: string,

    /**
     * HTTP status code associated with this error.
     *
     * Examples:
     * - 400 for invalid input
     * - 401 for unauthenticated requests
     * - 403 for unauthorized requests
     * - 404 for missing resources
     * - 500 for unexpected server failures
     */
    public readonly statusCode: number,

    /**
     * Stable application-specific error code.
     *
     * This should be used by clients instead of matching
     * human-readable error messages.
     */
    public readonly code: string,

    /**
     * Indicates whether this error is an expected operational error.
     *
     * Operational errors are usually safe to expose to the client.
     * Unexpected programming errors should generally be treated
     * as non-operational errors.
     */
    public readonly isOperational?: boolean,
  ) {
    // Call the native Error constructor so that the error message
    // is correctly assigned.
    super(message);

    // Use the actual child class name as the error name.
    //
    // For example:
    // new NotFoundError(...) -> "NotFoundError"
    // new ValidationError(...) -> "ValidationError"
    this.name = this.constructor.name;

    // It ensures that the error object correctly inherits from the Error class.
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture the stack trace while excluding the constructor itself.
    // This makes debugging easier because the stack starts at the
    // location where the application error was created.
    Error.captureStackTrace(this, this.constructor);
  }
}
