import { injectable, inject } from 'tsyringe';
import { RedisStore, type RedisReply } from 'rate-limit-redis';
import { InfrastructureTokens } from '../container/tokens/index.js';
import { Redis } from 'ioredis';
import { IRateLimitPolicy } from '../../shared/types/RateLimitPolicy.interface.js';
import { rateLimit, type RateLimitRequestHandler } from 'express-rate-limit';

@injectable()
export class RateLimitService {
  constructor(
    @inject(InfrastructureTokens.RedisClient)
    private readonly redis: Redis,
  ) {}

  createLimiter(policy: IRateLimitPolicy, prefix: string): RateLimitRequestHandler {
    return rateLimit({
      windowMs: policy.windowMs,
      max: policy.max,
      standardHeaders: true,
      legacyHeaders: false,
      store: new RedisStore({
        prefix: prefix + ':',
        sendCommand: (command: string, ...args: string[]) =>
          this.redis.call(command, ...args) as Promise<RedisReply>,
      }),
      skipSuccessfulRequests: true,
      identifier: prefix,
      message: {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.',
        },
      },
    });
  }
}
