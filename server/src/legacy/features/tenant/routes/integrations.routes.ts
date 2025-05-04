/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

import { Router } from 'express';
import { validateRequest } from '@core/middleware/validation/requestValidation';
import { getIntegrations, addIntegration, deleteIntegration } from '../controllers/integrations.controller';
import { addIntegrationSchema, providerParamSchema } from '../schemas/validation';
import { validateProvider } from '../middleware/validate-provider';
import { extractUser } from '@core/middleware/auth/extractUser';
import { verifyTenantOwner } from '@core/middleware/scoping/verifyTenantOwner';
import folderRoutes from './folders.routes';

const router = Router({ mergeParams: true });

// Middleware chain for tenant owner operations
const requireTenantOwner = [extractUser, verifyTenantOwner];

// Integration management routes
router.get('/', ...requireTenantOwner, getIntegrations);
router.post('/', validateRequest(addIntegrationSchema), validateProvider, ...requireTenantOwner, addIntegration);
router.delete('/:provider', validateRequest(providerParamSchema), validateProvider, ...requireTenantOwner, deleteIntegration);

// Folder routes - mounted under /:provider/folders
router.use('/:provider/folders', validateRequest(providerParamSchema), validateProvider, ...requireTenantOwner, folderRoutes);

export default router;