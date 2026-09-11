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
