export interface RegisterDriverDto {
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  vehicleType: 'BICYCLE' | 'MOTORCYCLE' | 'CAR' | 'VAN';
  vehiclePlateNumber?: string;
}

export interface IRegisterDriverUseCase {
  execute(data: RegisterDriverDto): Promise<void>;
}
