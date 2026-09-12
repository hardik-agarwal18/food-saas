export class InvalidCoordinatesError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidCoordinatesError';
  }
}

export class InvalidGeoCellError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidGeoCellError';
  }
}

export class LocationIndexUnavailableError extends Error {
  constructor(message: string = 'Location index is currently unavailable') {
    super(message);
    this.name = 'LocationIndexUnavailableError';
  }
}
