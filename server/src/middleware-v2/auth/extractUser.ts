import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { AppError } from '../../core-v2/errors'; // Assuming this exists in the legacy code

// Type definitions
export interface MWAPUser {
  sub: string;
  email: string;
  roles: string[];
  tenantId?: string;
}

// Extend Express Request type to include our user
declare global {
  namespace Express {
    interface Request {
      user?: MWAPUser;
    }
  }
}

// Initialize JWKS client
const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
});

// Get signing key from JWKS endpoint
const getSigningKey = async (kid: string): Promise<string> => {
  try {
    const key = await client.getSigningKey(kid);
    return key.getPublicKey();
  } catch (error) {
    throw new AppError('Failed to fetch signing key', 'AUTH_KEY_ERROR', 500);
  }
};

// Extract and validate JWT token
const extractUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('No token provided', 'AUTH_NO_TOKEN', 401);
    }

    const token = authHeader.split(' ')[1];
    
    // Decode token without verification to get the key ID
    const decoded = jwt.decode(token, { complete: true });
    
    if (!decoded || typeof decoded === 'string' || !decoded.header.kid) {
      throw new AppError('Invalid token format', 'AUTH_INVALID_TOKEN', 401);
    }

    // Get the signing key
    const publicKey = await getSigningKey(decoded.header.kid);

    // Verify and decode the token
    const verified = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
      audience: process.env.AUTH0_AUDIENCE,
    }) as jwt.JwtPayload;

    // Extract required user fields
    const user: MWAPUser = {
      sub: verified.sub,
      email: verified.email,
      roles: Array.isArray(verified.roles) ? verified.roles : [],
      tenantId: verified.tenantId,
    };

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 'AUTH_INVALID_TOKEN', 401));
    } else {
      next(error instanceof AppError ? error : new AppError('Authentication failed', 'AUTH_ERROR', 500));
    }
  }
};

export default extractUser;