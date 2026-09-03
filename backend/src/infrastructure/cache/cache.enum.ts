/**
 * Names of cache operations used for metrics and logging.
 *
 * Using an enum prevents different parts of the application
 * from inventing slightly different operation names.
 */
export enum CacheOperation {
  GET = 'GET',
  SET = 'SET',
  DELETE = 'DELETE',
  EXISTS = 'EXISTS',
  EXPIRE = 'EXPIRE',
  INCREMENT = 'INCREMENT',
}
