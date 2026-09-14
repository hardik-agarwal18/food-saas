import { CustomerAddress, CustomerPreferences, Customer } from '@/types/api.types';

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export type UpdatePreferencesRequest = CustomerPreferences;

export interface AddAddressRequest {
  label: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export type UpdateAddressRequest = Partial<AddAddressRequest>;
