/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

import { Router } from 'express';
import { listFolders } from '../controllers/folders.controller';
import { validateProvider, validateProviderCapability } from '../middleware/validate-provider';

const router = Router({ mergeParams: true });

router.get('/', validateProvider, validateProviderCapability('folderListing'), listFolders);

export default router;