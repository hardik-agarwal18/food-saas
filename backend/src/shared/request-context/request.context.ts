import { AsyncLocalStorage } from 'node:async_hooks';
import { RequestContext } from './request-context.interface.js';

/**
 * Stores and retrieves request-specific information.
 *
 * AsyncLocalStorage allows request context to remain available
 * across asynchronous operations such as:
 *
 * - Database queries
 * - Redis calls
 * - Service-to-service method calls
 * - Promise chains
 * - Timers and other asynchronous callbacks
 *
 * This avoids passing requestId, correlationId, and userId manually
 * through every method in the application.
 */
export class RequestContextStore {
  /**
   * Node.js storage mechanism used to keep a separate context
   * for each asynchronous execution chain.
   *
   * Each request receives its own RequestContext object.
   */
  private readonly storage = new AsyncLocalStorage<RequestContext>();

  /**
   * Creates a new request context and executes a callback inside it.
   *
   * Any asynchronous work started within the callback can access
   * the same context through get(), getorThrow(), or has().
   *
   * @param context - Request information to store.
   * @param callback - Function that should execute inside the context.
   * @returns The value returned by the callback.
   */
  run<T>(context: RequestContext, callback: () => T): T {
    // AsyncLocalStorage.run() makes the supplied context available
    // to the callback and its asynchronous descendants.
    return this.storage.run(context, callback);
  }

  /**
   * Returns the current request context, if one exists.
   *
   * This method is useful when the caller can safely operate
   * without a request context.
   *
   * Example:
   *
   * const context = requestContextStore.get();
   *
   * if (context) {
   *   logger.info('Request information available', context);
   * }
   *
   * @returns The current context or undefined when no context exists.
   */
  get(): RequestContext | undefined {
    return this.storage.getStore();
  }

  /**
   * Returns the current request context.
   *
   * Unlike get(), this method throws when called outside
   * a request context.
   *
   * Use this method when the operation cannot work correctly
   * without request information.
   *
   * @throws Error when RequestContextMiddleware has not created
   * a context for the current execution.
   */
  getorThrow(): RequestContext {
    const context = this.storage.getStore();

    // A missing context usually means this method was called:
    //
    // - Outside an HTTP request.
    // - Before the request-context middleware ran.
    // - From a background task that does not create a context.
    if (!context) {
      throw new Error('Request is unavailable. Ensure RequestContextMiddleware is registered.');
    }

    return context;
  }

  /**
   * Checks whether a request context currently exists.
   *
   * This is useful for code that can run both:
   *
   * - Inside an HTTP request.
   * - Outside an HTTP request, such as a scheduled job or startup task.
   *
   * @returns true when a context exists, otherwise false.
   */
  has(): boolean {
    return this.storage.getStore() !== undefined;
  }

  /**
   * Updates the current request context.
   *
   * This is particularly useful after authentication, when the
   * userId is not known at the beginning of the request.
   *
   * Example:
   *
   * requestContextStore.set({
   *   userId: authenticatedUser.id,
   * });
   *
   * @param values - Context properties that should be updated.
   * @throws Error when no request context exists.
   */
  set(values: Partial<RequestContext>): void {
    // getorThrow() ensures that updates are not silently ignored
    // when the method is called outside a request.
    const context = this.getorThrow();

    // Object.assign mutates the existing context object.
    // This keeps the same context reference available to all
    // asynchronous operations belonging to the request.
    Object.assign(context, values);
  }

  /**
   * Disables the underlying AsyncLocalStorage instance.
   *
   * This is intended for application shutdown rather than normal
   * request processing.
   *
   * Disabling the store releases its internal references and prevents
   * future context access from working normally.
   */
  disable(): void {
    this.storage.disable();
  }
}

/**
 * Shared application-wide request context store.
 *
 * Because this is a singleton, middleware, services, loggers,
 * and error handlers can all access the same current request context.
 */
export const requestContextStore = new RequestContextStore();
