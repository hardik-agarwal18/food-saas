import { DeliveryDomainError } from '../errors/delivery-domain.error.js';
import { Money } from '../../../menu/domain/value-objects/money.vo.js';

export enum DeliveryAssignmentStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  PICKED_UP = 'PICKED_UP',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

export interface DeliveryAssignmentProps {
  id: string;
  orderId: string;
  driverId: string | null;
  status: DeliveryAssignmentStatus;
  estimatedDistance: number | null;
  estimatedDuration: number | null;
  deliveryFee: Money;
  acceptedAt: Date | null;
  pickedUpAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class DeliveryAssignment {
  private constructor(private readonly props: DeliveryAssignmentProps) {}

  static create(props: DeliveryAssignmentProps): DeliveryAssignment {
    return new DeliveryAssignment(props);
  }

  /** Use this when loading from persistence — bypasses any creation-time guards */
  static rehydrate(props: DeliveryAssignmentProps): DeliveryAssignment {
    return new DeliveryAssignment(props);
  }

  get id(): string {
    return this.props.id;
  }
  get orderId(): string {
    return this.props.orderId;
  }
  get driverId(): string | null {
    return this.props.driverId;
  }
  get status(): DeliveryAssignmentStatus {
    return this.props.status;
  }
  get estimatedDistance(): number | null {
    return this.props.estimatedDistance;
  }
  get estimatedDuration(): number | null {
    return this.props.estimatedDuration;
  }
  get deliveryFee(): Money {
    return this.props.deliveryFee;
  }
  get acceptedAt(): Date | null {
    return this.props.acceptedAt;
  }
  get pickedUpAt(): Date | null {
    return this.props.pickedUpAt;
  }
  get deliveredAt(): Date | null {
    return this.props.deliveredAt;
  }
  get cancelledAt(): Date | null {
    return this.props.cancelledAt;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  private checkDriverAuth(driverId: string): void {
    if (this.props.driverId !== driverId) {
      throw DeliveryDomainError.unauthorizedDriver();
    }
  }

  public accept(driverId: string): void {
    if (this.status !== DeliveryAssignmentStatus.PENDING) {
      throw DeliveryDomainError.invalidStatusTransition(
        this.status,
        DeliveryAssignmentStatus.ACCEPTED,
      );
    }
    // We update the local state. The repository is responsible for concurrency DB checks.
    this.props.driverId = driverId;
    this.props.status = DeliveryAssignmentStatus.ACCEPTED;
    this.props.acceptedAt = new Date();
  }

  public reject(): void {
    if (this.status !== DeliveryAssignmentStatus.PENDING) {
      throw DeliveryDomainError.invalidStatusTransition(
        this.status,
        DeliveryAssignmentStatus.REJECTED,
      );
    }
    this.props.status = DeliveryAssignmentStatus.REJECTED;
    this.props.cancelledAt = new Date();
  }

  public pickUp(driverId: string): void {
    if (this.status !== DeliveryAssignmentStatus.ACCEPTED) {
      throw DeliveryDomainError.invalidStatusTransition(
        this.status,
        DeliveryAssignmentStatus.PICKED_UP,
      );
    }
    this.checkDriverAuth(driverId);
    this.props.status = DeliveryAssignmentStatus.PICKED_UP;
    this.props.pickedUpAt = new Date();
  }

  public deliver(driverId: string): void {
    if (this.status !== DeliveryAssignmentStatus.PICKED_UP) {
      throw DeliveryDomainError.invalidStatusTransition(
        this.status,
        DeliveryAssignmentStatus.DELIVERED,
      );
    }
    this.checkDriverAuth(driverId);
    this.props.status = DeliveryAssignmentStatus.DELIVERED;
    this.props.deliveredAt = new Date();
  }

  public fail(driverId: string): void {
    if (
      this.status !== DeliveryAssignmentStatus.PICKED_UP &&
      this.status !== DeliveryAssignmentStatus.ACCEPTED
    ) {
      throw DeliveryDomainError.invalidStatusTransition(
        this.status,
        DeliveryAssignmentStatus.FAILED,
      );
    }
    this.checkDriverAuth(driverId);
    this.props.status = DeliveryAssignmentStatus.FAILED;
    this.props.cancelledAt = new Date();
  }
}
