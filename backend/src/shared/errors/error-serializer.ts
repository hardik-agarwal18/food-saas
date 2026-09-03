import { AppError } from './AppError.js';
import { ErrorResponse } from './error-response.js';
import { ValidationError } from './ValidationError.js';

/**
 * Converts an AppError into the standard API error response format.
 *
 * The serializer separates internal error objects from the public
 * response returned to clients.
 *
 * This is important because an Error object may contain internal
 * information such as:
 *
 * - Stack traces
 * - Database details
 * - Internal file paths
 * - Sensitive implementation information
 *
 * The serializer exposes only the fields that the API contract allows.
 */
export class ErrorSerializer {
  /**
   * Converts an application error into an ErrorResponse.
   *
   * @param error - Application-specific error to serialize.
   * @returns A consistent error response object.
   */
  static serialize(error: AppError): ErrorResponse {
    // Start with the common error response structure.
    const response: ErrorResponse = {
      success: false,

      error: {
        // The error code is stable and intended for programmatic use.
        code: error.code,

        // The message explains the failure to the client.
        message: error.message,
      },
    };

    // ValidationError contains additional field-level details.
    //
    // Other error types do not normally include this property.
    if (error instanceof ValidationError) {
      response.error.details = error.details;
    }

    // Return the sanitized and standardized response.
    return response;
  }
}
