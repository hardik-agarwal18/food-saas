import { RequestHandler } from 'express';
import helmet from 'helmet';

/**
 * Security-header middleware.
 *
 * Helmet adds and configures HTTP response headers that
 * reduce common browser-based security risks.
 */
export const helmetMiddleware: RequestHandler = helmet({
  /**
   * Disabled because the application may configure its
   * Content Security Policy separately.
   *
   * Disabling CSP means this middleware does not provide
   * CSP protection by default.
   */
  contentSecurityPolicy: false,

  /**
   * Disabled because the application may need to embed
   * or interact with resources that conflict with this policy.
   */
  crossOriginEmbedderPolicy: false,

  /**
   * Restricts cross-origin opener relationships.
   */
  crossOriginOpenerPolicy: {
    policy: 'same-origin',
  },

  /**
   * Restricts which origins may load this application's
   * resources.
   */
  crossOriginResourcePolicy: {
    policy: 'same-site',
  },

  /**
   * Prevents browsers from performing DNS prefetching.
   */
  dnsPrefetchControl: {
    allow: false,
  },

  /**
   * Prevents browsers from interpreting files as a
   * different MIME type than the server declares.
   */
  noSniff: true,

  /**
   * Prevents the application from being embedded in frames.
   */
  frameguard: {
    action: 'deny',
  },

  /**
   * Removes the X-Powered-By header, reducing information
   * about the underlying framework.
   */
  hidePoweredBy: true,

  /**
   * HSTS is currently disabled because this configuration
   * is commented out.
   *
   * It should only be enabled after confirming that the
   * entire application is permanently served over HTTPS.
   */
  // hsts: {
  //   maxAge: 31536000,
  //   includeSubDomains: true,
  //   preload: true,
  // },

  /**
   * Enables Helmet's XSS filter configuration.
   */
  xssFilter: true,

  /**
   * Prevents the application from declaring permissive
   * cross-domain policy files.
   */
  permittedCrossDomainPolicies: false,

  /**
   * Prevents certain older Internet Explorer download
   * behavior.
   */
  ieNoOpen: true,

  /**
   * Enables origin-agent-cluster behavior.
   */
  originAgentCluster: true,
});
