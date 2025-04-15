import { Router } from 'express';
import { router as tenantRoutes } from '@features/tenant/routes';
import { router as projectRoutes } from '@features/projects/routes';
import { router as userRoutes } from '@features/users/routes';
import { router as inviteRoutes } from '@features/invites/routes';
import { router as adminRoutes } from '@features/superadmin/routes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes
router.use('/tenant', tenantRoutes);
router.use('/projects', projectRoutes);
router.use('/users', userRoutes);
router.use('/invites', inviteRoutes);
router.use('/admin', adminRoutes);

export { router };