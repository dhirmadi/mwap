import { auth } from 'express-oauth2-jwt-bearer';
import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  auth?: {
    sub: string;
    [key: string]: any;
  };
}

export const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  tokenSigningAlg: 'RS256'
});