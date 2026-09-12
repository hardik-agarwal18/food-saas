import { Coordinates } from '../../../location/domain/value-objects/coordinates.vo.js';

export interface RouteResult {
  driverId: string;
  distanceMeters: number;
  durationSeconds: number;
  source: 'GOOGLE_ROUTES' | 'HAVERSINE';
}

export interface IRouteService {
  /**
   * Calculates the driving routes from an origin to multiple destinations.
   * Useful for batch-calculating driver ETAs to a single restaurant.
   *
   * @param origin The restaurant or pickup location.
   * @param destinations The list of drivers to evaluate.
   */
  getRoutes(
    origin: Coordinates,
    destinations: Array<{ id: string; coordinates: Coordinates }>,
  ): Promise<RouteResult[]>;
}
