import { Router } from 'express';
import { InviteController } from '../controllers/invite.controller';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

// Tenant invitation management
router.post('/tenants/:tenantId/invite', asyncHandler(InviteController.generateInvite));
router.post('/tenants/join', asyncHandler(InviteController.joinTenant));
router.get('/tenants/:tenantId/members', asyncHandler(InviteController.listMembers));

export const inviteRoutes = router;