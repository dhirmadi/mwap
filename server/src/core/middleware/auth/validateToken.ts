import { Request, Response, NextFunction } from 'express';
import { auth } from 'express-oauth2-jwt-bearer';
import { config } from '../../../config';

// Validate JWT using Auth0's express-oauth2-jwt-bearer
export const validateToken = auth({
  audience: config.auth.audience,
  issuerBaseURL: config.auth.issuer,
  tokenSigningAlg: 'RS256'
});