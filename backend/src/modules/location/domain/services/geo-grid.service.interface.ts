import { Coordinates } from '../value-objects/coordinates.vo.js';
import { GeoCell } from '../value-objects/geo-cell.vo.js';

export interface IGeoGridService {
  /**
   * Calculates the geographic cell for a given coordinate at a specific resolution.
   */
  cellFromCoordinates(coordinates: Coordinates, resolution: number): GeoCell;

  /**
   * Gets the neighboring cells within a specific ring distance.
   */
  getNeighbors(cell: GeoCell, ringDistance: number): GeoCell[];

  /**
   * Determines if a coordinate is within a specific geographic cell.
   */
  contains(cell: GeoCell, coordinates: Coordinates): boolean;
}
