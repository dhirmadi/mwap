/**
 * API path constants to ensure consistency
 */
export const API_PATHS = {
  // Tenant endpoints
  TENANT: {
    CREATE: '/v1/tenant',
    CURRENT: '/v1/tenant/me',
    UPDATE: (id: string) => `/v1/tenant/${id}`,
    ARCHIVE: (id: string) => `/v1/tenant/${id}/archive`,
    INTEGRATIONS: {
      LIST: (id: string) => `/v1/tenant/${id}/integrations`,
      ADD: (id: string) => `/v1/tenant/${id}/integrations`,
      REMOVE: (id: string, provider: string) => `/v1/tenant/${id}/integrations/${provider}`,
    },
  },

  // Project endpoints
  PROJECT: {
    LIST: '/v1/projects',
    CREATE: '/v1/projects',
    GET: (id: string) => `/v1/projects/${id}`,
    UPDATE: (id: string) => `/v1/projects/${id}`,
    DELETE: (id: string) => `/v1/projects/${id}`,
    ROLE: (id: string) => `/v1/projects/${id}/role`,
    MEMBERS: {
      LIST: (id: string) => `/v1/projects/${id}/members`,
      UPDATE: (id: string, userId: string) => `/v1/projects/${id}/members/${userId}`,
      REMOVE: (id: string, userId: string) => `/v1/projects/${id}/members/${userId}`,
    },
  },

  // Auth endpoints
  AUTH: {
    PROFILE: '/v1/auth/me',
    REFRESH: '/v1/auth/refresh',
  },

  // Invite endpoints
  INVITE: {
    CREATE: '/v1/invites',
    REDEEM: '/v1/invites/redeem',
  },

  // Admin endpoints
  ADMIN: {
    TENANTS: '/v1/admin/tenants',
    PROJECTS: '/v1/admin/projects',
    ARCHIVE_TENANT: (id: string) => `/v1/admin/tenant/${id}/archive`,
  },
} as const;