import { CacheSerializationError } from '../../shared/errors/CacheSerializationError.js';

/**
 * Converts cache values to JSON strings and restores them
 * from JSON strings.
 *
 * This keeps serialization logic separate from Redis commands.
 */
export class CacheSerializer {
  /**
   * Converts a JavaScript value into a JSON string.
   *
   * Throws a domain-specific cache serialization error
   * when JSON.stringify() fails.
   */
  serialize<T>(value: T): string {
    try {
      return JSON.stringify(value);
    } catch (error) {
      throw new CacheSerializationError('Failed to serialize the cache value', error);
    }
  }

  /**
   * Converts a JSON string back into a typed value.
   *
   * The generic type describes the expected application type.
   * It does not validate the runtime structure of the parsed data.
   */
  deserialize<T>(value: string): T {
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      throw new CacheSerializationError('Failed to deserialize the cache value', error);
    }
  }
}

/**
 * Shared serializer instance.
 */
export const cacheSerializer = new CacheSerializer();
