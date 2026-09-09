export interface IToggleDriverAvailabilityUseCase {
  execute(userId: string, isAvailable: boolean): Promise<void>;
}
