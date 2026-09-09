export interface IUpdateDriverLocationUseCase {
  execute(userId: string, latitude: number, longitude: number): Promise<void>;
}
