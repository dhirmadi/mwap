import { Router } from 'express';
import { auth } from '@core/middleware/auth';
import { PermissionController } from '../controllers';

const router = Router();

// Get user permissions for a tenant
router.get('/', auth.validateRequest, PermissionController.getPermissions);

export default router;