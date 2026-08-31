import { injectable, inject } from 'tsyringe';
import { InfrastructureTokens } from '../container/index.js';
import { DatabaseService } from '../database/database.service.js';
import { RedisService } from '../cache/redis.service.js';
import { checkApiHealth } from '../../app/health.service.js';

@injectable()
export class HealthService {
  constructor(
    @inject(InfrastructureTokens.DatabaseService) private readonly databaseService: DatabaseService,
    @inject(InfrastructureTokens.RedisService) private readonly redisService: RedisService,
  ) {}

  getHealthStatus = async () => {
    const [api, database, redis] = await Promise.all([
      checkApiHealth(),
      this.databaseService.checkDatabaseHealth(),
      this.redisService.checkRedisHealth(),
    ]);

    return {
      api,
      database,
      redis,
    };
  };
}
