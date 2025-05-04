/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

import logger, { log } from './config';

// Test basic logging
logger.info('Server started', { port: 3000 });

// Test with complex object
logger.debug('Configuration loaded', {
  database: {
    host: 'localhost',
    port: 5432,
    options: {
      ssl: true,
      timeout: 5000
    }
  }
});

// Test with error
logger.error('Database connection failed', {
  error: new Error('Connection timeout'),
  retries: 3
});

// Test with special characters
logger.warn('Invalid input received', {
  'user-id': 'test@example.com',
  'status code': 400,
  'error message': 'Invalid characters in input: !@#$%'
});

// Test with arrays
logger.info('Tasks processed', {
  taskIds: [1, 2, 3, 4, 5],
  status: ['completed', 'failed', 'pending']
});

// Test with null and undefined
logger.info('Partial data', {
  id: 123,
  name: null,
  description: undefined,
  status: 'active'
});

// Test with circular reference
const circular: any = { name: 'test' };
circular.self = circular;
logger.info('Circular object', { data: circular });

// Test with multiple metadata levels
logger.info('User action', {
  user: {
    id: 123,
    name: 'Test User',
    roles: ['admin', 'user']
  },
  action: {
    type: 'login',
    timestamp: new Date(),
    details: {
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0'
    }
  }
});