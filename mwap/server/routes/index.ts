import { Router } from 'express';
import { router as tenantRouter } from '../features/tenant/routes';
import { router as projectsRouter } from '../features/projects/routes';
import { router as invitesRouter } from '../features/invites/routes';
import { router as superadminRouter } from '../features/superadmin/routes';

const router = Router();

router.use('/tenant', tenantRouter);
router.use('/projects', projectsRouter);
router.use('/invites', invitesRouter);
router.use('/admin', superadminRouter);

export default router;