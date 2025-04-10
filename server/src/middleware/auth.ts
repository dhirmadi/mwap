import { auth } from 'express-oauth2-jwt-bearer';
import { env } from '../config/environment';

if (!env.auth0.domain || !env.auth0.audience) {
  throw new Error('Auth0 configuration is missing. Please check environment variables.');
}

const authConfig = {
  audience: env.auth0.audience,
  issuer: `https://${env.auth0.domain}/`,
  jwksUri: `https://${env.auth0.domain}/.well-known/jwks.json`,
  tokenSigningAlg: 'RS256'
};

export const checkJwt = auth(authConfig);