/**
 * Type augmentations for Express Request
 * Extends Express.Request with MWAP-specific properties
 */

import type { AuthUser } from './auth';
import type { ProjectRole } from './projects';

declare global {
  namespace Express {
    interface Request {
      /**
       * Authenticated user information
       * Set by auth middleware after token validation
       * @see AuthUser in types-v2/auth.ts
       */
      user: AuthUser;

      /**
       * Validated request data (body/query/params)
       * Set by validation middleware after schema validation
       * @see validateRequest in validation-v2/validateRequest.ts
       */
      validated: {
        body?: Record<string, any>;
        query?: Record<string, any>;
        params?: Record<string, any>;
      };

      /**
       * User's role in the current project context
       * Set by project middleware after role validation
       * @see ProjectRole in types-v2/projects.ts
       */
      projectRole?: ProjectRole;

      /**
       * Request start time for performance tracking
       * Set by performance middleware
       */
      startTime?: number;

      /**
       * Original URL before any rewrites
       * Set by rewrite middleware if URL was modified
       */
      originalUrl?: string;
    }
  }
}