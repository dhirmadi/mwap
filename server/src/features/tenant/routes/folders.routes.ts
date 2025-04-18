import { Router } from 'express';
import { listFolders } from '../controllers/folders.controller';

const router = Router({ mergeParams: true });

router.get('/', listFolders);

export default router;