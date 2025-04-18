import { Router } from 'express';
import { validateRequest } from '@core/middleware';
import { getIntegrations, addIntegration, deleteIntegration } from '../controllers/integrations.controller';
import { addIntegrationSchema } from '../schemas/validation';
import folderRoutes from './folders.routes';

const router = Router({ mergeParams: true });

// Integration management routes
router.get('/', getIntegrations);
router.post('/', validateRequest(addIntegrationSchema), addIntegration);
router.delete('/:provider', deleteIntegration);

// Folder routes - mounted under /:provider/folders
router.use('/:provider/folders', folderRoutes);

export default router;