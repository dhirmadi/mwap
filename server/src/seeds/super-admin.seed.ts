import { SuperAdmin } from '../models/super-admin.model';
import { logger } from '../utils/logger';

export async function seedSuperAdmin() {
  try {
    const superAdminId = '100058725052231554534';
    
    // Check if super admin already exists
    const existingSuperAdmin = await SuperAdmin.findOne({ auth0Id: superAdminId });
    
    if (!existingSuperAdmin) {
      // Create the super admin
      await SuperAdmin.create({
        auth0Id: superAdminId,
        createdAt: new Date()
      });
      logger.info('Super admin seeded successfully', { auth0Id: superAdminId });
    } else {
      logger.info('Super admin already exists', { auth0Id: superAdminId });
    }
  } catch (error) {
    logger.error('Error seeding super admin:', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}