import { TenantRole } from '../types/tenant.types';
import { useTenantMembers } from '../hooks/useTenantMembers';

interface MemberListProps {
  tenantId: string;
  userRole: TenantRole;
}

const RoleBadge = ({ role }: { role: TenantRole }) => {
  const colors = {
    admin: 'bg-purple-100 text-purple-800',
    deputy: 'bg-blue-100 text-blue-800',
    contributor: 'bg-green-100 text-green-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[role]}`}>
      {role}
    </span>
  );
};

export const MemberList = ({ tenantId, userRole }: MemberListProps) => {
  const { members, isLoading, error } = useTenantMembers(tenantId, userRole);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 my-4">
        <div className="text-sm text-red-700">
          Error loading members: {error}
        </div>
      </div>
    );
  }

  if (!members.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No members found
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {members.map((member) => (
          <li key={member.userId}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="truncate">
                  <div className="flex items-center">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {member.name || 'Unnamed User'}
                    </p>
                    <div className="ml-2">
                      <RoleBadge role={member.role} />
                    </div>
                  </div>
                  <p className="mt-1 truncate text-sm text-gray-500">
                    {member.email}
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};