import { RestaurantDomainError } from '../errors/restaurant-domain.error.js';
import { RestaurantName, Address } from '../value-objects/index.js';
import { CustomerPhoneNumber } from '../../../customer/domain/value-objects/index.js';
import { Email } from '../../../identity/domain/value-objects/email.vo.js';

export enum RestaurantStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export type RestaurantProps = {
  id: string;
  ownerId: string;
  name: RestaurantName;
  description: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  phoneNumber: CustomerPhoneNumber; // Reusing from customer, assuming it's generic enough
  email: Email;
  address: Address;
  latitude: number | null;
  longitude: number | null;
  status: RestaurantStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export class Restaurant {
  private readonly id: string;
  private readonly ownerId: string;
  private name: RestaurantName;
  private description: string | null;
  private logoUrl: string | null;
  private coverImageUrl: string | null;
  private phoneNumber: CustomerPhoneNumber;
  private email: Email;
  private address: Address;
  private latitude: number | null;
  private longitude: number | null;
  private status: RestaurantStatus;
  private readonly createdAt: Date;
  private updatedAt: Date;
  private deletedAt: Date | null;

  constructor(props: RestaurantProps) {
    this.id = Restaurant.validateId(props.id);
    this.ownerId = Restaurant.validateId(props.ownerId);
    this.name = props.name;
    this.description = props.description;
    this.logoUrl = props.logoUrl;
    this.coverImageUrl = props.coverImageUrl;
    this.phoneNumber = props.phoneNumber;
    this.email = props.email;
    this.address = props.address;
    this.latitude = props.latitude;
    this.longitude = props.longitude;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
  }

  public static create(params: {
    ownerId: string;
    name: RestaurantName;
    description: string | null;
    phoneNumber: CustomerPhoneNumber;
    email: Email;
    address: Address;
  }): Restaurant {
    const now = new Date();

    return new Restaurant({
      id: crypto.randomUUID(),
      ownerId: params.ownerId,
      name: params.name,
      description: params.description,
      logoUrl: null,
      coverImageUrl: null,
      phoneNumber: params.phoneNumber,
      email: params.email,
      address: params.address,
      latitude: null,
      longitude: null,
      status: RestaurantStatus.PENDING,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  public static rehydrate(props: RestaurantProps): Restaurant {
    return new Restaurant(props);
  }

  // Getters
  public getId(): string {
    return this.id;
  }
  public getOwnerId(): string {
    return this.ownerId;
  }
  public getName(): RestaurantName {
    return this.name;
  }
  public getDescription(): string | null {
    return this.description;
  }
  public getLogoUrl(): string | null {
    return this.logoUrl;
  }
  public getCoverImageUrl(): string | null {
    return this.coverImageUrl;
  }
  public getPhoneNumber(): CustomerPhoneNumber {
    return this.phoneNumber;
  }
  public getEmail(): Email {
    return this.email;
  }
  public getAddress(): Address {
    return this.address;
  }
  public getLatitude(): number | null {
    return this.latitude;
  }
  public getLongitude(): number | null {
    return this.longitude;
  }
  public getStatus(): RestaurantStatus {
    return this.status;
  }
  public getCreatedAt(): Date {
    return this.createdAt;
  }
  public getUpdatedAt(): Date {
    return this.updatedAt;
  }
  public getDeletedAt(): Date | null {
    return this.deletedAt;
  }
  public isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  // Status transitions
  public activate(): void {
    if (this.isDeleted()) throw new RestaurantDomainError('Cannot activate a deleted restaurant');
    if (this.status === RestaurantStatus.SUSPENDED) {
      throw new RestaurantDomainError('Cannot activate a suspended restaurant directly');
    }

    this.status = RestaurantStatus.ACTIVE;
    this.touch();
  }

  public deactivate(): void {
    if (this.isDeleted()) throw new RestaurantDomainError('Cannot deactivate a deleted restaurant');
    if (this.status === RestaurantStatus.SUSPENDED) {
      throw new RestaurantDomainError('Cannot deactivate a suspended restaurant');
    }

    this.status = RestaurantStatus.INACTIVE;
    this.touch();
  }

  public suspend(): void {
    if (this.isDeleted()) throw new RestaurantDomainError('Cannot suspend a deleted restaurant');
    this.status = RestaurantStatus.SUSPENDED;
    this.touch();
  }

  public delete(): void {
    if (this.isDeleted()) return;
    this.deletedAt = new Date();
    this.status = RestaurantStatus.INACTIVE; // Option: mark as inactive or special deleted status
    this.touch();
  }

  // Profile Updates
  public updateProfile(params: {
    name?: RestaurantName;
    description?: string | null;
    phoneNumber?: CustomerPhoneNumber;
    email?: Email;
    address?: Address;
  }): void {
    if (this.isDeleted()) throw new RestaurantDomainError('Cannot update a deleted restaurant');

    if (params.name) this.name = params.name;
    if (params.description !== undefined) this.description = params.description;
    if (params.phoneNumber) this.phoneNumber = params.phoneNumber;
    if (params.email) this.email = params.email;
    if (params.address) this.address = params.address;

    this.touch();
  }

  public updateLogo(url: string | null): void {
    if (this.isDeleted()) throw new RestaurantDomainError('Cannot update a deleted restaurant');
    this.logoUrl = url;
    this.touch();
  }

  public updateCoverImage(url: string | null): void {
    if (this.isDeleted()) throw new RestaurantDomainError('Cannot update a deleted restaurant');
    this.coverImageUrl = url;
    this.touch();
  }

  public updateCoordinates(lat: number, lng: number): void {
    if (this.isDeleted()) throw new RestaurantDomainError('Cannot update a deleted restaurant');
    this.latitude = lat;
    this.longitude = lng;
    this.touch();
  }

  private touch(): void {
    this.updatedAt = new Date();
  }

  private static validateId(id: string): string {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new RestaurantDomainError('Invalid ID');
    }
    return id.trim();
  }
}
