// This file should show ESLint errors for legacy imports
import { legacyUtil } from '../core-v2/utils';
import { oldMiddleware } from '../middleware/auth';

// These imports should be allowed
import { logger } from '../logging-v2';
import { AppError } from './errors';

export function testFunction(): void {
  // Using both legacy and v2 imports
  legacyUtil();
  oldMiddleware();
  
  logger.info('Test');
  throw AppError.notFound();
}