import { InvalidGeoCellError } from '../errors/location.errors.js';

export interface GeoCellProps {
  index: string;
  resolution: number;
}

export class GeoCell {
  private constructor(
    public readonly index: string,
    public readonly resolution: number,
  ) {}

  public static create(props: GeoCellProps): GeoCell {
    const { index, resolution } = props;

    if (!index || typeof index !== 'string' || index.trim() === '') {
      throw new InvalidGeoCellError('GeoCell index is required and must be a valid string.');
    }

    if (resolution === undefined || resolution === null || isNaN(resolution)) {
      throw new InvalidGeoCellError('Resolution is required and must be a valid number.');
    }

    if (resolution < 0 || resolution > 15) {
      throw new InvalidGeoCellError('H3 resolution must be between 0 and 15.');
    }

    // A more thorough validation would verify the string is a valid H3 index format,
    // but we leave that to the H3 abstraction to generate it safely.

    return new GeoCell(index, resolution);
  }

  public equals(other: GeoCell): boolean {
    if (!other) {
      return false;
    }
    return this.index === other.index && this.resolution === other.resolution;
  }
}
