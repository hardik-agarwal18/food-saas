import express, { RequestHandler } from 'express';

/**
 * Parses JSON request bodies.
 *
 * Example request body:
 *
 * {
 *   "name": "Restaurant",
 *   "email": "owner@example.com"
 * }
 *
 * The 100kb limit prevents clients from sending
 * unexpectedly large JSON payloads.
 *
 * `strict: true` means the parser expects valid JSON
 * objects or arrays rather than primitive JSON values.
 */
const jsonMiddleware = express.json({
  limit: '100kb',
  strict: true,
});

/**
 * Parses URL-encoded request bodies.
 *
 * This is commonly used by HTML forms or clients sending
 * data in application/x-www-form-urlencoded format.
 *
 * `extended: true` allows nested objects and arrays
 * to be represented in the request body.
 *
 * `parameterLimit: 100` limits the number of parameters
 * accepted from one request.
 */
const urlEncodedMiddleware = express.urlencoded({
  extended: true,
  limit: '100kb',
  parameterLimit: 100,
});

/**
 * Collection of body-parsing middleware used by Express.
 *
 * Keeping both parsers in an array allows them to be
 * registered together through app.use().
 */
export const bodyParserMiddleware: RequestHandler[] = [jsonMiddleware, urlEncodedMiddleware];
