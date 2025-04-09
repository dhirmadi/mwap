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
    
    // Get isSuperAdmin directly from localStorage, default to false
    let isSuperAdmin = false;
    try {
      const storedValue = localStorage.getItem('isSuperAdmin');
      if (storedValue !== null) {
        isSuperAdmin = JSON.parse(storedValue);
        // Ensure boolean type
        isSuperAdmin = Boolean(isSuperAdmin);
      }
    } catch (error) {
      console.error('Error parsing isSuperAdmin from localStorage:', error);
      // Keep default false value
    }

    // Determine role flags for tenant context
    const isAdmin = role === 'admin';
    const isDeputy = role === 'deputy';
    const isContributor = role === 'contributor';

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