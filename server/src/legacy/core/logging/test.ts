/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

import logger, { log } from './config';

// Test different log levels
logger.error('Test error message', { error: new Error('Test error') });
logger.warn('Test warning message', { code: 'TEST_WARNING' });
logger.info('Test info message', { user: 'test-user' });
logger.debug('Test debug message', { detail: 'debugging info' });

// Test with circular reference
const circular: any = { a: 1 };
circular.self = circular;
log.info('Test circular reference', { data: circular });

// Test with Error object
const error = new Error('Test error with stack');
log.error('Error with stack trace', { error });

// Test with large objects
const largeObject = {
  array: Array(1000).fill('test'),
  nested: {
    deep: {
      deeper: {
        deepest: 'value'
      }
    }
  }
};
log.debug('Large object test', { data: largeObject });