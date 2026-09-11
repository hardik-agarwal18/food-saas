import { DeliveryDomainError } from '../errors/delivery-domain.error.js';

export enum DriverStatus {
  OFFLINE = 'OFFLINE',
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  SUSPENDED = 'SUSPENDED',
}

export enum VehicleType {
  BICYCLE = 'BICYCLE',
  MOTORCYCLE = 'MOTORCYCLE',
  CAR = 'CAR',
  VAN = 'VAN',
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface DriverProps {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  vehicleType: VehicleType;
  vehiclePlateNumber: string | null;
  status: DriverStatus;
  currentLocation: Location | null;
  lastLocationAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Driver {
  private constructor(private readonly props: DriverProps) {}

  static create(props: DriverProps): Driver {
    return new Driver(props);
  }

  /** Use this when loading from persistence — bypasses any creation-time guards */
  static rehydrate(props: DriverProps): Driver {
    return new Driver(props);
  }

  get id(): string {
    return this.props.id;
  }
  get userId(): string {
    return this.props.userId;
  }
  get firstName(): string {
    return this.props.firstName;
  }
  get lastName(): string {
    return this.props.lastName;
  }
  get phone(): string {
    return this.props.phone;
  }
  get vehicleType(): VehicleType {
    return this.props.vehicleType;
  }
  get vehiclePlateNumber(): string | null {
    return this.props.vehiclePlateNumber;
  }
  get status(): DriverStatus {
    return this.props.status;
  }
  get currentLocation(): Location | null {
    return this.props.currentLocation;
  }
  get lastLocationAt(): Date | null {
    return this.props.lastLocationAt;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public goOnline(): void {
    if (this.status === DriverStatus.SUSPENDED) {
      throw new DeliveryDomainError('Suspended drivers cannot go online.', 'DRIVER_SUSPENDED');
    }
    if (this.status === DriverStatus.OFFLINE) {
      this.props.status = DriverStatus.AVAILABLE;
    }
  }

  public goOffline(): void {
    if (this.status === DriverStatus.BUSY) {
      throw new DeliveryDomainError(
        'Drivers cannot go offline while completing an assignment.',
        'DRIVER_BUSY',
      );
    }
    this.props.status = DriverStatus.OFFLINE;
  }

  public markBusy(): void {
    if (this.status !== DriverStatus.AVAILABLE) {
      throw new DeliveryDomainError(
        'Driver must be available to be marked as busy.',
        'DRIVER_NOT_AVAILABLE',
      );
    }
    this.props.status = DriverStatus.BUSY;
  }

  public markAvailable(): void {
    if (this.status === DriverStatus.SUSPENDED) {
      throw new DeliveryDomainError(
        'Suspended drivers cannot become available.',
        'DRIVER_SUSPENDED',
      );
    }
    this.props.status = DriverStatus.AVAILABLE;
  }

  public updateLocation(lat: number, lng: number): void {
    this.props.currentLocation = { latitude: lat, longitude: lng };
    this.props.lastLocationAt = new Date();
  }
}
