import { logger } from '../utils/logger';
import { seedSuperAdmin } from './super-admin.seed';

export async function runSeeds() {
  try {
    logger.info('Starting database seeding...');
    
    // Run all seeds
    await seedSuperAdmin();
    
    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error('Error running seeds:', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}