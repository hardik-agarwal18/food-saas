import { inject, injectable } from 'tsyringe';
import { InfrastructureTokens } from '../../../../infrastructure/container/tokens/infrastructure.tokens.js';
import type { Redis } from 'ioredis';
import type { IDriverGeoIndex } from '../../domain/services/driver-geo-index.interface.js';
import type { GeoCell } from '../../domain/value-objects/geo-cell.vo.js';

@injectable()
export class RedisDriverGeoIndex implements IDriverGeoIndex {
  private readonly CELL_PREFIX = 'driver:location:cell:';

  constructor(
    @inject(InfrastructureTokens.RedisClient)
    private readonly redis: Redis,
  ) {}

  private getCellKey(cell: GeoCell): string {
    return `${this.CELL_PREFIX}${cell.index}`;
  }

  public async add(cell: GeoCell, driverId: string): Promise<void> {
    await this.redis.sadd(this.getCellKey(cell), driverId);
  }

  public async remove(cell: GeoCell, driverId: string): Promise<void> {
    await this.redis.srem(this.getCellKey(cell), driverId);
  }

  public async move(oldCell: GeoCell | null, newCell: GeoCell, driverId: string): Promise<void> {
    if (oldCell && oldCell.equals(newCell)) {
      // Idempotent: same cell, no movement needed.
      return;
    }

    const newKey = this.getCellKey(newCell);

    if (!oldCell) {
      await this.redis.sadd(newKey, driverId);
      return;
    }

    const oldKey = this.getCellKey(oldCell);

    // Atomically move the driver using a multi/exec pipeline.
    // If we wanted cross-slot safety in a cluster we'd use a Lua script,
    // but a pipeline is usually sufficient if not using Redis Cluster
    // or if keys hash to the same slot (which they won't).
    // The requirement states "use Lua script or appropriate atomic mechanism".
    // A simple Lua script guarantees atomicity across keys without MULTI limitations.

    const luaScript = `
      redis.call('SREM', KEYS[1], ARGV[1])
      redis.call('SADD', KEYS[2], ARGV[1])
      return 1
    `;

    await this.redis.eval(luaScript, 2, oldKey, newKey, driverId);
  }

  public async findDrivers(cells: GeoCell[]): Promise<string[]> {
    if (cells.length === 0) {
      return [];
    }

    const keys = cells.map((cell) => this.getCellKey(cell));
    const results = await this.redis.sunion(...keys);
    return results;
  }
}
