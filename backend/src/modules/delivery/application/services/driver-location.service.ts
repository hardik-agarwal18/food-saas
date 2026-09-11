import { inject, injectable } from 'tsyringe';
import { redis } from '../../../../config/redis.js';
import type { IDriverRepository } from '../../domain/repositories/driver.repository.js';
import { DeliveryTokens } from '../../infrastructure/tokens/delivery.tokens.js';
import { DriverStatus } from '../../domain/entities/driver.entity.js';
import { LocationTokens } from '../../../location/infrastructure/tokens/location.tokens.js';
import type { IGeoGridService } from '../../../location/domain/services/geo-grid.service.interface.js';
import type { IDriverGeoIndex } from '../../../location/domain/services/driver-geo-index.interface.js';
import { Coordinates } from '../../../location/domain/value-objects/coordinates.vo.js';
import { GeoCell } from '../../../location/domain/value-objects/geo-cell.vo.js';

@injectable()
export class DriverLocationService {
  private readonly ACTIVE_TTL_SECONDS = Number(process.env.DRIVER_LOCATION_MAX_AGE_SECONDS || 60);
  private readonly H3_RESOLUTION = Number(process.env.GEO_H3_RESOLUTION || 8);

  constructor(
    @inject(DeliveryTokens.DriverRepository)
    private readonly driverRepository: IDriverRepository,
    @inject(LocationTokens.GeoGridService)
    private readonly geoGridService: IGeoGridService,
    @inject(LocationTokens.DriverGeoIndex)
    private readonly driverGeoIndex: IDriverGeoIndex,
  ) {}

  /**
   * Updates a driver's live location in Redis using H3 indexing.
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
    const coords = Coordinates.create({ latitude: lat, longitude: lng });
    const newCell = this.geoGridService.cellFromCoordinates(coords, this.H3_RESOLUTION);

    const timestampKey = `driver:location:timestamp:${driverId}`;
    const activeKey = `driver:location:active:${driverId}`;
    const currentCellKey = `driver:location:current_cell:${driverId}`;

    // Atomically check timestamp, update TTL, and get the old cell.
    // If timestamp is older, returns false.
    // If newer, updates timestamp, TTL, and cell string, and returns the old cell string (or null).
    const luaScript = `
      local currentTs = redis.call('GET', KEYS[1])
      if not currentTs or tonumber(ARGV[1]) > tonumber(currentTs) then
        redis.call('SET', KEYS[1], ARGV[1])
        redis.call('SETEX', KEYS[2], tonumber(ARGV[2]), '1')
        
        local oldCell = redis.call('GET', KEYS[3])
        redis.call('SET', KEYS[3], ARGV[3])
        
        return oldCell or ''
      end
      return false
    `;

    const oldCellString = await redis.eval(
      luaScript,
      3,
      timestampKey,
      activeKey,
      currentCellKey,
      timestamp.toString(),
      this.ACTIVE_TTL_SECONDS.toString(),
      newCell.index,
    );

    // If the Lua script returned false, the timestamp was stale.
    if (oldCellString === false) {
      return;
    }

    const oldCell =
      oldCellString !== ''
        ? GeoCell.create({ index: oldCellString as string, resolution: this.H3_RESOLUTION })
        : null;

    // Use DriverGeoIndex to perform the atomic spatial transition
    await this.driverGeoIndex.move(oldCell, newCell, driverId);

    // Save the latest raw coordinates for later retrieval
    await redis.set(`driver:location:coords:${driverId}`, JSON.stringify({ lat, lng }));
  }

  /**
   * Fetches the last known coordinate for a driver.
   */
  async getLocation(driverId: string): Promise<[string, string] | null> {
    const rawCoords = await redis.get(`driver:location:coords:${driverId}`);
    if (!rawCoords) {
      return null;
    }
    const { lat, lng } = JSON.parse(rawCoords);
    return [lng.toString(), lat.toString()]; // Format matches previous GEOPOS return value [longitude, latitude]
  }

  /**
   * Finds drivers near a specific coordinate within a given H3 ring radius.
   * Filters out stale drivers and drivers who are not AVAILABLE.
   *
   * @param lat Latitude
   * @param lng Longitude
   * @param radiusRings Search radius in H3 rings
   * @returns Array of nearby drivers with driverId
   */
  async getNearbyDrivers(
    lat: number,
    lng: number,
    radiusRings: number,
  ): Promise<Array<{ driverId: string }>> {
    const coords = Coordinates.create({ latitude: lat, longitude: lng });
    const centerCell = this.geoGridService.cellFromCoordinates(coords, this.H3_RESOLUTION);

    // 1. Determine target cells using H3
    const cellsToSearch = this.geoGridService.getNeighbors(centerCell, radiusRings);

    // 2. Query DriverGeoIndex for candidates
    const candidateIds = await this.driverGeoIndex.findDrivers(cellsToSearch);

    if (candidateIds.length === 0) {
      return [];
    }

    // 3. Filter stale drivers (check active TTL)
    const activeKeys = candidateIds.map((id) => `driver:location:active:${id}`);
    const activeStatus = await redis.mget(...activeKeys);

    const activeCandidateIds = candidateIds.filter((_, index) => activeStatus[index] !== null);

    if (activeCandidateIds.length === 0) {
      return [];
    }

    // 4. Filter by DriverStatus.AVAILABLE from the domain
    const drivers = await this.driverRepository.findByIds(activeCandidateIds);
    const availableDrivers = drivers.filter((d) => d.status === DriverStatus.AVAILABLE);

    return availableDrivers.map((driver) => ({
      driverId: driver.id,
    }));
  }
}
