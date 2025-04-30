import type { HelmetOptions } from 'helmet';
import type { CorsOptions } from 'cors';
import type { Options as RateLimitOptions } from 'express-rate-limit';

export type SecurityConfig = {
  helmet: HelmetOptions;
  cors: CorsOptions;
  rateLimit: RateLimitOptions;
};

export type RateLimiterStore = 'memory' | 'redis';

export interface RedisConfig {
  url: string;
  prefix?: string;
  ttl?: number;
}