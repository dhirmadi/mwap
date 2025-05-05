/**
 * Utility to mock environment variables for testing
 */
export const mockEnv = (overrides: Record<string, string>) => {
  const originalEnv = process.env;
  
  beforeEach(() => {
    process.env = { ...originalEnv, ...overrides };
  });

  afterEach(() => {
    process.env = originalEnv;
  });
};

/**
 * Clear specific environment variables
 */
export const clearEnv = (keys: string[]) => {
  const originalEnv = process.env;
  
  beforeEach(() => {
    process.env = { ...originalEnv };
    keys.forEach(key => delete process.env[key]);
  });

  afterEach(() => {
    process.env = originalEnv;
  });
};