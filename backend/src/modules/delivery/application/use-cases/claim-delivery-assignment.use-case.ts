export interface IClaimDeliveryAssignmentUseCase {
  execute(assignmentId: string, userId: string): Promise<void>;
}
