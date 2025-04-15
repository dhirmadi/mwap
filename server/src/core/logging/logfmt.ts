import { format } from 'winston';

/**
 * Sanitize a key for logfmt format
 * - Convert to lowercase
 * - Replace spaces and special chars with underscores
 * - Remove invalid characters
 */
const sanitizeKey = (key: string): string => {
  return key
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

/**
 * Stringify a value for logfmt format
 * - Strings with spaces are quoted
 * - Objects are JSON stringified
 * - Arrays are JSON stringified
 * - Other values converted to string
 */
const stringifyValue = (value: unknown): string => {
  if (value === undefined || value === null) {
    return '';
  }

  if (value instanceof Error) {
    return `"${value.message.replace(/"/g, '\\"')}${value.stack ? ' ' + value.stack.replace(/"/g, '\\"') : ''}"`;
  }

  if (typeof value === 'string') {
    // Quote strings containing spaces or special characters
    return /[\s="']/.test(value) ? `"${value.replace(/"/g, '\\"')}"` : value;
  }

  if (typeof value === 'object') {
    try {
      const str = JSON.stringify(value);
      return `"${str.replace(/"/g, '\\"')}"`;
    } catch (err) {
      return '"[Circular]"';
    }
  }

  return String(value);
};

/**
 * Convert an object to logfmt format
 * timestamp=2025-04-15T18:30:00.000Z level=info message="User logged in" user_id=123
 */
const objectToLogfmt = (obj: Record<string, unknown>): string => {
  const pairs: string[] = [];

  // Process timestamp first if exists
  if ('timestamp' in obj) {
    pairs.push(`timestamp=${stringifyValue(obj.timestamp)}`);
    delete obj.timestamp;
  }

  // Process level next if exists
  if ('level' in obj) {
    pairs.push(`level=${stringifyValue(obj.level)}`);
    delete obj.level;
  }

  // Process message next if exists
  if ('message' in obj) {
    pairs.push(`message=${stringifyValue(obj.message)}`);
    delete obj.message;
  }

  // Process remaining fields
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      pairs.push(`${sanitizeKey(key)}=${stringifyValue(value)}`);
    }
  }

  return pairs.join(' ');
};

/**
 * Create a logfmt formatter for Winston
 */
export const logfmtFormat = format((info) => {
  // Extract error stack if present
  if (info instanceof Error) {
    info.stack = info.stack;
  }

  // Convert the info object to logfmt format
  const logfmt = objectToLogfmt({
    timestamp: info.timestamp || new Date().toISOString(),
    level: info.level,
    message: info.message,
    ...info.meta,
    ...(info.stack ? { error_stack: info.stack } : {}),
  });

  // Assign the formatted string to the message property
  info[Symbol.for('message')] = logfmt;

  return info;
});