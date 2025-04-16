import { Router } from 'express';
import { tenantRoutes } from '@features/tenant/routes';
import { projectRoutes } from '@features/projects/routes';
import { userRoutes } from '@features/users/routes';
import { inviteRoutes } from '@features/invites/routes';
import { adminRoutes } from '@features/superadmin/routes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
// Mount tenant routes without additional prefix since tenant routes already handle their paths
router.use(tenantRoutes);
router.use('/projects', projectRoutes);
router.use('/users', userRoutes);
router.use('/invites', inviteRoutes);
router.use('/admin', adminRoutes);

export { router };