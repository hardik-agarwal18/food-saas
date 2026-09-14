import { useQuery } from '@tanstack/react-query';
import { customerApi } from './api';

export const customerKeys = {
  all: ['customer'] as const,
  profile: () => [...customerKeys.all, 'profile'] as const,
  addresses: () => [...customerKeys.all, 'addresses'] as const,
};

export const useCustomerProfile = () => {
  return useQuery({
    queryKey: customerKeys.profile(),
    queryFn: () => customerApi.getProfile(),
  });
};

export const useCustomerAddresses = () => {
  return useQuery({
    queryKey: customerKeys.addresses(),
    queryFn: () => customerApi.getAddresses(),
  });
};
