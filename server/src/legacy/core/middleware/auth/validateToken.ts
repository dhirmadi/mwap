/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

import { auth as auth0 } from 'express-oauth2-jwt-bearer';
import { env } from '@core/config/environment';

const authConfig = {
  audience: env.auth0.audience,
  issuer: `https://${env.auth0.domain}/`,
  jwksUri: `https://${env.auth0.domain}/.well-known/jwks.json`,
  tokenSigningAlg: 'RS256'
};

export const validateToken = auth0(authConfig);