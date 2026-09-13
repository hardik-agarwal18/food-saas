import { apiClient } from '@/lib/api/client';
import { Customer, CustomerAddress } from '@/types/api.types';
import { AddAddressRequest, UpdateAddressRequest, UpdatePreferencesRequest, UpdateProfileRequest } from './types';

export const customerApi = {
  getProfile: async (): Promise<Customer> => {
    return apiClient.get('/customer/me');
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<Customer> => {
    return apiClient.patch('/customer/update-profile', data);
  },

  updatePreferences: async (data: UpdatePreferencesRequest): Promise<Customer> => {
    return apiClient.patch('/customer/me/update-preferences', data);
  },

  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient.post('/customer/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  removeAvatar: async (): Promise<void> => {
    return apiClient.delete('/customer/me/avatar');
  },

  getAddresses: async (): Promise<CustomerAddress[]> => {
    return apiClient.get('/customer/me/addresses');
  },

  addAddress: async (data: AddAddressRequest): Promise<CustomerAddress> => {
    return apiClient.post('/customer/me/addresses', data);
  },

  updateAddress: async (id: string, data: UpdateAddressRequest): Promise<CustomerAddress> => {
    return apiClient.patch(`/customer/me/addresses/${id}`, data);
  },

  deleteAddress: async (id: string): Promise<void> => {
    return apiClient.delete(`/customer/me/addresses/${id}`);
  },

  setDefaultAddress: async (id: string): Promise<CustomerAddress> => {
    return apiClient.post(`/customer/me/addresses/${id}/default`);
  },
};
