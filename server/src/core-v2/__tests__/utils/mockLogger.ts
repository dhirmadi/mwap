import type { Logger } from 'winston';

export const createMockLogger = () => {
  const mockLogger: Partial<Logger> = {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  };

  return mockLogger as Logger;
};

export const mockLoggerFactory = () => {
  const mockLogger = createMockLogger();

  jest.mock('../../logger', () => ({
    logger: mockLogger,
  }));

  return mockLogger;
};