import { useState } from 'react';
import { TenantRole } from '../types/tenant.types';
import { useInviteApi } from '../services/inviteApi';

interface InviteFormProps {
  tenantId: string;
  userRole: TenantRole;
}

export const InviteForm = ({ tenantId, userRole }: InviteFormProps) => {
  const [role, setRole] = useState<Exclude<TenantRole, 'admin'>>('contributor');
  const [expiresInHours, setExpiresInHours] = useState<number>(48);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const { createInvite } = useInviteApi();

  // Only admin can create deputy invites
  const allowedRoles: Exclude<TenantRole, 'admin'>[] = 
    userRole === 'admin' ? ['deputy', 'contributor'] : ['contributor'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInviteCode(null);
    setIsLoading(true);

    try {
      const response = await createInvite(tenantId, {
        role,
        expiresInHours,
      });
      setInviteCode(response.code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invite');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (inviteCode) {
      await navigator.clipboard.writeText(inviteCode);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as Exclude<TenantRole, 'admin'>)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            {allowedRoles.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="expiration" className="block text-sm font-medium text-gray-700">
            Expires In (hours)
          </label>
          <input
            type="number"
            id="expiration"
            value={expiresInHours}
            onChange={(e) => setExpiresInHours(Math.max(1, parseInt(e.target.value)))}
            min="1"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {inviteCode && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex justify-between items-center">
              <code className="text-sm text-green-700">{inviteCode}</code>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
        >
          {isLoading ? 'Generating...' : 'Generate Invite Code'}
        </button>
      </form>
    </div>
  );
};