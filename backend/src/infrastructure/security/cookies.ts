import cookieParser from 'cookie-parser';

/**
 * Express middleware that parses the Cookie header.
 *
 * After this middleware runs, cookies sent by the client
 * become available through req.cookies.
 *
 * Example:
 *
 * Cookie: sessionId=abc123
 *
 * becomes conceptually:
 *
 * req.cookies.sessionId === 'abc123'
 */
export const cookieParserMiddleware = cookieParser();
