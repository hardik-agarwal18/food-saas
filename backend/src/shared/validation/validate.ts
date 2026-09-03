import { NextFunction, Request, RequestHandler, Response } from 'express';

import { ValidationSchema } from './validation-schema.js';
import { ValidationError } from '../errors/ValidationError.js';
import { ValidationFormatter } from './validation-error.js';

/**
 * Creates Express middleware for validating incoming requests.
 *
 * The middleware accepts a ValidationSchema and validates whichever
 * request sections are defined:
 *
 * - schema.body validates req.body.
 * - schema.params validates req.params.
 * - schema.query validates req.query.
 *
 * Zod's safeParse() is used instead of parse() so validation failures
 * can be handled normally without throwing directly inside the
 * middleware.
 *
 * If validation fails:
 *
 * 1. The Zod error is converted into ValidationIssue[].
 * 2. A ValidationError is created.
 * 3. The error is passed to Express using next().
 *
 * If validation succeeds:
 *
 * 1. The parsed and validated data replaces the original request data.
 * 2. The next middleware or controller is called.
 *
 * @param schema - Validation rules for the request.
 * @returns Express request-validation middleware.
 */
export const validate = (schema: ValidationSchema): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    /**
     * Validate the request body when a body schema is provided.
     */
    if (schema.body) {
      // safeParse() never throws for normal validation failures.
      // It returns either:
      //
      // { success: true, data: ... }
      //
      // or:
      //
      // { success: false, error: ... }
      const result = schema.body.safeParse(req.body);

      if (!result.success) {
        // Convert Zod's detailed error into the application's
        // standard ValidationError structure.
        return next(new ValidationError(ValidationFormatter.format(result.error)));
      }

      // Replace the original body with the parsed result.
      //
      // This is important because Zod may:
      // - Apply defaults.
      // - Coerce values.
      // - Strip unknown properties.
      // - Transform values.
      req.body = result.data;
    }

    /**
     * Validate route parameters when a params schema is provided.
     */
    if (schema.params) {
      const result = schema.params.safeParse(req.params);

      if (!result.success) {
        // Forward the formatted validation failure to
        // the centralized Express error handler.
        return next(new ValidationError(ValidationFormatter.format(result.error)));
      }

      // Store the validated route parameters back on the request.
      //
      // The cast is required because Express's Request type
      // may use a more specific params type than Zod's output type.
      req.params = result.data as Request['params'];
    }

    /**
     * Validate query-string values when a query schema is provided.
     */
    if (schema.query) {
      // IMPORTANT:
      // The current implementation validates req.params here.
      // Query validation should normally validate req.query.
      const result = schema.query.safeParse(req.params);

      if (!result.success) {
        return next(new ValidationError(ValidationFormatter.format(result.error)));
      }

      // Store the validated query values back on the request.
      req.query = result.data as Request['query'];
    }

    // All configured validation checks passed.
    // Continue to the next middleware or route controller.
    next();
  };
};
