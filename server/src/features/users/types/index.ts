export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
}

import { AuthResult } from 'express-oauth2-jwt-bearer';

export interface Auth0Claims extends Partial<AuthResult> {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
  [key: string]: any; // For other potential Auth0 fields
}