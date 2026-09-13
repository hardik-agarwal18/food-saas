import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from './api';
import { customerKeys } from './queries';
import { AddAddressRequest, UpdateAddressRequest, UpdatePreferencesRequest, UpdateProfileRequest } from './types';

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => customerApi.updateProfile(data),
    onSuccess: (data) => {
      queryClient.setQueryData(customerKeys.profile(), data);
    },
  });
};

export const useUpdatePreferencesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePreferencesRequest) => customerApi.updatePreferences(data),
    onSuccess: (data) => {
      queryClient.setQueryData(customerKeys.profile(), data);
    },
  });
};

export const useUploadAvatarMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => customerApi.uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.profile() });
    },
  });
};

export const useRemoveAvatarMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => customerApi.removeAvatar(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.profile() });
    },
  });
};

export const useAddAddressMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddAddressRequest) => customerApi.addAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.addresses() });
    },
  });
};

export const useUpdateAddressMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateAddressRequest) => customerApi.updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.addresses() });
    },
  });
};

export const useDeleteAddressMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customerApi.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.addresses() });
    },
  });
};

export const useSetDefaultAddressMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customerApi.setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.addresses() });
    },
  });
};
