import { Router } from 'express';
import { initCoreV2 } from '../core-v2/init';

// Import v2 feature routers
import { createTenantRouter } from '../features-v2/tenants';
import { createProjectRouter } from '../features-v2/projects';
import { createInviteRouter } from '../features-v2/invites';
import { createProjectTypeRouter } from '../features-v2/project-types';

// Create and configure v2 router
const router = Router();

// Initialize core v2 middleware
initCoreV2(router);

// Mount feature routes
router.use('/tenants', createTenantRouter());
router.use('/projects', createProjectRouter());
router.use('/invites', createInviteRouter());
router.use('/project-types', createProjectTypeRouter());

export default router;