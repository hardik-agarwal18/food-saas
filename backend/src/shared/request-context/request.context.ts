import { AsyncLocalStorage } from 'node:async_hooks';
import { RequestContext } from './request-context.interface.js';

export class RequestContextStore {
  private readonly storage = new AsyncLocalStorage<RequestContext>();

  /**
   * Creates a new request context and executes the callback.
   */
  run<T>(context: RequestContext, callback: () => T): T {
    return this.storage.run(context, callback);
  }

  /**
   *   Returns the current request context
   */
  get(): RequestContext | undefined {
    return this.storage.getStore();
  }

  /**
   *   Returns the current request context or throw if none exists
   */
  getorThrow(): RequestContext {
    const context = this.storage.getStore();

    if (!context) {
      throw new Error('Request is unavailable. Ensure RequestContextMiddleware is registered.');
    }

    return context;
  }

  /**
   * Returns true if a request context currently exists.
   */
  has(): boolean {
    return this.storage.getStore() !== undefined;
  }

  /**
   * Updates the current request context.
   * Useful after authentication when the userId becomes known.
   */
  set(values: Partial<RequestContext>): void {
    const context = this.getorThrow();

    Object.assign(context, values);
  }

  /**
   * Disables the AsyncLocalStorage instance.
   * Intended only during graceful application shutdown.
   */
  disable(): void {
    this.storage.disable();
  }
}

export const requestContextStore = new RequestContextStore();
