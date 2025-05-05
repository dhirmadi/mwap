import { EventEmitter } from 'events';
import type { Redis } from 'ioredis';

export class MockRedis extends EventEmitter implements Partial<Redis> {
  private store: Map<string, string>;
  private connected: boolean;

  constructor() {
    super();
    this.store = new Map();
    this.connected = true;
    this.emit('connect');
    this.emit('ready');
  }

  async get(key: string): Promise<string | null> {
    if (!this.connected) {
      throw new Error('Redis connection closed');
    }
    return this.store.get(key) || null;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK'> {
    if (!this.connected) {
      throw new Error('Redis connection closed');
    }
    this.store.set(key, value);
    if (mode === 'EX' && duration) {
      setTimeout(() => {
        this.store.delete(key);
      }, duration * 1000);
    }
    return 'OK';
  }

  async del(key: string): Promise<number> {
    if (!this.connected) {
      throw new Error('Redis connection closed');
    }
    const existed = this.store.delete(key);
    return existed ? 1 : 0;
  }

  async flushall(): Promise<'OK'> {
    if (!this.connected) {
      throw new Error('Redis connection closed');
    }
    this.store.clear();
    return 'OK';
  }

  disconnect(): void {
    if (this.connected) {
      this.connected = false;
      this.emit('close');
    }
  }

  reconnect(): void {
    if (!this.connected) {
      this.connected = true;
      this.emit('connect');
      this.emit('ready');
    }
  }

  simulateError(error: Error): void {
    if (this.connected) {
      this.connected = false;
      this.emit('error', error);
    }
  }
}

export const createMockRedis = () => {
  const mockRedis = new MockRedis();

  jest.mock('ioredis', () => {
    return jest.fn().mockImplementation(() => mockRedis);
  }, { virtual: true });

  return mockRedis;
};