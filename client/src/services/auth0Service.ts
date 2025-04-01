import { User } from '@auth0/auth0-react';

export interface Auth0Claims {
  'https://mwap.local/roles'?: string[];
  'https://mwap.local/permissions'?: string[];
}

export interface ExtendedAuth0User extends User {
  'https://mwap.local/roles'?: string[];
  'https://mwap.local/permissions'?: string[];
}

export interface Auth0UserData {
  id: string;
  email: string;
  name: string;
  picture?: string;
  roles: string[];
  permissions: string[];
  emailVerified: boolean;
  lastLogin: string;
}

export const extractAuth0UserData = (user: ExtendedAuth0User): Auth0UserData => {
  return {
    id: user.sub,
    email: user.email!,
    name: user.name!,
    picture: user.picture,
    roles: user['https://mwap.local/roles'] || [],
    permissions: user['https://mwap.local/permissions'] || [],
    emailVerified: user.email_verified!,
    lastLogin: user.updated_at!,
  };
};

export const hasPermission = (user: Auth0UserData, permission: string): boolean => {
  return user.permissions.includes(permission);
};

export const hasRole = (user: Auth0UserData, role: string): boolean => {
  return user.roles.includes(role);
};

export const canEditProfile = (user: Auth0UserData): boolean => {
  return hasPermission(user, 'update:profile') || hasRole(user, 'admin');
};

export const getAuth0ManagementUrl = (domain: string, userId: string): string => {
  return `https://${domain}/account?section=profile`;
};