import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { H3GeoGridService } from '../../infrastructure/h3/h3-geo-grid.service.js';
import { RedisDriverGeoIndex } from '../../infrastructure/redis/redis-driver-geo-index.js';
import { DriverLocationService } from '../../../delivery/application/services/driver-location.service.js';
import { Coordinates } from '../../domain/value-objects/coordinates.vo.js';

import { LocationIndexUnavailableError } from '../../domain/errors/location.errors.js';
import { redis } from '../../../../config/redis.js';
import { IDriverRepository } from '../../../delivery/domain/repositories/driver.repository.js';
import {
  Driver,
  DriverStatus,
  VehicleType,
} from '../../../delivery/domain/entities/driver.entity.js';

describe('H3 Location Indexing Integration Tests', () => {
  let geoGridService: H3GeoGridService;
  let driverGeoIndex: RedisDriverGeoIndex;
  let driverLocationService: DriverLocationService;
  let mockDriverRepo: IDriverRepository;

  const TEST_RESOLUTION = 8;
  // A point in central London
  const POINT_A = { lat: 51.5074, lng: -0.1278 };
  // A point just far enough to be in a different cell
  const POINT_B = { lat: 51.5174, lng: -0.1178 };
  const POINT_C = { lat: 51.5274, lng: -0.1078 };

  beforeAll(async () => {
    // Setup services
    geoGridService = new H3GeoGridService();
    driverGeoIndex = new RedisDriverGeoIndex(redis);

    // Mock the repo so getNearbyDrivers returns some drivers
    mockDriverRepo = {
      findByIds: async (ids: string[]) => {
        return ids.map((id) =>
          Driver.rehydrate({
            id,
            userId: 'test_user_id',
            firstName: 'Test',
            lastName: 'Driver',
            phone: '+1234567890',
            vehicleType: VehicleType.CAR,
            vehiclePlateNumber: 'XYZ-1234',
            status: DriverStatus.AVAILABLE,
            currentLocation: null,
            lastLocationAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        );
      },
      findById: async (id: string) => null,
      save: async () => {},
      update: async () => {},
    } as any;

    driverLocationService = new DriverLocationService(
      mockDriverRepo,
      geoGridService,
      driverGeoIndex,
    );
  });

  beforeEach(async () => {
    await redis.flushdb();
  });

  afterAll(async () => {
    await redis.quit();
  });

  describe('H3 Cell Correctness', () => {
    it('should correctly resolve k-ring neighbors and cross boundaries', async () => {
      const coordsA = Coordinates.create({ latitude: POINT_A.lat, longitude: POINT_A.lng });
      const cellA = geoGridService.cellFromCoordinates(coordsA, TEST_RESOLUTION);

      const coordsB = Coordinates.create({ latitude: POINT_B.lat, longitude: POINT_B.lng });
      const cellB = geoGridService.cellFromCoordinates(coordsB, TEST_RESOLUTION);

      expect(cellA.index).not.toEqual(cellB.index);

      // Expand k-ring enough to include POINT_B from POINT_A (typically radius 2-3 at res 8)
      const neighbors = geoGridService.getNeighbors(cellA, 5);

      const neighborStrings = neighbors.map((n) => n.index);

      expect(neighborStrings.includes(cellB.index)).toBe(true);
    });
  });

  describe('Atomic Driver Movement', () => {
    it('should cleanly move driver A -> B -> C without leaving traces', async () => {
      const driverId = 'driver_123';

      // Move to A
      await driverLocationService.updateLocation(driverId, POINT_A.lat, POINT_A.lng, 100);

      const coordsA = Coordinates.create({ latitude: POINT_A.lat, longitude: POINT_A.lng });
      const cellA = geoGridService.cellFromCoordinates(coordsA, TEST_RESOLUTION);

      let driversInA = await redis.smembers(`driver:location:cell:${cellA.index}`);
      expect(driversInA).toContain(driverId);

      // Move to B
      await driverLocationService.updateLocation(driverId, POINT_B.lat, POINT_B.lng, 110);

      const coordsB = Coordinates.create({ latitude: POINT_B.lat, longitude: POINT_B.lng });
      const cellB = geoGridService.cellFromCoordinates(coordsB, TEST_RESOLUTION);

      driversInA = await redis.smembers(`driver:location:cell:${cellA.index}`);
      expect(driversInA).not.toContain(driverId);

      let driversInB = await redis.smembers(`driver:location:cell:${cellB.index}`);
      expect(driversInB).toContain(driverId);

      // Move to C
      await driverLocationService.updateLocation(driverId, POINT_C.lat, POINT_C.lng, 120);

      const coordsC = Coordinates.create({ latitude: POINT_C.lat, longitude: POINT_C.lng });
      const cellC = geoGridService.cellFromCoordinates(coordsC, TEST_RESOLUTION);

      driversInB = await redis.smembers(`driver:location:cell:${cellB.index}`);
      expect(driversInB).not.toContain(driverId);

      let driversInC = await redis.smembers(`driver:location:cell:${cellC.index}`);
      expect(driversInC).toContain(driverId);
    });

    it('should handle concurrent location updates properly via Lua script', async () => {
      const driverId = 'driver_concurrent';

      // Event A, B, C fire concurrently but with different timestamps
      // Event B is older than Event C. Event A is oldest.
      const eventA = driverLocationService.updateLocation(driverId, POINT_A.lat, POINT_A.lng, 10);
      const eventB = driverLocationService.updateLocation(driverId, POINT_B.lat, POINT_B.lng, 20);
      const eventC = driverLocationService.updateLocation(driverId, POINT_C.lat, POINT_C.lng, 30);

      await Promise.all([eventB, eventA, eventC]); // Wait for all to resolve in arbitrary execution order

      const coordsA = Coordinates.create({ latitude: POINT_A.lat, longitude: POINT_A.lng });
      const cellA = geoGridService.cellFromCoordinates(coordsA, TEST_RESOLUTION);

      const coordsB = Coordinates.create({ latitude: POINT_B.lat, longitude: POINT_B.lng });
      const cellB = geoGridService.cellFromCoordinates(coordsB, TEST_RESOLUTION);

      const coordsC = Coordinates.create({ latitude: POINT_C.lat, longitude: POINT_C.lng });
      const cellC = geoGridService.cellFromCoordinates(coordsC, TEST_RESOLUTION);

      // Final state must reflect the latest timestamp (Event C)
      const currentCellString = await redis.get(`driver:location:current_cell:${driverId}`);
      expect(currentCellString).toBe(cellC.index);

      // A and B should be completely clean
      const driversInA = await redis.smembers(`driver:location:cell:${cellA.index}`);
      expect(driversInA).not.toContain(driverId);

      const driversInB = await redis.smembers(`driver:location:cell:${cellB.index}`);
      expect(driversInB).not.toContain(driverId);

      const driversInC = await redis.smembers(`driver:location:cell:${cellC.index}`);
      expect(driversInC).toContain(driverId);
    });
  });

  describe('Out-of-order MQTT Events', () => {
    it('should reject stale location updates', async () => {
      const driverId = 'driver_stale';

      // T=100 -> Cell B
      await driverLocationService.updateLocation(driverId, POINT_B.lat, POINT_B.lng, 100);

      // T=90 -> Cell A (Delayed message from the past)
      await driverLocationService.updateLocation(driverId, POINT_A.lat, POINT_A.lng, 90);

      const coordsA = Coordinates.create({ latitude: POINT_A.lat, longitude: POINT_A.lng });
      const cellA = geoGridService.cellFromCoordinates(coordsA, TEST_RESOLUTION);

      const coordsB = Coordinates.create({ latitude: POINT_B.lat, longitude: POINT_B.lng });
      const cellB = geoGridService.cellFromCoordinates(coordsB, TEST_RESOLUTION);

      // Should still be in Cell B
      const currentCellString = await redis.get(`driver:location:current_cell:${driverId}`);
      expect(currentCellString).toBe(cellB.index);

      const driversInA = await redis.smembers(`driver:location:cell:${cellA.index}`);
      expect(driversInA).not.toContain(driverId);
    });
  });

  describe('Redis Failure Resilience', () => {
    it('should throw LocationIndexUnavailableError when Redis is unavailable', async () => {
      // Mock redis pipeline to fail
      const originalMget = redis.mget;
      redis.mget = async () => {
        throw new Error('Redis connection lost');
      };

      await expect(
        driverLocationService.getNearbyDrivers(POINT_A.lat, POINT_A.lng, 1),
      ).rejects.toThrow(LocationIndexUnavailableError);

      // Restore
      redis.mget = originalMget;
    });
  });
});
