import { Router } from 'express';
import { SystemController } from './controller';

const router = Router();

// Public system endpoints
router.get('/status', SystemController.getSystemStatus);
router.get('/features', SystemController.getSystemFeatures);
router.get('/version', SystemController.getSystemVersion);

export default router;