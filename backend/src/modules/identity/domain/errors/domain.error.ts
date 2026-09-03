/**
 * Base error class for all domain-level errors.
 *
 * Domain errors represent business-rule violations, such as:
 * - An invalid email
 * - A duplicate role
 * - An expired refresh session
 *
 * Other domain error classes should extend this class.
 */
export abstract class DomainError extends Error {
  /**
   * Creates a domain error with the provided message.
   *
   * The constructor is protected so that this base class cannot
   * be instantiated directly. Only child error classes can use it.
   */
  protected constructor(message: string) {
    /**
     * Pass the message to JavaScript's built-in Error class.
     */
    super(message);

    /**
     * Set the error name to the actual child class name.
     *
     * For example:
     * new InvalidEmailError(...) will have name "InvalidEmailError".
     */
    this.name = new.target.name;

    /**
     * Restore the correct prototype chain.
     *
     * This helps instanceof checks work correctly when extending
     * built-in classes such as Error.
     */
    Object.setPrototypeOf(this, new.target.prototype);

    /**
     * Capture the stack trace while excluding this constructor
     * from the beginning of the stack trace.
     *
     * Optional chaining keeps this compatible with environments
     * where captureStackTrace is unavailable.
     */
    Error.captureStackTrace?.(this, new.target);
  }
}
