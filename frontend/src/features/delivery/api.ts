import { apiClient } from '@/lib/api/client';
import { DeliveryAssignment } from '@/types/api.types';

export const deliveryApi = {
  getAvailableDeliveries: async (): Promise<DeliveryAssignment[]> => {
    return apiClient.get('/deliveries/available');
  },

  getMyActiveDeliveries: async (): Promise<DeliveryAssignment[]> => {
    return apiClient.get('/deliveries/my-active');
  },

  claimDelivery: async (assignmentId: string): Promise<DeliveryAssignment> => {
    return apiClient.post(`/deliveries/${assignmentId}/claim`);
  },

  updateDeliveryStatus: async (assignmentId: string, status: string): Promise<DeliveryAssignment> => {
    return apiClient.patch(`/deliveries/${assignmentId}/status`, { status });
  },

  toggleAvailability: async (isAvailable: boolean): Promise<any> => {
    return apiClient.patch('/drivers/me/availability', { isAvailable });
  },
};
