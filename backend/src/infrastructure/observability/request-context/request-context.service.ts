import { injectable } from 'tsyringe';
import { RequestContext } from '../../../shared/request-context/request-context.interface.js';
import { requestContextStore } from '../../../shared/request-context/request.context.js';

@injectable()
export class RequestContextService {
  /**
   * Creates a new request context and executes the callback.
   */
  run<T>(context: RequestContext, callback: () => T): T {
    return requestContextStore.run(context, callback);
  }

  /**
   *   Returns the current request context
   */
  get(): RequestContext | undefined {
    return requestContextStore.get();
  }

  /**
   *   Returns the current request context or throw if none exists
   */
  getorThrow(): RequestContext {
    return requestContextStore.getorThrow();
  }

  /**
   * Returns true if a request context currently exists.
   */
  has(): boolean {
    return requestContextStore.has();
  }

  /**
   * Updates the current request context.
   * Useful after authentication when the userId becomes known.
   */
  set(values: Partial<RequestContext>): void {
    requestContextStore.set(values);
  }

  /**
   * Disables the AsyncLocalStorage instance.
   * Intended only during graceful application shutdown.
   */
  disable(): void {
    requestContextStore.disable();
  }
}
