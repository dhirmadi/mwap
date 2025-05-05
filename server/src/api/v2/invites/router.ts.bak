import { Router } from 'express';
import { InviteController } from './controller';
import { requireAuth } from '@core-v2/auth';
import { requireTenantOwner } from '@core-v2/auth/tenantOwner';

// Create router for project-scoped routes
const projectRouter = Router({ mergeParams: true });

// All project routes require authentication and tenant ownership
projectRouter.use(requireAuth);
projectRouter.use(requireTenantOwner);

// Project invite routes
projectRouter.post('/', InviteController.createInvite);
projectRouter.get('/', InviteController.listInvites);

// Create router for public routes
const publicRouter = Router();

// Public redeem route (no auth required)
publicRouter.post('/redeem', InviteController.redeemInvite);

export { projectRouter, publicRouter };