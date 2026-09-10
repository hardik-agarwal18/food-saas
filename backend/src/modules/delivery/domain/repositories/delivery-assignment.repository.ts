import { DeliveryAssignment } from '../entities/delivery-assignment.entity.js';

export interface IDeliveryAssignmentRepository {
  findById(id: string): Promise<DeliveryAssignment | null>;
  findByOrderId(orderId: string): Promise<DeliveryAssignment[]>;
  findByDriverId(driverId: string): Promise<DeliveryAssignment[]>;
  findAvailableAssignments(driverLat?: number, driverLng?: number): Promise<DeliveryAssignment[]>;
  save(assignment: DeliveryAssignment): Promise<void>;

  /**
   * Attempts to claim a delivery assignment for a driver.
   * This MUST use a database transaction + conditional update to prevent two drivers
   * from claiming the same assignment concurrently.
   *
   * @returns true if the claim was successful, false if it was already claimed or invalid.
   */
  claimAssignment(assignmentId: string, driverId: string): Promise<boolean>;
}
