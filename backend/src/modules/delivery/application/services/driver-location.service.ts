import { inject, injectable } from 'tsyringe';
import { redis } from '../../../../config/redis.js';
import type { IDriverRepository } from '../../domain/repositories/driver.repository.js';
import { DeliveryTokens } from '../../infrastructure/tokens/delivery.tokens.js';
import { DriverStatus } from '../../domain/entities/driver.entity.js';

@injectable()
export class DriverLocationService {
  private readonly GEO_KEY = 'driver_locations';
  private readonly ACTIVE_TTL_SECONDS = 60;

  constructor(
    @inject(DeliveryTokens.DriverRepository)
    private readonly driverRepository: IDriverRepository,
  ) {}

  /**
   * Updates a driver's live location in Redis using Geospatial indexing.
   * Atomically checks the timestamp to prevent out-of-order updates.
   *
   * @param driverId - The unique ID of the driver.
   * @param lat - Latitude.
   * @param lng - Longitude.
   * @param timestamp - The epoch timestamp of the payload.
   */
  async updateLocation(
    driverId: string,
    lat: number,
    lng: number,
    timestamp: number,
  ): Promise<void> {
    const timestampKey = `driver:location:timestamp:${driverId}`;
    const activeKey = `driver:location:active:${driverId}`;

    const luaScript = `
      local currentTs = redis.call('GET', KEYS[1])
      if not currentTs or tonumber(ARGV[1]) > tonumber(currentTs) then
        redis.call('SET', KEYS[1], ARGV[1])
        redis.call('GEOADD', KEYS[2], ARGV[2], ARGV[3], ARGV[4])
        redis.call('SETEX', KEYS[3], tonumber(ARGV[5]), '1')
        return 1
      end
      return 0
    `;

    await redis.eval(
      luaScript,
      3,
      timestampKey,
      this.GEO_KEY,
      activeKey,
      timestamp.toString(),
      lng.toString(),
      lat.toString(),
      driverId,
      this.ACTIVE_TTL_SECONDS.toString(),
    );
  }

  /**
   * Fetches the last known coordinate for a driver.
   */
  async getLocation(driverId: string): Promise<[string, string] | null> {
    const pos = await redis.geopos(this.GEO_KEY, driverId);
    if (!pos || pos.length === 0 || pos[0] === null) {
      return null;
    }
    return pos[0];
  }

  /**
   * Finds drivers near a specific coordinate within a given radius.
   * Filters out stale drivers and drivers who are not AVAILABLE.
   *
   * @param lat Latitude
   * @param lng Longitude
   * @param radiusKm Radius in kilometers
   * @returns Array of nearby drivers and their distances
   */
  async getNearbyDrivers(
    lat: number,
    lng: number,
    radiusKm: number,
  ): Promise<Array<{ driverId: string; distance: number }>> {
    // geosearch returns an array of arrays when WITHDIST is used: [["driver1", "1.5"], ["driver2", "2.1"]]
    const geoResults = (await redis.geosearch(
      this.GEO_KEY,
      'FROMLONLAT',
      lng,
      lat,
      'BYRADIUS',
      radiusKm,
      'km',
      'WITHDIST',
      'ASC',
    )) as unknown as Array<[string, string]>;

    if (geoResults.length === 0) {
      return [];
    }

    const driverDistances = geoResults.map(([driverId, distance]) => ({
      driverId,
      distance: parseFloat(distance),
    }));

    // Filter stale drivers by checking if their active TTL key exists
    const activeKeys = driverDistances.map((d) => `driver:location:active:${d.driverId}`);
    const activeStatus = await redis.mget(...activeKeys);

    const activeDriverDistances = driverDistances.filter(
      (_, index) => activeStatus[index] !== null,
    );

    if (activeDriverDistances.length === 0) {
      return [];
    }

    // Filter by driver availability in the domain
    const activeDriverIds = activeDriverDistances.map((d) => d.driverId);
    const drivers = await this.driverRepository.findByIds(activeDriverIds);

    const availableDrivers = drivers.filter((d) => d.status === DriverStatus.AVAILABLE);

    if (availableDrivers.length === 0) {
      return [];
    }

    // Re-map distances safely
    const distanceByDriverId = new Map(activeDriverDistances.map((d) => [d.driverId, d.distance]));

    return availableDrivers.map((driver) => ({
      driverId: driver.id,
      distance: distanceByDriverId.get(driver.id)!,
    }));
  }
}
