import { DatabaseService } from '../../backend/src/services/database';

describe('DatabaseService Unit Tests', () => {
  describe('Test Mode', () => {
    let testService: DatabaseService;

    beforeAll(() => {
      testService = new DatabaseService(true);
    });

    test('should create DatabaseService in test mode', () => {
      expect(testService).toBeDefined();
    });

    test('should return test health check in test mode', async () => {
      const health = await testService.healthCheck();
      
      expect(health.status).toBe('healthy (test mode)');
      expect(health.database).toBe('test');
      expect(health.authenticationType).toBe('test');
    });

    test('should return mock container in test mode', () => {
      const container = testService.getContainer('users');
      expect(container).toBeDefined();
    });

    test('should handle close gracefully', async () => {
      await expect(testService.close()).resolves.toBeUndefined();
    });
  });

  describe('Production Mode (without credentials)', () => {
    test('should throw error when no credentials provided', () => {
      expect(() => {
        new DatabaseService(false);
      }).toThrow('Azure Cosmos DB endpoint is required');
    });
  });
});