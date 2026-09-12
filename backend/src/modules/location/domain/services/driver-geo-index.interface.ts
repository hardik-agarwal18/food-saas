import { GeoCell } from '../value-objects/geo-cell.vo.js';

export interface IDriverGeoIndex {
  /**
   * Adds a driver to a specific geographic cell.
   */
  add(cell: GeoCell, driverId: string): Promise<void>;

  /**
   * Removes a driver from a specific geographic cell.
   */
  remove(cell: GeoCell, driverId: string): Promise<void>;

  /**
   * Atomically moves a driver from an old cell to a new cell.
   * If oldCell is null, it acts like an add.
   */
  move(oldCell: GeoCell | null, newCell: GeoCell, driverId: string): Promise<void>;

  /**
   * Finds all driver IDs currently located in any of the specified cells.
   */
  findDrivers(cells: GeoCell[]): Promise<string[]>;
}
