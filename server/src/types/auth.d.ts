import { Request } from 'express';

import { VerifyJwtResult } from 'express-oauth2-jwt-bearer';

declare global {
  namespace Express {
    interface Request {
      auth?: VerifyJwtResult & {
        sub: string;
        email: string;
        name: string;
        picture: string;
      };
    }
  }
}