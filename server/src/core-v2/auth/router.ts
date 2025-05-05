import { Router } from 'express';
import { 
  jwtCheck, 
  requireAuth, 
  requireRoles, 
  requireTenantOwner 
} from './index';
import { SystemRole } from './types';

// Centralized router middleware factory
export class RouterAuth {
  // Basic authenticated route
  static authenticated(): Router {
    const router = Router();
    router.use(jwtCheck);
    router.use(requireAuth());
    return router;
  }

  // Role-based route
  static withRoles(roles: SystemRole[]): Router {
    const router = this.authenticated();
    router.use(requireRoles(roles));
    return router;
  }

  // Tenant owner route
  static tenantOwner(): Router {
    const router = this.authenticated();
    router.use(requireTenantOwner);
    return router;
  }

  // Admin-only route
  static adminOnly(): Router {
    return this.withRoles(['ADMIN', 'SUPER_ADMIN']);
  }

  // Super admin route
  static superAdminOnly(): Router {
    return this.withRoles(['SUPER_ADMIN']);
  }
}

// Convenience export
export const { authenticated, withRoles, tenantOwner, adminOnly, superAdminOnly } = RouterAuth;