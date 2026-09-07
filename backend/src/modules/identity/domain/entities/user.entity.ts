import { Role, UserStatus } from '../enums/index.js';
import {
  DuplicateRoleError,
  EmailAlreadyVerifiedError,
  RoleNotAssignedError,
} from '../errors/index.js';
import { Email, PasswordHash } from '../value-objects/index.js';

/**
 * Domain entity representing a user.
 *
 * The entity owns user-related business rules such as:
 * - Assigning and removing roles
 * - Verifying an email
 * - Changing a password
 * - Activating, deactivating, or suspending an account
 */
export class User {
  /**
   * Unique user identifier.
   *
   * It cannot be changed after construction.
   */
  private readonly id: string;

  /**
   * User's email represented by a domain value object.
   */
  private email: Email;

  /**
   * User's password hash represented by a domain value object.
   */
  private passwordHash: PasswordHash;

  /**
   * Set of roles assigned to the user.
   *
   * A Set prevents the same role from being stored twice.
   */
  private readonly roles: Set<Role>;

  /**
   * Current account status.
   */
  private status: UserStatus;

  /**
   * Indicates whether the user's email has been verified.
   */
  private emailVerified: boolean;

  /**
   * Timestamp when the user was created.
   */
  private readonly createdAt: Date;

  /**
   * Timestamp when the user was last modified.
   */
  private updatedAt: Date;

  /**
   * Creates a User entity.
   *
   * The constructor receives value objects and domain types rather than
   * raw strings, which keeps business rules inside the domain layer.
   */
  constructor(params: {
    id: string;
    email: Email;
    passwordHash: PasswordHash;
    roles?: Iterable<Role>;
    status: UserStatus;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = params.id;
    this.email = params.email;
    this.passwordHash = params.passwordHash;

    /**
     * Use CUSTOMER as the default role when no roles are provided.
     */
    this.roles = new Set(params.roles ?? [Role.CUSTOMER]);

    /**
     * Use ACTIVE as the default status when the value is missing.
     */
    this.status = params.status ?? UserStatus.ACTIVE;

    /**
     * New users are treated as unverified by default.
     */
    this.emailVerified = params.emailVerified ?? false;

    /**
     * Use the current time when timestamps are not provided.
     */
    this.createdAt = params.createdAt ?? new Date();
    this.updatedAt = params.updatedAt ?? new Date();
  }

  /**
   * Creates a new user.
   *
   * The constructor receives value objects and domain types rather than
   * raw strings, which keeps business rules inside the domain layer.
   */
  public static create(params: { email: Email; passwordHash: PasswordHash }): User {
    const now = new Date();

    return new User({
      id: crypto.randomUUID(),
      email: params.email,
      passwordHash: params.passwordHash,
      roles: [Role.CUSTOMER],
      status: UserStatus.ACTIVE,
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static rehydrate(params: {
    id: string;
    email: Email;
    passwordHash: PasswordHash;
    roles: Iterable<Role>;
    status: UserStatus;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(params);
  }

  /**
   * Returns the user's unique ID.
   */
  public getId(): string {
    return this.id;
  }

  /**
   * Returns the user's email value object.
   */
  public getEmail(): Email {
    return this.email;
  }

  /**
   * Returns the user's password-hash value object.
   */
  public getPasswordHash(): PasswordHash {
    return this.passwordHash;
  }

  /**
   * Returns a new array containing the user's roles.
   *
   * Returning a copy prevents callers from directly modifying
   * the internal Set.
   */
  public getRoles(): Role[] {
    return [...this.roles];
  }

  /**
   * Returns the user's current account status.
   */
  public getStatus(): UserStatus {
    return this.status;
  }

  /**
   * Returns whether the user's email has been verified.
   */
  public isEmailVerified(): boolean {
    return this.emailVerified;
  }

  /**
   * Returns the user creation timestamp.
   */
  public getCreatedAt(): Date {
    return this.createdAt;
  }

  /**
   * Returns the last modification timestamp.
   */
  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  /**
   * Changes the user's password hash.
   *
   * The caller is expected to provide an already-created PasswordHash
   * value object.
   */
  public changePassword(passwordHash: PasswordHash) {
    this.passwordHash = passwordHash;

    /**
     * Update the modification timestamp.
     */
    this.touch();
  }

  /**
   * Assigns a role to the user.
   *
   * A DuplicateRoleError is thrown if the user already has that role.
   */
  public assignRole(role: Role): void {
    if (this.roles.has(role)) {
      throw new DuplicateRoleError(role);
    }

    this.roles.add(role);

    /**
     * Record that the user was modified.
     */
    this.touch();
  }

  /**
   * Removes a role from the user.
   *
   * A RoleNotAssignedError is thrown if the user does not have
   * the requested role.
   */
  public removeRole(role: Role): void {
    if (!this.roles.has(role)) {
      throw new RoleNotAssignedError(role);
    }

    this.roles.delete(role);

    /**
     * Record that the user was modified.
     */
    this.touch();
  }

  /**
   * Checks whether the user has a specific role.
   */
  public hasRole(role: Role): boolean {
    return this.roles.has(role);
  }

  /**
   * Verifies the user's email address.
   *
   * An already-verified email cannot be verified again.
   */
  public verifyEmail(): void {
    if (this.emailVerified) {
      throw new EmailAlreadyVerifiedError();
    }

    this.emailVerified = true;

    /**
     * Record that the user was modified.
     */
    this.touch();
  }

  /**
   * Activates the user account.
   */
  public activate(): void {
    this.status = UserStatus.ACTIVE;

    /**
     * Record that the user was modified.
     */
    this.touch();
  }

  /**
   * Deactivates the user account.
   */
  public deactivate(): void {
    this.status = UserStatus.INACTIVE;

    /**
     * Record that the user was modified.
     */
    this.touch();
  }

  /**
   * Suspends the user account.
   */
  public suspend(): void {
    this.status = UserStatus.SUSPENDED;

    /**
     * Record that the user was modified.
     */
    this.touch();
  }

  /**
   * Updates the last-modified timestamp.
   */
  private touch(): void {
    this.updatedAt = new Date();
  }
}
