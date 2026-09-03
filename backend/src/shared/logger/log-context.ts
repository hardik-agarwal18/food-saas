/**
 * Contextual information attached to log entries.
 *
 * LogContext allows the application to add useful metadata to logs
 * without changing the main log message.
 *
 * Example:
 *
 * logger.info('Restaurant created', {
 *   serviceId: 'food-api',
 *   component: 'RestaurantService',
 *   operation: 'createRestaurant',
 *   requestId: 'request-123',
 *   userId: 'user-456',
 * });
 *
 * This metadata helps developers:
 *
 * - Identify which service produced the log.
 * - Locate the responsible component or module.
 * - Understand which operation was being performed.
 * - Trace a request across multiple services.
 * - Associate an action with a user.
 * - Investigate distributed traces.
 */
export interface LogContext {
  /**
   * Identifies the service that produced the log.
   *
   * This is useful when multiple services send logs
   * to the same logging system.
   */
  serviceId?: string;

  /**
   * Identifies the class, component, or subsystem
   * that produced the log.
   */
  component?: string;

  /**
   * Identifies the application module associated with the log.
   */
  module?: string;

  /**
   * Describes the operation currently being performed.
   *
   * Examples:
   * - createUser
   * - updateOrder
   * - authenticateRequest
   */
  operation?: string;

  /**
   * Identifies the current HTTP request.
   *
   * This allows all logs generated during one request
   * to be found together.
   */
  requestId?: string;

  /**
   * Identifies a request across service boundaries.
   *
   * A correlation ID can remain the same when one request
   * travels through multiple services.
   */
  correlationId?: string;

  /**
   * Identifies the user associated with the operation.
   *
   * Sensitive user information should not be placed here.
   * Prefer a non-sensitive internal user identifier.
   */
  userId?: string;

  /**
   * Identifies the distributed tracing trace.
   *
   * A trace usually represents the complete journey
   * of a request through the system.
   */
  traceId?: string;

  /**
   * Identifies one span inside a distributed trace.
   *
   * A span usually represents one operation within a trace.
   */
  spanId?: string;

  /**
   * Identifies a meaningful event being logged.
   *
   * Examples:
   * - request.started
   * - request.completed
   * - database.query.failed
   */
  event?: string;

  /**
   * Allows additional custom metadata to be attached
   * to a log entry.
   *
   * The index signature makes LogContext extensible without
   * requiring a new interface property for every possible field.
   */
  [key: string]: unknown;
}
