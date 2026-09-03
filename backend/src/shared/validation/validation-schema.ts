import type { ZodType } from 'zod';

/**
 * Describes the validation rules for an HTTP request.
 *
 * Each property is optional because a route may need to validate
 * only one part of the request.
 *
 * Examples:
 *
 * - body: Validate JSON sent in a POST or PUT request.
 * - params: Validate route parameters such as /users/:id.
 * - query: Validate query-string values such as ?page=1.
 *
 * A route can provide any combination of these schemas.
 */
export interface ValidationSchema {
  /**
   * Zod schema used to validate req.body.
   *
   * This is commonly used for request payloads.
   */
  body?: ZodType;

  /**
   * Zod schema used to validate req.params.
   *
   * Example:
   *
   * /restaurants/:restaurantId
   *
   * The restaurantId value can be validated here.
   */
  params?: ZodType;

  /**
   * Zod schema used to validate req.query.
   *
   * Example:
   *
   * /restaurants?page=1&limit=10
   *
   * The page and limit values can be validated here.
   */
  query?: ZodType;
}
