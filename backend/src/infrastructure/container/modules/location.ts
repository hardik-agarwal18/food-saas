import { container } from 'tsyringe';
import { LocationTokens } from '../../../modules/location/infrastructure/tokens/location.tokens.js';
import { H3GeoGridService } from '../../../modules/location/infrastructure/h3/h3-geo-grid.service.js';
import { RedisDriverGeoIndex } from '../../../modules/location/infrastructure/redis/redis-driver-geo-index.js';

export function registerLocationModule() {
  container.registerSingleton(LocationTokens.GeoGridService, H3GeoGridService);
  container.registerSingleton(LocationTokens.DriverGeoIndex, RedisDriverGeoIndex);
}
