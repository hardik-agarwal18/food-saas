/**
 * Information associated with the currently executing request.
 *
 * RequestContext contains identifiers that allow the application
 * to connect logs, errors, and service operations to the same request.
 *
 * The context is stored using AsyncLocalStorage, so services can access
 * the current request information without receiving the Express request
 * object as a parameter everywhere.
 */
export interface RequestContext {
  /**
   * Unique identifier for the current HTTP request.
   *
   * This is useful for finding every log entry generated
   * during one request.
   */
  requestId: string;

  /**
   * Identifier used to correlate the request across services
   * or different application components.
   *
   * In a distributed system, multiple internal operations
   * may share the same correlationId.
   */
  correlationId: string;

  /**
   * Optional identifier of the authenticated user.
   *
   * It may be unavailable at the beginning of the request
   * and populated later after authentication succeeds.
   */
  userId?: string;
}
