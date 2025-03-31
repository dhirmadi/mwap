import api from './api';

export interface Tenant {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  settings: {
    allowPublicRegistration: boolean;
    requireAdminApproval: boolean;
    defaultUserRole: 'editor' | 'user';
  };
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
}

export interface TenantMember {
  id: string;
  name: string;
  email: string;
  picture?: string;
  membership: {
    role: 'admin' | 'editor' | 'user';
    status: 'pending' | 'approved';
    approvedAt?: string;
    approvedBy?: string;
  };
}

export interface TenantMembershipRequest {
  tenantId: string;
  role: 'editor' | 'user';
}

const tenantService = {
  // Get all tenants (super admin only)
  getAllTenants: async (): Promise<Tenant[]> => {
    const response = await api.get('/tenants');
    return response.data;
  },

  // Get tenant details
  getTenant: async (tenantId: string): Promise<Tenant> => {
    const response = await api.get(`/tenants/${tenantId}`);
    return response.data;
  },

  // Create new tenant (super admin only)
  createTenant: async (data: {
    name: string;
    adminEmail: string;
    description?: string;
    settings?: Partial<Tenant['settings']>;
  }): Promise<Tenant> => {
    const response = await api.post('/tenants', data);
    return response.data;
  },

  // Update tenant
  updateTenant: async (tenantId: string, data: Partial<Tenant>): Promise<Tenant> => {
    const response = await api.patch(`/tenants/${tenantId}`, data);
    return response.data;
  },

  // Get tenant members
  getTenantMembers: async (tenantId: string): Promise<TenantMember[]> => {
    const response = await api.get(`/tenants/${tenantId}/members`);
    return response.data;
  },

  // Add member to tenant
  addTenantMember: async (tenantId: string, data: {
    email: string;
    role: 'admin' | 'editor' | 'user';
  }): Promise<{ message: string; membership: TenantMember['membership'] }> => {
    const response = await api.post(`/tenants/${tenantId}/members`, data);
    return response.data;
  },

  // Update member role
  updateMemberRole: async (tenantId: string, userId: string, role: string): Promise<{
    message: string;
    membership: TenantMember['membership'];
  }> => {
    const response = await api.patch(`/tenants/${tenantId}/members/${userId}`, { role });
    return response.data;
  },

  // Remove member from tenant
  removeMember: async (tenantId: string, userId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/tenants/${tenantId}/members/${userId}`);
    return response.data;
  },

  // Request to join tenant
  requestToJoin: async (tenantId: string): Promise<{
    message: string;
    membership: TenantMember['membership'];
  }> => {
    const response = await api.post(`/tenants/${tenantId}/join`);
    return response.data;
  },

  // Handle join request (approve/reject)
  handleJoinRequest: async (
    tenantId: string,
    userId: string,
    action: 'approve' | 'reject'
  ): Promise<{
    message: string;
    membership?: TenantMember['membership'];
  }> => {
    const response = await api.post(`/tenants/${tenantId}/requests/${userId}`, { action });
    return response.data;
  },
};

export default tenantService;