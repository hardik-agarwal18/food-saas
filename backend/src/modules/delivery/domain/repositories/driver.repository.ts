import { Driver } from '../entities/driver.entity.js';

export interface IDriverRepository {
  findById(id: string): Promise<Driver | null>;
  findByUserId(userId: string): Promise<Driver | null>;
  save(driver: Driver): Promise<void>;
}
