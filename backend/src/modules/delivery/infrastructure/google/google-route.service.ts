import { injectable } from 'tsyringe';
import { IRouteService, RouteResult } from '../../domain/services/route.service.interface.js';
import { Coordinates } from '../../../location/domain/value-objects/coordinates.vo.js';
import { logger } from '../../../../infrastructure/observability/logger/pino.js';

@injectable()
export class GoogleRouteService implements IRouteService {
  private readonly GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  // Route Matrix API endpoint
  private readonly ROUTE_MATRIX_URL =
    'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix';

  public async getRoutes(
    origin: Coordinates,
    destinations: Array<{ id: string; coordinates: Coordinates }>,
  ): Promise<RouteResult[]> {
    if (!destinations || destinations.length === 0) {
      return [];
    }

    // If no API key is provided, gracefully fall back to Haversine distance.
    if (!this.GOOGLE_API_KEY) {
      logger.warn(
        'GOOGLE_MAPS_API_KEY is not set. Falling back to Haversine distance calculation.',
      );
      return this.calculateHaversineFallback(origin, destinations);
    }

    try {
      const origins = [
        {
          waypoint: {
            location: {
              latLng: {
                latitude: origin.latitude,
                longitude: origin.longitude,
              },
            },
          },
        },
      ];

      const googleDestinations = destinations.map((d) => ({
        waypoint: {
          location: {
            latLng: {
              latitude: d.coordinates.latitude,
              longitude: d.coordinates.longitude,
            },
          },
        },
      }));

      const response = await fetch(this.ROUTE_MATRIX_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.GOOGLE_API_KEY,
          // Field mask to restrict the response to only what we need
          'X-Goog-FieldMask': 'originIndex,destinationIndex,duration,distanceMeters,condition',
        },
        body: JSON.stringify({
          origins,
          destinations: googleDestinations,
          travelMode: 'TWO_WHEELER', // Typically food delivery is done via two-wheelers in many markets, or DRIVE
          routingPreference: 'TRAFFIC_AWARE',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(
          { status: response.status, errorText },
          'Failed to fetch routes from Google Matrix API',
        );
        throw new Error(`Google Routes API error: ${response.status}`);
      }

      const data: any[] = await response.json();

      const results: RouteResult[] = [];

      for (const item of data) {
        // Find the corresponding driver destination
        const destIndex = item.destinationIndex || 0;
        const driver = destinations[destIndex];

        if (!driver) continue;

        // duration is returned like "123s"
        const durationString = item.duration || '0s';
        const durationSeconds = parseInt(durationString.replace('s', ''), 10);

        results.push({
          driverId: driver.id,
          distanceMeters: item.distanceMeters || 0,
          durationSeconds: durationSeconds,
          source: 'GOOGLE_ROUTES',
        });
      }

      return results;
    } catch (error) {
      logger.error({ error }, 'Error fetching Google Routes Matrix. Falling back to Haversine.');
      return this.calculateHaversineFallback(origin, destinations);
    }
  }

  private calculateHaversineFallback(
    origin: Coordinates,
    destinations: Array<{ id: string; coordinates: Coordinates }>,
  ): RouteResult[] {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371e3; // Earth radius in meters

    return destinations.map((d) => {
      const lat1 = origin.latitude;
      const lon1 = origin.longitude;
      const lat2 = d.coordinates.latitude;
      const lon2 = d.coordinates.longitude;

      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceMeters = R * c;

      // Estimate duration based on roughly 30 km/h (8.33 m/s) urban speed
      const estimatedSpeedMps = 8.33;
      const durationSeconds = Math.round(distanceMeters / estimatedSpeedMps);

      return {
        driverId: d.id,
        distanceMeters: Math.round(distanceMeters),
        durationSeconds,
        source: 'HAVERSINE',
      };
    });
  }
}
