import { Router } from 'express';
import { InviteController } from './controller';
import { requireAuth } from '@core/middleware/auth';
import { requireTenantOwner } from '@core/middleware/auth/requireTenantOwner';

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