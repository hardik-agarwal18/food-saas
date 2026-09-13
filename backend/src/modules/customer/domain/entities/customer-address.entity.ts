import { CustomerDomainError } from '../errors/customer-domain.error.js';
import { CustomerAddressLabel } from '../value-objects/index.js';

export class CustomerAddress {
  private readonly id: string;
  private readonly customerId: string;
  private label: CustomerAddressLabel;
  private streetAddress: string;
  private city: string;
  private state: string;
  private zipCode: string;
  private country: string;
  private latitude: number | null;
  private longitude: number | null;
  private isDefault: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(params: {
    id: string;
    customerId: string;
    label: CustomerAddressLabel;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    latitude: number | null;
    longitude: number | null;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = CustomerAddress.validateId(params.id);
    this.customerId = CustomerAddress.validateCustomerId(params.customerId);
    this.label = params.label;
    this.streetAddress = CustomerAddress.validateString(params.streetAddress, 'Street address');
    this.city = CustomerAddress.validateString(params.city, 'City');
    this.state = CustomerAddress.validateString(params.state, 'State');
    this.zipCode = CustomerAddress.validateString(params.zipCode, 'Zip code');
    this.country = CustomerAddress.validateString(params.country, 'Country');
    this.latitude = params.latitude;
    this.longitude = params.longitude;
    this.isDefault = params.isDefault;
    this.createdAt = params.createdAt ?? new Date();
    this.updatedAt = params.updatedAt ?? new Date();
  }

  public static create(params: {
    customerId: string;
    label: CustomerAddressLabel;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    latitude?: number | null;
    longitude?: number | null;
    isDefault?: boolean;
  }): CustomerAddress {
    const now = new Date();
    return new CustomerAddress({
      id: crypto.randomUUID(),
      customerId: params.customerId,
      label: params.label,
      streetAddress: params.streetAddress,
      city: params.city,
      state: params.state,
      zipCode: params.zipCode,
      country: params.country,
      latitude: params.latitude ?? null,
      longitude: params.longitude ?? null,
      isDefault: params.isDefault ?? false,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static rehydrate(params: {
    id: string;
    customerId: string;
    label: CustomerAddressLabel;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    latitude: number | null;
    longitude: number | null;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): CustomerAddress {
    return new CustomerAddress(params);
  }

  public getId(): string {
    return this.id;
  }

  public getCustomerId(): string {
    return this.customerId;
  }

  public getLabel(): CustomerAddressLabel {
    return this.label;
  }

  public getStreetAddress(): string {
    return this.streetAddress;
  }

  public getCity(): string {
    return this.city;
  }

  public getState(): string {
    return this.state;
  }

  public getZipCode(): string {
    return this.zipCode;
  }

  public getCountry(): string {
    return this.country;
  }

  public getLatitude(): number | null {
    return this.latitude;
  }

  public getLongitude(): number | null {
    return this.longitude;
  }

  public getIsDefault(): boolean {
    return this.isDefault;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public update(params: {
    label?: CustomerAddressLabel;
    streetAddress?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    latitude?: number | null;
    longitude?: number | null;
  }): void {
    if (params.label) this.label = params.label;
    if (params.streetAddress)
      this.streetAddress = CustomerAddress.validateString(params.streetAddress, 'Street address');
    if (params.city) this.city = CustomerAddress.validateString(params.city, 'City');
    if (params.state) this.state = CustomerAddress.validateString(params.state, 'State');
    if (params.zipCode) this.zipCode = CustomerAddress.validateString(params.zipCode, 'Zip code');
    if (params.country) this.country = CustomerAddress.validateString(params.country, 'Country');
    if (params.latitude !== undefined) this.latitude = params.latitude;
    if (params.longitude !== undefined) this.longitude = params.longitude;

    this.touch();
  }

  public setDefault(): void {
    this.isDefault = true;
    this.touch();
  }

  public unsetDefault(): void {
    this.isDefault = false;
    this.touch();
  }

  private touch(): void {
    this.updatedAt = new Date();
  }

  public toPrimitives() {
    return {
      id: this.id,
      customerId: this.customerId,
      label: this.label.getValue(),
      streetAddress: this.streetAddress,
      city: this.city,
      state: this.state,
      zipCode: this.zipCode,
      country: this.country,
      latitude: this.latitude,
      longitude: this.longitude,
      isDefault: this.isDefault,
      createdAt: new Date(this.createdAt),
      updatedAt: new Date(this.updatedAt),
    };
  }

  private static validateId(id: string): string {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new CustomerDomainError('Customer address id is invalid');
    }
    return id.trim();
  }

  private static validateCustomerId(id: string): string {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new CustomerDomainError('Customer id is invalid');
    }
    return id.trim();
  }

  private static validateString(value: string, fieldName: string): string {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      throw new CustomerDomainError(`${fieldName} is required`);
    }
    return value.trim();
  }
}
