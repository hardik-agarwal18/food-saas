import { RestaurantDomainError } from '../errors/restaurant-domain.error.js';

export type AddressProps = {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

export class Address {
  private readonly streetAddress: string;
  private readonly city: string;
  private readonly state: string;
  private readonly zipCode: string;
  private readonly country: string;

  constructor(props: AddressProps) {
    const validated = Address.validate(props);
    this.streetAddress = validated.streetAddress;
    this.city = validated.city;
    this.state = validated.state;
    this.zipCode = validated.zipCode;
    this.country = validated.country;
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

  public toPrimitives(): AddressProps {
    return {
      streetAddress: this.streetAddress,
      city: this.city,
      state: this.state,
      zipCode: this.zipCode,
      country: this.country,
    };
  }

  private static validate(props: AddressProps): AddressProps {
    if (!props.streetAddress?.trim()) {
      throw new RestaurantDomainError('Street address is required');
    }
    if (!props.city?.trim()) {
      throw new RestaurantDomainError('City is required');
    }
    if (!props.state?.trim()) {
      throw new RestaurantDomainError('State is required');
    }
    if (!props.zipCode?.trim()) {
      throw new RestaurantDomainError('Zip code is required');
    }
    if (!props.country?.trim()) {
      throw new RestaurantDomainError('Country is required');
    }

    return {
      streetAddress: props.streetAddress.trim(),
      city: props.city.trim(),
      state: props.state.trim(),
      zipCode: props.zipCode.trim(),
      country: props.country.trim(),
    };
  }
}
