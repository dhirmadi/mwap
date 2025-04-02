// Mock mongoose for tests
jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue(true),
  disconnect: jest.fn().mockResolvedValue(true),
  connection: {
    collections: {},
  },
}));

beforeAll(() => {
  // Global test setup
  jest.clearAllMocks();
});

afterAll(() => {
  // Global test cleanup
  jest.clearAllMocks();
});