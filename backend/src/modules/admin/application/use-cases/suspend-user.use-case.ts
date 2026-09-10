export interface ISuspendUserUseCase {
  execute(userId: string): Promise<void>;
}
