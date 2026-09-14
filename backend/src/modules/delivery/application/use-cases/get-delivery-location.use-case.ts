export interface GetDeliveryLocationInput {
  actorId: string;
  actorRoles: string[];
  assignmentId?: string;
  orderId?: string;
}

export interface DeliveryLocationDto {
  latitude: number;
  longitude: number;
  updatedAt: Date;
}

export interface IGetDeliveryLocationUseCase {
  execute(input: GetDeliveryLocationInput): Promise<DeliveryLocationDto | null>;
}
