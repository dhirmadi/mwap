import mongoose from 'mongoose';
import {
  connectTestDb,
  closeTestDb,
  clearDatabase,
  resetDatabase,
  isDatabaseConnected,
  getDatabaseName,
  getCollectionNames
} from './dbUtils';

describe('Database Utilities', () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await closeTestDb();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe('Connection Management', () => {
    it('should connect to test database', () => {
      expect(isDatabaseConnected()).toBe(true);
      expect(getDatabaseName()).toMatch(/test/i);
    });

    it('should have empty database after clearing', async () => {
      // Create a test collection
      const TestModel = mongoose.model('Test', new mongoose.Schema({
        name: String
      }));

      // Add some data
      await TestModel.create({ name: 'test' });

      // Verify data exists
      const collections = await getCollectionNames();
      expect(collections).toContain('tests');

      // Clear database
      await clearDatabase();

      // Verify data is gone
      const count = await TestModel.countDocuments();
      expect(count).toBe(0);
    });
  });

  describe('Database Reset', () => {
    it('should reset database to clean state', async () => {
      // Create multiple test collections
      const models = ['Test1', 'Test2', 'Test3'].map(name => 
        mongoose.model(name, new mongoose.Schema({ name: String }))
      );

      // Add data to each collection
      await Promise.all(models.map(model => 
        model.create({ name: 'test' })
      ));

      // Verify data exists
      const beforeCollections = await getCollectionNames();
      expect(beforeCollections.length).toBeGreaterThan(0);

      // Reset database
      await resetDatabase();

      // Verify all collections are empty
      await Promise.all(models.map(async model => {
        const count = await model.countDocuments();
        expect(count).toBe(0);
      }));
    });
  });

  describe('Error Handling', () => {
    it('should handle connection errors gracefully', async () => {
      // Close existing connection
      await closeTestDb();

      // Try to clear database without connection
      await expect(clearDatabase()).resolves.not.toThrow();
    });

    it('should handle invalid collection operations', async () => {
      // Create a test model with a unique name
      const modelName = `TestModel${Date.now()}`;
      const TestModel = mongoose.model(modelName, new mongoose.Schema({
        name: { type: String, required: true }
      }));

      // Try to create invalid data (missing required field)
      await expect(TestModel.create({})).rejects.toThrow();

      // Clear should still work
      await expect(clearDatabase()).resolves.not.toThrow();
    });
  });
});