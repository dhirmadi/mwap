import { Navigate } from 'react-router-dom';
import { MemberList } from '../features/tenants/components/MemberList';
import { InviteForm } from '../features/tenants/components/InviteForm';
import { TenantRole } from '../features/tenants/types/tenant.types';

export default function TenantMembersPage() {
  // In a real app, you'd get these from context or state management
  const tenantId = localStorage.getItem('currentTenantId');
  const userRole = localStorage.getItem('currentTenantRole') as TenantRole;

  if (!tenantId || !userRole || !['admin', 'deputy'].includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Manage Members
          </h2>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            Current Members
          </h3>
          <MemberList tenantId={tenantId} userRole={userRole} />
        </div>

        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            Invite New Member
          </h3>
          <InviteForm tenantId={tenantId} userRole={userRole} />
        </div>
      </div>
    </div>
  );
};