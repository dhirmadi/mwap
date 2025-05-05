import { v4 as uuid } from 'uuid';
import { UserIdentity } from '../auth/userIdentity';

export interface MockUserOptions {
  sub?: string;
  email?: string;
  name?: string;
  roles?: string[];
}

export function createMockUser(options: MockUserOptions = {}) {
  const defaultSub = `auth0|test-${uuid()}`;
  const sub = options.sub || defaultSub;

  // Validate the generated sub
  if (!UserIdentity.validate(sub)) {
    throw new Error(`Invalid mock user sub: ${sub}`);
  }

  return {
    sub,
    email: options.email || `${sub.split('|')[1]}@example.com`,
    name: options.name || 'Test User',
    roles: options.roles || [],
    _id: sub, // Backward compatibility for legacy code
  };
}

export function createMockUsers(count: number = 1, baseOptions: MockUserOptions = {}) {
  return Array.from({ length: count }, (_, index) => 
    createMockUser({
      ...baseOptions,
      sub: baseOptions.sub || `auth0|test-${uuid()}-${index}`,
      email: baseOptions.email || `test-${index}@example.com`
    })
  );
}