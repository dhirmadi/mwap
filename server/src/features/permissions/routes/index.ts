import { Router } from 'express';
import { validateToken } from '@core/middleware/auth/validateToken';
import { PermissionController } from '../controllers';

const router = Router();

// Get user permissions for a tenant
router.get('/', validateToken, PermissionController.getPermissions);

export default router;