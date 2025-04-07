import { useState, useEffect } from 'react';
import { Member, TenantRole } from '../types/tenant.types';
import { useInviteApi } from '../services/inviteApi';

export const useTenantMembers = (tenantId: string, userRole: TenantRole) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getMembers } = useInviteApi();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedMembers = await getMembers(tenantId);
        
        // If user is deputy, filter out admin members
        const filteredMembers = userRole === 'deputy'
          ? fetchedMembers.filter(member => member.role === 'contributor')
          : fetchedMembers;
        
        setMembers(filteredMembers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch members');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [tenantId, userRole]);

  return { members, isLoading, error };
};