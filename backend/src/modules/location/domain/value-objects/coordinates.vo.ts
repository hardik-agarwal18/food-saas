import { InvalidCoordinatesError } from '../errors/location.errors.js';

export interface CoordinatesProps {
  latitude: number;
  longitude: number;
}

export class Coordinates {
  private constructor(
    public readonly latitude: number,
    public readonly longitude: number,
  ) {}

  public static create(props: CoordinatesProps): Coordinates {
    const { latitude, longitude } = props;

    if (latitude === undefined || latitude === null || isNaN(latitude)) {
      throw new InvalidCoordinatesError('Latitude is required and must be a valid number.');
    }

    if (longitude === undefined || longitude === null || isNaN(longitude)) {
      throw new InvalidCoordinatesError('Longitude is required and must be a valid number.');
    }

    if (latitude < -90 || latitude > 90) {
      throw new InvalidCoordinatesError('Latitude must be between -90 and 90 degrees.');
    }

    if (longitude < -180 || longitude > 180) {
      throw new InvalidCoordinatesError('Longitude must be between -180 and 180 degrees.');
    }

    return new Coordinates(latitude, longitude);
  }

  public equals(other: Coordinates): boolean {
    if (!other) {
      return false;
    }
    return this.latitude === other.latitude && this.longitude === other.longitude;
  }
}
