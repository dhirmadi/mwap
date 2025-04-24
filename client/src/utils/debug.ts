/**
 * @fileoverview Debug utilities for development
 * @module utils/debug
 */

const DEBUG = process.env.NODE_ENV === 'development';

/**
 * Log debug messages in development only
 */
export const debug = {
  log: (...args: unknown[]) => {
    if (DEBUG) console.log('[DEBUG]', ...args);
  },
  warn: (...args: unknown[]) => {
    if (DEBUG) console.warn('[WARN]', ...args);
  },
  error: (...args: unknown[]) => {
    if (DEBUG) console.error('[ERROR]', ...args);
  },
  info: (...args: unknown[]) => {
    if (DEBUG) console.info('[INFO]', ...args);
  },
  group: (label: string) => {
    if (DEBUG) console.group(`[GROUP] ${label}`);
  },
  groupEnd: () => {
    if (DEBUG) console.groupEnd();
  },
  time: (label: string) => {
    if (DEBUG) console.time(`[TIME] ${label}`);
  },
  timeEnd: (label: string) => {
    if (DEBUG) console.timeEnd(`[TIME] ${label}`);
  }
};