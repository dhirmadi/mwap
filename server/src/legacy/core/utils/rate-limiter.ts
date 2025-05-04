/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

import { AppError } from '@core/errors';
import { logger } from './logger';

export class RateLimiter {
  private requestCount: number = 0;
  private lastResetTime: number = Date.now();

  constructor(
    private readonly requestsPerMinute: number,
    private readonly name: string
  ) {}

  async checkLimit(): Promise<void> {
    const now = Date.now();
    const elapsedMinutes = (now - this.lastResetTime) / (1000 * 60);

    if (elapsedMinutes >= 1) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    if (this.requestCount >= this.requestsPerMinute) {
      logger.warn('Rate limit exceeded', {
        provider: this.name,
        limit: this.requestsPerMinute,
        count: this.requestCount
      });
      throw new AppError(`Rate limit exceeded for ${this.name}`, 429);
    }

    this.requestCount++;
  }
}