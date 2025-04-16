import { Router } from 'express';
import { tenantRoutes } from '@features/tenant/routes';
import { projectRoutes } from '@features/projects/routes';
import { userRoutes } from '@features/users/routes';
import { inviteRoutes } from '@features/invites/routes';
import { adminRoutes } from '@features/superadmin/routes';

const router = Router();

router.use('/tenant', tenantRoutes);
router.use('/projects', projectRoutes);
router.use('/users', userRoutes);
router.use('/invites', inviteRoutes);
router.use('/admin', adminRoutes);

export { router };
