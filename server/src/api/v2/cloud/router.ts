import { Router } from 'express';
import { CloudController } from './controller';
import { requireAuth } from '@core-v2/auth';

const router = Router();

// OAuth endpoints (public)
router.post('/oauth/start', CloudController.startOAuth);
router.post('/oauth/callback', CloudController.completeOAuth);

// Protected endpoints
router.get('/folders', requireAuth, CloudController.listFolders);

export default router;