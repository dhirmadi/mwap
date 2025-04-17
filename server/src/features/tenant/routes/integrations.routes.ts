import { Router } from 'express';
import { validateRequest } from '@core/middleware';
import { getIntegrations, addIntegration, deleteIntegration } from '../controllers/integrations.controller';
import { addIntegrationSchema } from '../schemas/validation';

const router = Router({ mergeParams: true });

router.get('/', getIntegrations);
router.post('/', validateRequest(addIntegrationSchema), addIntegration);
router.delete('/:provider', deleteIntegration);

export default router;