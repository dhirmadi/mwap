import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import tenantService, { Tenant, TenantMember } from '../services/tenantService';

interface TenantContextType {
  currentTenant: Tenant | null;
  userRole: string | null;
  isSuperAdmin: boolean;
  tenants: Tenant[];
  members: TenantMember[];
  setCurrentTenant: (tenant: Tenant | null) => void;
  loadTenants: () => Promise<void>;
  loadMembers: () => Promise<void>;
  addMember: (email: string, role: string) => Promise<void>;
  updateMemberRole: (userId: string, role: string) => Promise<void>;
  removeMember: (userId: string) => Promise<void>;
  handleJoinRequest: (userId: string, action: 'approve' | 'reject') => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth0();
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [members, setMembers] = useState<TenantMember[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Load user's tenants
  useEffect(() => {
    if (isAuthenticated && user) {
      loadTenants();
    }
  }, [isAuthenticated, user]);

  // Load members when tenant changes
  useEffect(() => {
    if (currentTenant) {
      loadMembers();
    }
  }, [currentTenant]);

  const loadTenants = async () => {
    try {
      const fetchedTenants = await tenantService.getAllTenants();
      setTenants(fetchedTenants);

      // Check if user is super admin based on response success
      setIsSuperAdmin(true);
    } catch (error) {
      // If getting all tenants fails, user is not super admin
      setIsSuperAdmin(false);
      console.error('Error loading tenants:', error);
    }
  };

  const loadMembers = async () => {
    if (!currentTenant) return;

    try {
      const fetchedMembers = await tenantService.getTenantMembers(currentTenant._id);
      setMembers(fetchedMembers);

      // Set user's role in current tenant
      if (user) {
        const currentUser = fetchedMembers.find(m => m.email === user.email);
        setUserRole(currentUser?.membership.role || null);
      }
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const addMember = async (email: string, role: string) => {
    if (!currentTenant) return;

    try {
      await tenantService.addTenantMember(currentTenant._id, { email, role });
      await loadMembers();
    } catch (error) {
      console.error('Error adding member:', error);
      throw error;
    }
  };

  const updateMemberRole = async (userId: string, role: string) => {
    if (!currentTenant) return;

    try {
      await tenantService.updateMemberRole(currentTenant._id, userId, role);
      await loadMembers();
    } catch (error) {
      console.error('Error updating member role:', error);
      throw error;
    }
  };

  const removeMember = async (userId: string) => {
    if (!currentTenant) return;

    try {
      await tenantService.removeMember(currentTenant._id, userId);
      await loadMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  };

  const handleJoinRequest = async (userId: string, action: 'approve' | 'reject') => {
    if (!currentTenant) return;

    try {
      await tenantService.handleJoinRequest(currentTenant._id, userId, action);
      await loadMembers();
    } catch (error) {
      console.error('Error handling join request:', error);
      throw error;
    }
  };

  return (
    <TenantContext.Provider
      value={{
        currentTenant,
        userRole,
        isSuperAdmin,
        tenants,
        members,
        setCurrentTenant,
        loadTenants,
        loadMembers,
        addMember,
        updateMemberRole,
        removeMember,
        handleJoinRequest,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};