import { checkApiHealth } from '../../app/health.service.js';
import { checkRedisHealth } from '../cache/health.js';
import { checkDatabaseHealth } from '../database/health.js';

export const getHealthStatus = async () => {
  const [api, database, redis] = await Promise.all([
    checkApiHealth(),
    checkDatabaseHealth(),
    checkRedisHealth(),
  ]);

  return {
    api,
    database,
    redis,
  };
};
