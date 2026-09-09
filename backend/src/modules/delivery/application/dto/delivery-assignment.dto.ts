export interface DeliveryAssignmentResponseDto {
  id: string;
  orderId: string;
  driverId: string | null;
  status: string;
  deliveryFee: number;
  estimatedDistance: number | null;
  estimatedDuration: number | null;
  createdAt: Date;
  updatedAt: Date;
}
