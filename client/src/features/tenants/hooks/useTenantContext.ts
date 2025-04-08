import { useMemo } from 'react';

type TenantRole = 'admin' | 'deputy' | 'contributor' | null;

interface TenantContext {
  tenantId: string | null;
  tenantName: string | null;
  role: TenantRole;
  isAdmin: boolean;
  isDeputy: boolean;
  isContributor: boolean;
  isSuperAdmin: boolean;
}

/**
 * Hook to access tenant context information from localStorage
 * @returns TenantContext object containing tenant and role information
 */
export function useTenantContext(): TenantContext {
  return useMemo(() => {
    // Read values from localStorage
    const tenantId = localStorage.getItem('currentTenantId');
    const tenantName = localStorage.getItem('currentTenantName');
    const role = localStorage.getItem('currentTenantRole') as TenantRole;
    const isSuperAdminFlag = localStorage.getItem('isSuperAdmin') === 'true';

    // Determine role flags
    const isAdmin = role === 'admin';
    const isDeputy = role === 'deputy';
    const isContributor = role === 'contributor';

    // Super admin is determined by the flag and no active tenant context
    const isSuperAdmin = isSuperAdminFlag && !tenantId;

    return {
      tenantId,
      tenantName,
      role,
      isAdmin,
      isDeputy,
      isContributor,
      isSuperAdmin,
    };
  }, []); // Empty dependency array since we only read from localStorage
}